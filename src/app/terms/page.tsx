import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

const BRAND_PURPLE = "#712AE2";

const SECTIONS = [
  {
    n: "1",
    title: "Eligibility and Accounts",
    body: `You must be at least 18 years old and have the legal capacity to enter into a binding contract. If you are using the Service on behalf of a business or other entity, you represent that you have authority to bind that entity to these Terms, and "you" refers to that entity.

You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use.`,
  },
  {
    n: "2",
    title: "The Service",
    body: `FlatPurse Flow is a software-as-a-service platform designed for service businesses. Features include online booking, point-of-sale (POS), website building, marketing automation, AI-assisted tools (including the "Flo" booking assistant), staff commissions, FlowPoints loyalty, memberships, and multi-location management. Specific features depend on your subscription tier.

We may add, modify, or remove features over time. We will not make material reductions to the core functionality of your active paid plan without reasonable notice.`,
  },
  {
    n: "3",
    title: "Subscription Plans and Beta Programs",
    subsections: [
      {
        title: "3.1 Plans",
        body: "FlatPurse Flow is offered in tiers, including a free Basic plan (limited to 50 appointments per month), Pro, Pro+, and Unlimited. Current pricing, features, and limits are described on flatpurse.com and may be updated from time to time.",
      },
      {
        title: "3.2 Founders Beta and Promotional Programs",
        body: `From time to time, we may offer beta programs, founder pricing, or promotional offers. Special terms (such as locked-in pricing or feature availability) will be communicated at the time of the offer and supersede conflicting provisions of these Terms only to the extent expressly stated. Participants in the Founders Beta program are also bound by the Founders Beta Agreement.`,
      },
    ],
  },
  {
    n: "4",
    title: "Fees, Billing, and Taxes",
    items: [
      "Recurring fees: Paid plans are billed in advance on a monthly or annual basis based on the plan you select. Annual plans are billed once per year.",
      "Payment processing: Subscription fees and end-customer transactions are processed through Stripe. By using the Service, you also agree to Stripe's applicable terms.",
      "Auto-renewal: Subscriptions automatically renew at the end of each billing period unless cancelled before the renewal date.",
      "Price changes: We may change prices for future billing periods on at least 30 days' notice. Founders Beta participants will receive any price guarantees expressly offered at the time of sign-up.",
      "Taxes: Fees are exclusive of applicable taxes (including GST in Canada). You are responsible for all taxes other than those on FlatPurse's net income.",
      "Failed payments: If a payment fails, we may suspend or terminate your account and pursue collection of unpaid amounts.",
    ],
  },
  {
    n: "5",
    title: "Refunds and Cancellation",
    body: `You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period; you will retain access to paid features until then.

Except where required by applicable consumer-protection law, all fees are non-refundable. Specific refund rules are described in our Refund Policy, which is incorporated into these Terms by reference.`,
  },
  {
    n: "6",
    title: "Your Content and Customer Data",
    intro: `"Your Content" means all data, files, images, text, audio, video, and other content that you, your staff, or your end customers submit to the Service, including your end-customer records.`,
    items: [
      "Ownership: As between you and FlatPurse, you own all rights in Your Content.",
      "Licence to FlatPurse: You grant FlatPurse a worldwide, non-exclusive, royalty-free licence to host, copy, transmit, display, and process Your Content solely as necessary to provide and improve the Service.",
      "Your responsibilities: You represent and warrant that you have all rights, consents, and lawful bases needed to submit Your Content to the Service and to allow us to process it as described in our Privacy Policy.",
      "Backups: You are responsible for maintaining your own backups of critical data. We perform routine backups but do not guarantee that all data can be recovered in every circumstance.",
    ],
  },
  {
    n: "7",
    title: "Acceptable Use",
    intro: "Your use of the Service is also subject to our Acceptable Use Policy, which is incorporated into these Terms by reference. You agree not to, and not to allow others to:",
    items: [
      "Use the Service for any unlawful, harmful, fraudulent, or deceptive purpose.",
      "Send spam, unsolicited marketing, or messages that violate anti-spam laws (including Canada's Anti-Spam Legislation, or CASL).",
      "Infringe the intellectual property, privacy, publicity, or other rights of any person.",
      "Upload viruses, malware, or other malicious code, or attempt to disrupt, overload, or compromise the Service.",
      "Reverse engineer, decompile, or attempt to derive source code from the Service, except to the extent expressly permitted by law.",
      "Resell, sublicense, or commercially exploit the Service without our written authorization.",
      "Use the Service to operate a business that is unlawful in your jurisdiction or that violates the policies of our payment processors.",
    ],
    footer: "We may suspend or terminate accounts that violate these rules.",
  },
  {
    n: "8",
    title: "Stripe and Payment Processing",
    body: `Payments processed through the Service (including end-customer payments collected by Business Users) are handled by Stripe, Inc. ("Stripe"). By using these features, you agree to be bound by the Stripe Connected Account Agreement and Stripe Services Agreement. FlatPurse is not a bank, money services business, or payment processor and is not responsible for the actions or omissions of Stripe.

You are responsible for chargebacks, refunds, disputes, and any associated fees relating to transactions processed through your Stripe account.`,
  },
  {
    n: "9",
    title: "Third-Party Services and Integrations",
    body: "The Service may interoperate with third-party products and services (for example, Google, Meta, email and SMS providers, calendars, and accounting tools). Your use of those services is subject to their respective terms. We are not responsible for third-party services and do not endorse them merely by enabling an integration.",
  },
  {
    n: "10",
    title: "AI Features",
    intro: `The Service includes AI-powered features (including the "Flo" booking assistant, AI marketing tools, and predictive analytics). You acknowledge that:`,
    items: [
      "AI outputs are generated automatically and may contain inaccuracies, omissions, or errors.",
      "You are solely responsible for reviewing, editing, and approving AI-generated content before relying on it or sending it to end customers.",
      "You must not use AI features to generate content that is unlawful, deceptive, defamatory, or harmful.",
      "We may use aggregated, de-identified data to improve our AI features. We do not use the contents of your end-customer records to train foundation models maintained by third parties without your consent.",
    ],
  },
  {
    n: "11",
    title: "Intellectual Property",
    body: `The Service, including all software, designs, text, graphics, logos, and trademarks (collectively, the "FlatPurse IP"), is owned by FlatPurse or its licensors and is protected by intellectual-property laws. Subject to your compliance with these Terms, we grant you a limited, revocable, non-exclusive, non-transferable, non-sublicensable licence to access and use the Service for your internal business purposes.

You may not use FlatPurse trademarks or branding without our prior written consent, except for descriptive references permitted by law.`,
  },
  {
    n: "12",
    title: "Feedback",
    body: "If you provide suggestions, ideas, or feedback about the Service, you grant FlatPurse a perpetual, irrevocable, royalty-free licence to use that feedback for any purpose, without obligation to you.",
  },
  {
    n: "13",
    title: "Confidentiality",
    body: "Each party agrees to protect the other party's non-public business or technical information that it receives under these Terms with the same care it uses to protect its own confidential information, and at least with reasonable care. Confidential information does not include information that is publicly available, independently developed, or rightfully received from a third party.",
  },
  {
    n: "14",
    title: "Suspension and Termination",
    items: [
      "By you: You may stop using and cancel the Service at any time through your account settings.",
      "By us: We may suspend or terminate your access if you breach these Terms, fail to pay fees, create risk or legal exposure for FlatPurse, or use the Service in a manner that could harm other users or third parties.",
      "Effect of termination: On termination, your right to use the Service ends, and we may delete Your Content after a reasonable transition period. Sections that by their nature should survive (including ownership, disclaimers, limitations of liability, and dispute resolution) will survive termination.",
    ],
  },
  {
    n: "15",
    title: "Disclaimers",
    body: `The Service is provided "as is" and "as available." To the maximum extent permitted by law, FlatPurse disclaims all warranties, whether express, implied, statutory, or otherwise, including implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement.

We do not warrant that the Service will be uninterrupted, error-free, secure, or that AI-generated outputs will be accurate or suitable for any particular purpose. You are responsible for your business decisions and for compliance with laws that apply to your business.`,
  },
  {
    n: "16",
    title: "Limitation of Liability",
    body: `To the maximum extent permitted by law, in no event will FlatPurse, its directors, officers, employees, or agents be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, including loss of profits, revenue, data, goodwill, or business opportunities, arising out of or in connection with your use of the Service, even if advised of the possibility of such damages.

Aggregate liability: FlatPurse's total aggregate liability for any and all claims arising out of or relating to the Service or these Terms will not exceed the greater of (a) the amounts you paid to FlatPurse for the Service in the twelve (12) months immediately preceding the event giving rise to the claim, or (b) CAD $100.

Some jurisdictions do not allow the exclusion or limitation of certain damages; in those jurisdictions, our liability is limited to the maximum extent permitted by law.`,
  },
  {
    n: "17",
    title: "Indemnification",
    body: "You agree to defend, indemnify, and hold harmless FlatPurse and its directors, officers, employees, and agents from and against any claims, damages, liabilities, losses, and expenses (including reasonable legal fees) arising out of or related to: (a) Your Content; (b) your use of the Service; (c) your violation of these Terms; or (d) your violation of any law or the rights of a third party, including end customers.",
  },
  {
    n: "18",
    title: "Governing Law and Dispute Resolution",
    body: `These Terms are governed by the laws of the Province of Alberta and the federal laws of Canada applicable therein, without regard to conflict-of-laws principles. Subject to applicable consumer-protection rights you may have in your jurisdiction, you and FlatPurse agree that the courts located in Edmonton, Alberta will have exclusive jurisdiction over any dispute arising out of or relating to these Terms or the Service.

Before initiating any formal legal proceeding, the parties agree to attempt in good faith to resolve disputes informally by contacting us at the address below.`,
  },
  {
    n: "19",
    title: "Changes to These Terms",
    body: "We may update these Terms from time to time. If we make material changes, we will notify you by email or through the Service before the changes take effect. Your continued use of the Service after the effective date of the updated Terms constitutes acceptance of those changes. If you do not agree, you must stop using the Service.",
  },
  {
    n: "20",
    title: "Miscellaneous",
    items: [
      "Entire agreement: These Terms, together with our Privacy Policy, Acceptable Use Policy, Refund Policy, SLA, DPA, Cookie Policy, and any order forms or plan-specific terms, are the entire agreement between you and FlatPurse regarding the Service.",
      "Assignment: You may not assign these Terms without our prior written consent. We may assign these Terms in connection with a merger, acquisition, or sale of assets.",
      "Severability: If any provision is held unenforceable, the remaining provisions remain in full force and effect.",
      "No waiver: Failure to enforce any right is not a waiver of that right.",
      "Force majeure: Neither party is liable for delays or failures caused by events beyond its reasonable control.",
      "Notices: We may provide notices through the Service or by email to the address on your account. You may send notices to the address listed below.",
    ],
  },
  {
    n: "21",
    title: "Contact Us",
    contact: true,
  },
];

