import Foundation
import StripeTerminal

// Fetches a Stripe Terminal ConnectionToken from our own Next.js backend
// (src/app/api/terminal/connection-token/route.ts), not directly — that
// route requires the logged-in shop owner/staff session cookie, which lives
// in the WKWebView's cookie jar, not in a bare URLSession. So this class
// asks the loaded web page to do the authenticated fetch on its behalf via
// TerminalPlugin.requestConnectionToken(), and waits for the JS side to
// call back into providePendingConnectionToken(...).
final class TerminalConnectionTokenProvider: ConnectionTokenProvider {
    static let shared = TerminalConnectionTokenProvider()

    private var pendingCompletion: ConnectionTokenCompletionBlock?

    func fetchConnectionToken(_ completion: @escaping ConnectionTokenCompletionBlock) {
        pendingCompletion = completion
        TerminalPlugin.shared?.requestConnectionTokenFromWeb()
    }

    // Called by TerminalPlugin once the web page's authenticated fetch to
    // /api/terminal/connection-token resolves.
    func providePendingConnectionToken(secret: String?, errorMessage: String?) {
        guard let completion = pendingCompletion else { return }
        pendingCompletion = nil
        if let secret = secret {
            completion(secret, nil)
        } else {
            let error = NSError(
                domain: "com.flatpurse.flow.terminal",
                code: 1001,
                userInfo: [NSLocalizedDescriptionKey: errorMessage ?? "Failed to fetch connection token"]
            )
            completion(nil, error)
        }
    }
}
