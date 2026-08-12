import Foundation
import Capacitor
import StripeTerminal

// Bridges the web app (Next.js, running inside the WKWebView) to the native
// Stripe Terminal SDK for Tap to Pay on iPhone. JS calls the methods below
// via `Capacitor.Plugins.Terminal.*` (see src/lib/terminal/nativeBridge.ts
// for the JS-side wrapper). No JS npm package needed — Capacitor discovers
// this class automatically because it's @objc and conforms to
// CAPBridgedPlugin, per Capacitor's "Custom Native iOS Code" docs.
//
// NOTE: delegate method names below follow docs.stripe.com/terminal as of
// 2026-08, but this file has not been compiled against the real SDK yet
// (StripeTerminal isn't added to the Xcode project's package dependencies
// yet — see the setup steps). Expect Xcode to flag 1-2 delegate method
// signatures that need a small correction via autocomplete once the SDK
// resolves; Stripe's own docs page had at least one inconsistent method
// name in this same section.
@objc(TerminalPlugin)
public class TerminalPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TerminalPlugin"
    public let jsName = "Terminal"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "provideConnectionToken", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "discoverAndConnect", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "collectAndConfirmPayment", returnType: CAPPluginReturnPromise),
    ]

    static var shared: TerminalPlugin?

    private var discoverCancelable: Cancelable?
    private var connectedReader: Reader?

    // Terminal.initWithTokenProvider(...) is called once in AppDelegate,
    // before this plugin (or anything else) touches Terminal.shared.
    public override func load() {
        TerminalPlugin.shared = self
    }

    // MARK: - Connection token bridge (native -> web -> native)

    func requestConnectionTokenFromWeb() {
        notifyListeners("connectionTokenRequested", data: [:])
    }

    // Called from JS after it fetches a token from
    // /api/terminal/connection-token using the web session's own cookies.
    @objc func provideConnectionToken(_ call: CAPPluginCall) {
        let secret = call.getString("secret")
        let errorMessage = call.getString("errorMessage")
        TerminalConnectionTokenProvider.shared.providePendingConnectionToken(secret: secret, errorMessage: errorMessage)
        call.resolve()
    }

    // MARK: - Discover + connect

    @objc func discoverAndConnect(_ call: CAPPluginCall) {
        guard let locationId = call.getString("locationId") else {
            call.reject("locationId is required")
            return
        }

        do {
            let config = try TapToPayDiscoveryConfigurationBuilder().build()
            discoverCancelable = Terminal.shared.discoverReaders(config, delegate: self) { [weak self] error in
                if let error = error {
                    call.reject("discoverReaders failed: \(error.localizedDescription)")
                    self?.discoverCancelable = nil
                }
                // On success, didUpdateDiscoveredReaders (below) picks the first
                // reader and connects — the call resolves/rejects from there.
                self?.pendingConnectCall = call
                self?.pendingLocationId = locationId
            }
        } catch {
            call.reject("Failed to build discovery configuration: \(error.localizedDescription)")
        }
    }

    private var pendingConnectCall: CAPPluginCall?
    private var pendingLocationId: String?

    // MARK: - Collect + confirm payment

    @objc func collectAndConfirmPayment(_ call: CAPPluginCall) {
        guard let clientSecret = call.getString("clientSecret") else {
            call.reject("clientSecret is required")
            return
        }
        guard connectedReader != nil else {
            call.reject("No reader connected — call discoverAndConnect first")
            return
        }

        Terminal.shared.retrievePaymentIntent(clientSecret: clientSecret) { retrieveResult, retrieveError in
            if let error = retrieveError {
                call.reject("retrievePaymentIntent failed: \(error.localizedDescription)")
                return
            }
            guard let paymentIntent = retrieveResult else {
                call.reject("retrievePaymentIntent returned no PaymentIntent")
                return
            }

            Terminal.shared.collectPaymentMethod(paymentIntent) { collectResult, collectError in
                if let error = collectError {
                    call.reject("collectPaymentMethod failed: \(error.localizedDescription)")
                    return
                }
                guard let collected = collectResult else {
                    call.reject("collectPaymentMethod returned no PaymentIntent")
                    return
                }

                Terminal.shared.confirmPaymentIntent(collected) { confirmResult, confirmError in
                    if let error = confirmError {
                        call.reject("confirmPaymentIntent failed: \(error.localizedDescription)")
                        return
                    }
                    guard let confirmed = confirmResult else {
                        call.reject("confirmPaymentIntent returned no PaymentIntent")
                        return
                    }

                    call.resolve([
                        "paymentIntentId": confirmed.stripeId ?? "",
                        "status": Terminal.stringFromPaymentIntentStatus(confirmed.status),
                    ])
                }
            }
        }
    }
}