export default function TermsPage() {
  return (
    <div style={{ background: "#060606", color: "#fff", minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{
        padding: "22px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <Link href="/waitlist" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <Image src="/group-starter.svg" alt="FlatPurse Flow" width={130} height={37} priority />
        </Link>
        <Link href="/waitlist" style={{
          fontSize: 13, fontWeight: 600, color: "#fff",
          background: BRAND_PURPLE, textDecoration: "none",
          padding: "9px 20px", borderRadius: 8, letterSpacing: "-0.01em",
        }}>
          Join Beta
        </Link>
      </nav>

      {/* Hero */}
      <div style={{ padding: "80px 48px 60px", maxWidth: 860, margin: "0 auto" }}>
        <Link href="/waitlist" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none",
          marginBottom: 32, letterSpacing: "-0.01em",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to waitlist
        </Link>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(113,42,226,0.12)", border: "1px solid rgba(113,42,226,0.3)",
          borderRadius: 999, padding: "6px 14px", marginBottom: 28,
        }}>
          <span style={{ fontSize: 11, color: BRAND_PURPLE }}>✦</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: BRAND_PURPLE, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>Legal</span>
        </div>
        <h1 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.08, margin: "0 0 20px" }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.7 }}>
          FlatPurse Flow &nbsp;|&nbsp; Effective Date: June 2026 &nbsp;|&nbsp; Last Updated: June 2026
        </p>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: "28px 0 0", maxWidth: 720 }}>
          These Terms of Service ("Terms") form a binding agreement between you and FlatPurse Inc. ("FlatPurse," "we," "us," or "our"), a company incorporated in Alberta, Canada, governing your access to and use of the FlatPurse Flow platform, including our website at flatpurse.com, our applications, APIs, and related services (collectively, the "Service").
        </p>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: "16px 0 0", maxWidth: 720 }}>
          By creating an account, clicking "I agree," or otherwise using the Service, you confirm that you have read, understood, and agree to be bound by these Terms and by our Privacy Policy. If you do not agree, you must not use the Service.
        </p>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 48px 100px" }}>
        {SECTIONS.map((section) => (
          <div key={section.n} style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 48, marginBottom: 48 }}>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: BRAND_PURPLE, letterSpacing: "0.06em", flexShrink: 0, paddingTop: 5, width: 20 }}>
                {String(section.n).padStart(2, "0")}
              </span>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>
                  {section.title}
                </h2>

                {"contact" in section && section.contact ? (
                  <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
                    <p style={{ margin: "0 0 16px" }}>Questions about these Terms? Contact us:</p>
                    <div style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12, padding: "24px 28px",
                    }}>
                      <p style={{ margin: "0 0 4px", color: "#fff", fontWeight: 600 }}>FlatPurse Inc.</p>
                      <p style={{ margin: "0 0 4px" }}>Edmonton, Alberta, Canada</p>
                      <p style={{ margin: 0 }}>
                        Email:{" "}
                        <a href="mailto:legal@flatpurse.com" style={{ color: BRAND_PURPLE, textDecoration: "none" }}>
                          legal@flatpurse.com
                        </a>
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {"intro" in section && section.intro && (
                      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: "0 0 16px" }}>{section.intro}</p>
                    )}
                    {"body" in section && section.body && (
                      <div>
                        {section.body.split("\n\n").map((para, i) => (
                          <p key={i} style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: "0 0 16px" }}>{para}</p>
                        ))}
                      </div>
                    )}
                    {"subsections" in section && section.subsections && section.subsections.map((sub) => (
                      <div key={sub.title} style={{ marginBottom: 28 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "-0.01em", margin: "0 0 10px" }}>{sub.title}</h3>
                        <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, margin: 0 }}>{sub.body}</p>
                      </div>
                    ))}
                    {"items" in section && section.items && (
                      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                        {section.items.map((item, i) => (
                          <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: BRAND_PURPLE, flexShrink: 0, marginTop: 8 }} />
                            <span style={{ fontSize: 14.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.75 }}>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {"footer" in section && section.footer && (
                      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: "16px 0 0" }}>{section.footer}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Footer note */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 32, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", margin: 0 }}>
            © 2026 FlatPurse Inc. All rights reserved.
          </p>
        </div>
      </div>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          nav { padding: 18px 20px !important; }
          div[style*="padding: 80px 48px"] { padding: 48px 20px 40px !important; }
          div[style*="padding: 0 48px 100px"] { padding: 0 20px 80px !important; }
        }
      `}</style>
    </div>
  );
}
