import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

const BRAND_PURPLE = "#712AE2";

const SECTIONS = [
  {
    n: "1",
    title: "Who This Policy Applies To",
    body: `FlatPurse Flow is a software-as-a-service platform that helps service businesses (such as salons, barbershops, spas, gyms, and clinics) manage bookings, payments, marketing, and customer relationships. This Policy applies to two distinct categories of users:

Business Users (Customers): Owners, operators, and staff of service businesses that subscribe to the Service. We act as the data controller of your account, billing, and product-usage information.

End Customers: Individuals who book appointments, make purchases, or otherwise interact with a Business User through the Service. We process this information primarily as a data processor on behalf of the Business User, who is the data controller.

Where we act as a processor, the Business User is responsible for ensuring it has a lawful basis to collect end-customer data and for providing end customers with appropriate privacy notices.`,
  },
  {
    n: "2",
    title: "Information We Collect",
    subsections: [
      {
        title: "2.1 Information You Provide Directly",
        items: [
          "Account information: name, business name, email address, phone number, password, role, and profile photo.",
          "Business information: business address, service categories, operating hours, staff details, service menu, and pricing.",
          "Billing information: subscription tier, billing address, and payment-method identifiers. Full card details are collected and stored by our payment processor (Stripe) — we do not store full card numbers on our servers.",
          "End-customer information entered by Business Users: customer names, contact details, appointment history, notes, intake forms, loyalty data (FlowPoints), and marketing preferences.",
          "Communications: messages you send to our support team, survey responses, and content you submit through forms or chat.",
        ],
      },
      {
        title: "2.2 Information Collected Automatically",
        items: [
          "Usage data: pages viewed, features used, clicks, search queries, time spent, and referral sources.",
          "Device and technical data: IP address, browser type and version, operating system, device identifiers, language settings, and time-zone.",
          "Cookies and similar technologies: we use cookies, pixels (including the Meta Pixel), and analytics tags (including Google Analytics 4) to operate the Service, remember preferences, measure performance, and support marketing. See Section 9 for details.",
          "Log data: server logs, error reports, and security events.",
        ],
      },
      {
        title: "2.3 Information From Third Parties",
        items: [
          "Payment processors: Stripe shares transaction status, last-4 card digits, card brand, and risk signals.",
          "Authentication providers: if you sign in via Google or another identity provider, we receive basic profile information you authorize.",
          "Marketing and advertising platforms: Meta, Google, and similar platforms may share aggregated campaign performance data.",
          "Public sources and integrations: information from integrations you choose to connect (e.g., calendars, accounting tools).",
        ],
      },
    ],
  },
  {
    n: "3",
    title: "How We Use Information",
    intro: "We use information for the following purposes:",
    items: [
      "Provide, operate, maintain, and improve the Service, including booking, POS, website building, marketing automation, and loyalty features.",
      "Authenticate users, prevent fraud, and secure the Service.",
      "Process subscription payments and end-customer transactions through Stripe.",
      "Send transactional communications (booking confirmations, receipts, account notifications, security alerts).",
      "Send marketing communications to Business Users about new features, beta programs, and offerings (you may opt out at any time).",
      "Provide customer support and respond to inquiries.",
      "Generate aggregated, de-identified analytics about how the Service is used.",
      "Power AI features: our AI booking assistant (\"Flo\"), AI marketing tools, and predictive analytics use account and usage data to generate suggestions, content, and forecasts. We do not use Business User content to train foundation models maintained by third parties without your consent.",
      "Comply with legal obligations, enforce our Terms of Service, and protect our rights, users, and the public.",
    ],
  },
  {
    n: "4",
    title: "Legal Bases for Processing",
    intro: "Where applicable law (such as Canadian PIPEDA, Alberta PIPA, the EU/UK GDPR, or other privacy laws) requires us to identify a legal basis for processing, we rely on one or more of the following:",
    items: [
      "Performance of a contract: to deliver the Service you have signed up for.",
      "Legitimate interests: to operate, secure, and improve the Service, and to communicate with Business Users about their account.",
      "Consent: where required, for example for certain marketing communications and non-essential cookies. You may withdraw consent at any time.",
      "Legal obligation: to comply with tax, accounting, anti-fraud, and other legal requirements.",
    ],
  },
  {
    n: "5",
    title: "How We Share Information",
    intro: "We do not sell personal information. We share information only as described below:",
    items: [
      "Service providers: vendors who help us operate the Service, including cloud hosting, Stripe (payments), email delivery, OneSignal (notifications and email sequences), Google (analytics, workspace), Meta (advertising), and AI infrastructure providers. These vendors are bound by confidentiality and data-protection obligations.",
      "Between Business Users and their End Customers: end-customer information is shared with the Business User whose service the end customer is engaging with.",
      "Business transfers: in connection with a merger, acquisition, financing, or sale of assets, subject to appropriate confidentiality protections.",
      "Legal and safety: to comply with law, lawful requests from public authorities, or to protect the rights, property, or safety of FlatPurse, our users, or others.",
      "With your direction: when you authorize an integration or disclosure.",
    ],
  },
  {
    n: "6",
    title: "International Data Transfers",
    body: "FlatPurse is headquartered in Edmonton, Alberta, Canada. Information may be processed and stored in Canada, the United States, and other jurisdictions where our service providers operate. When we transfer personal information outside of your jurisdiction, we use safeguards required by applicable law, such as standard contractual clauses or equivalent mechanisms.",
  },
  {
    n: "7",
    title: "Data Retention",
    intro: "We retain personal information for as long as necessary to provide the Service, comply with our legal obligations, resolve disputes, and enforce our agreements. Specific retention practices include:",
    items: [
      "Account data: retained for the life of the account and for a reasonable period after termination.",
      "Billing and tax records: retained as required by Canadian tax and accounting law (typically seven years).",
      "End-customer data: retained as instructed by the Business User and deleted or returned upon termination of the Business User's account, subject to legal holds.",
      "Logs and security data: typically retained for up to 24 months.",
    ],
  },
  {
    n: "8",
    title: "Your Rights and Choices",
    intro: "Depending on your jurisdiction, you may have the following rights regarding your personal information:",
    items: [
      "Access a copy of the personal information we hold about you.",
      "Correct inaccurate or incomplete information.",
      "Delete your personal information, subject to legal exceptions.",
      "Restrict or object to certain processing.",
      "Withdraw consent where processing is based on consent.",
      "Receive your information in a portable format.",
      "Lodge a complaint with a supervisory authority (in Canada, the Office of the Privacy Commissioner of Canada; in Alberta, the Office of the Information and Privacy Commissioner of Alberta).",
    ],
    footer: "To exercise these rights, contact us at legal@flatpurse.com. If you are an end customer of a Business User, please direct requests to the Business User in the first instance; we will support them in responding.",
  },
  {
    n: "9",
    title: "Cookies and Tracking Technologies",
    intro: "We use cookies and similar technologies to operate the Service, remember your preferences, measure performance, and support marketing. Categories include:",
    items: [
      "Strictly necessary: required for the Service to function (e.g., authentication, security).",
      "Performance and analytics: Google Analytics 4 and similar tools that help us understand usage.",
      "Marketing: the Meta Pixel and other advertising tags that measure campaign performance and support retargeting.",
    ],
    footer: "You can control non-essential cookies through your browser settings or our cookie banner where available. See our Cookie Policy for full details. Disabling certain cookies may affect Service functionality.",
  },
  {
    n: "10",
    title: "Security",
    body: "We use administrative, technical, and physical safeguards designed to protect personal information, including encryption in transit, access controls, logging, and regular review of our security practices. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
  },
  {
    n: "11",
    title: "Children's Privacy",
    body: "The Service is intended for use by businesses and adults aged 18 and over. We do not knowingly collect personal information directly from children. If you believe a child has provided us with personal information, please contact us so we can investigate and, if appropriate, delete the information.",
  },
  {
    n: "12",
    title: "Third-Party Links and Services",
    body: "The Service may contain links to third-party websites, integrations, or services that are not operated by FlatPurse. We are not responsible for the privacy practices of those third parties, and we encourage you to read their privacy policies.",
  },
  {
    n: "13",
    title: "AI Features",
    intro: "Certain features (including \"Flo,\" AI marketing tools, and predictive analytics) use machine-learning models. When you use these features:",
    items: [
      "Inputs and outputs may be processed by third-party AI providers under contracts that restrict their use of your data.",
      "Outputs are generated automatically and may contain inaccuracies. You are responsible for reviewing AI-generated content before relying on it or sending it to end customers.",
      "Where required by law, we will obtain consent before using personal information for automated decision-making that has legal or similarly significant effects.",
    ],
  },
  {
    n: "14",
    title: "Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email or through the Service. The \"Last Updated\" date at the top of this Policy indicates when it was last revised. Continued use of the Service after changes take effect constitutes acceptance of the updated Policy.",
  },
  {
    n: "15",
    title: "Contact Us",
    body: null,
    contact: true,
  },
];