// MARK: - DiscoveryDelegate

extension TerminalPlugin: DiscoveryDelegate {
    public func terminal(_ terminal: Terminal, didUpdateDiscoveredReaders readers: [Reader]) {
        guard let reader = readers.first, let call = pendingConnectCall, let locationId = pendingLocationId else { return }
        pendingConnectCall = nil
        pendingLocationId = nil
        discoverCancelable = nil

        do {
            let connectionConfig = try TapToPayConnectionConfigurationBuilder(delegate: self, locationId: locationId)
                .build()
            Terminal.shared.connectReader(reader, connectionConfig: connectionConfig) { [weak self] connectedReader, connectError in
                if let error = connectError {
                    call.reject("connectReader failed: \(error.localizedDescription)")
                    return
                }
                self?.connectedReader = connectedReader
                call.resolve(["readerId": connectedReader?.stripeId ?? ""])
            }
        } catch {
            call.reject("Failed to build connection configuration: \(error.localizedDescription)")
        }
    }
}

// MARK: - TapToPayReaderDelegate (device setup + disconnect + reconnect)

extension TerminalPlugin: TapToPayReaderDelegate {
    public func tapToPayReader(_ reader: Reader, didStartInstallingUpdate update: ReaderSoftwareUpdate, cancelable: Cancelable?) {
        notifyListeners("readerUpdateStarted", data: [:])
    }

    public func tapToPayReader(_ reader: Reader, didReportReaderSoftwareUpdateProgress progress: Float) {
        notifyListeners("readerUpdateProgress", data: ["progress": progress])
    }

    public func tapToPayReader(_ reader: Reader, didFinishInstallingUpdate update: ReaderSoftwareUpdate?, error: Error?) {
        notifyListeners("readerUpdateFinished", data: ["error": error?.localizedDescription ?? NSNull()])
    }

    public func tapToPayReader(_ reader: Reader, didRequestReaderInput inputOptions: ReaderInputOptions = []) {
        notifyListeners("readerInputRequested", data: ["message": Terminal.stringFromReaderInputOptions(inputOptions)])
    }

    public func tapToPayReader(_ reader: Reader, didRequestReaderDisplayMessage displayMessage: ReaderDisplayMessage) {
        notifyListeners("readerDisplayMessage", data: ["message": Terminal.stringFromReaderDisplayMessage(displayMessage)])
    }

    public func reader(_ reader: Reader, didDisconnect reason: DisconnectReason) {
        connectedReader = nil
        notifyListeners("readerDisconnected", data: [:])
    }

    public func reader(_ reader: Reader, didStartReaderReconnect cancelable: Cancelable) {
        notifyListeners("readerReconnecting", data: [:])
    }

    public func readerDidSucceedReaderReconnect(_ reader: Reader) {
        notifyListeners("readerReconnected", data: [:])
    }

    public func readerDidFailReaderReconnect(_ reader: Reader) {
        connectedReader = nil
        notifyListeners("readerReconnectFailed", data: [:])
    }
}