export default function PrivacyPage() {
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
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
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
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(113,42,226,0.12)", border: "1px solid rgba(113,42,226,0.3)",
          borderRadius: 999, padding: "6px 14px", marginBottom: 28,
        }}>
          <span style={{ fontSize: 11, color: BRAND_PURPLE }}>✦</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: BRAND_PURPLE, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>Legal</span>
        </div>
        <h1 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.08, margin: "0 0 20px" }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.7 }}>
          FlatPurse Flow &nbsp;|&nbsp; Effective Date: June 2026 &nbsp;|&nbsp; Last Updated: June 2026
        </p>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: "28px 0 0", maxWidth: 720 }}>
          This Privacy Policy describes how FlatPurse Inc. ("FlatPurse," "we," "us," or "our"), a company incorporated in Alberta, Canada, collects, uses, discloses, and protects personal information in connection with the FlatPurse Flow platform, including our website at flatpurse.com, our web application, mobile applications, APIs, and related services (collectively, the "Service").
        </p>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: "16px 0 0", maxWidth: 720 }}>
          By accessing or using the Service, you acknowledge that you have read and understood this Privacy Policy. If you do not agree, please do not use the Service.
        </p>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 48px 100px" }}>
        {SECTIONS.map((section) => (
          <div key={section.n} style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 48, marginBottom: 48 }}>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: BRAND_PURPLE, letterSpacing: "0.06em", flexShrink: 0, paddingTop: 5, width: 20 }}>
                {section.n.padStart(2, "0")}
              </span>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 20px" }}>
                  {section.title}
                </h2>

                {section.contact ? (
                  <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
                    <p style={{ margin: "0 0 16px" }}>If you have questions or concerns about this Privacy Policy or our privacy practices, please contact:</p>
                    <div style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12, padding: "24px 28px",
                    }}>
                      <p style={{ margin: "0 0 4px", color: "#fff", fontWeight: 600 }}>FlatPurse Inc.</p>
                      <p style={{ margin: "0 0 4px" }}>Attn: Privacy Officer</p>
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
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: "-0.01em", margin: "0 0 12px" }}>{sub.title}</h3>
                        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                          {sub.items.map((item, i) => (
                            <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                              <span style={{ width: 5, height: 5, borderRadius: "50%", background: BRAND_PURPLE, flexShrink: 0, marginTop: 8 }} />
                              <span style={{ fontSize: 14.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.75 }}>{item}</span>
                            </li>
                          ))}
                        </ul>
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
