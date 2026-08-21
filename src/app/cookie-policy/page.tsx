import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

const BRAND_PURPLE = "#712AE2";

const SECTIONS = [
  {
    n: "1",
    title: "What Are Cookies",
    body: "Cookies are small text files placed on your device when you visit a website or use a web application. They allow the site to remember your actions and preferences over time, and are widely used to make services work efficiently and to provide reporting information.",
  },
  {
    n: "2",
    title: "Types of Cookies We Use",
    subsections: [
      {
        title: "2.1 Strictly Necessary Cookies",
        body: "These cookies are essential for the Service to function and cannot be switched off. They are typically set in response to actions you take, such as logging in, setting your preferences, or filling out forms. Without these cookies, parts of the Service will not work. These cookies do not store any personally identifiable information.",
      },
      {
        title: "2.2 Performance and Analytics Cookies",
        body: "These cookies collect information about how visitors use our Service, for example, which pages are visited most often and whether users receive error messages from certain pages. All information collected by these cookies is aggregated and anonymised. We use Google Analytics 4 for this purpose.",
      },
      {
        title: "2.3 Marketing and Advertising Cookies",
        body: "These cookies track your browsing activity across websites to help us deliver advertising relevant to you and measure the effectiveness of our campaigns. We use the Meta Pixel and similar advertising tags. These cookies may be set by our advertising partners and allow them to build a profile of your interests.",
      },
      {
        title: "2.4 Functional Cookies",
        body: "These cookies enable enhanced functionality and personalisation, such as remembering your language preference, time zone, or whether you have dismissed a notification banner. They may be set by us or by third-party providers whose services we have integrated.",
      },
    ],
  },
  {
    n: "3",
    title: "Specific Technologies We Use",
    items: [
      "Google Analytics 4: measures usage patterns, page views, and conversion events. Data is processed by Google LLC under its Privacy Policy.",
      "Meta Pixel: tracks conversions from Meta ads and supports retargeting on Facebook and Instagram. Data is processed by Meta Platforms, Inc. under its Data Policy.",
      "Supabase Auth: sets session cookies required for secure authentication. These are strictly necessary.",
      "Stripe: sets cookies to detect fraud and manage payment sessions when you interact with payment flows.",
      "OneSignal: may set cookies to support push notification preferences and email tracking.",
    ],
  },
  {
    n: "4",
    title: "How Long Cookies Last",
    items: [
      "Session cookies: temporary cookies that expire when you close your browser.",
      "Persistent cookies: remain on your device for a set period (ranging from 30 days to 2 years depending on the cookie) or until you delete them.",
      "Third-party cookies: retention periods are set by the third party and may differ from our own. Please refer to the relevant third party's privacy or cookie policy for details.",
    ],
  },
  {
    n: "5",
    title: "How to Control Cookies",
    intro: "You have several options for managing cookies:",
    items: [
      "Browser settings: most browsers allow you to refuse or delete cookies. Instructions vary by browser; check your browser's help section for guidance (e.g., Chrome, Firefox, Safari, Edge).",
      "Opt-out tools: you can opt out of Google Analytics tracking at tools.google.com/dlpage/gaoptout. You can manage your Meta ad preferences at your Meta account settings.",
      "Cookie banner: where we display a cookie consent banner, you can use it to accept or reject non-essential cookie categories.",
      "Do Not Track: some browsers transmit a 'Do Not Track' signal. We currently do not respond to Do Not Track signals, but we will update this policy if our practices change.",
    ],
    footer: "Please note that disabling certain cookies may affect the functionality of the Service. Strictly necessary cookies cannot be disabled without impacting core features.",
  },
  {
    n: "6",
    title: "Cookies and Your Personal Information",
    body: "Some cookies we use (or that third parties set) may be linked to personal information such as your email address or user ID. Where this is the case, our Privacy Policy applies to how that information is handled. Please read our Privacy Policy in conjunction with this Cookie Policy.",
  },
  {
    n: "7",
    title: "Changes to This Cookie Policy",
    body: "We may update this Cookie Policy from time to time to reflect changes in technology, law, or our data practices. When we make changes, we will update the \"Last Updated\" date above. For material changes, we will provide notice through the Service or by email. Continued use of the Service after changes take effect constitutes acceptance of the updated policy.",
  },
  {
    n: "8",
    title: "Contact Us",
    contact: true,
  },
];

export default function CookiePolicyPage() {
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
        <Link href="/home-main" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <Image src="/group-starter.svg" alt="FlatPurse Flow" width={130} height={37} priority />
        </Link>
        <Link href="/signup" style={{
          fontSize: 13, fontWeight: 600, color: "#fff",
          background: BRAND_PURPLE, textDecoration: "none",
          padding: "9px 20px", borderRadius: 8, letterSpacing: "-0.01em",
        }}>
          Start Free Trial
        </Link>
      </nav>

      {/* Hero */}
      <div style={{ padding: "80px 48px 60px", maxWidth: 860, margin: "0 auto" }}>
        <Link href="/home-main" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none",
          marginBottom: 32, letterSpacing: "-0.01em",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to home
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
          Cookie Policy
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.7 }}>
          FlatPurse Flow &nbsp;|&nbsp; Effective Date: June 2026 &nbsp;|&nbsp; Last Updated: June 2026
        </p>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: "28px 0 0", maxWidth: 720 }}>
          This Cookie Policy explains how FlatPurse Inc. ("FlatPurse," "we," "us," or "our") uses cookies and similar tracking technologies on the FlatPurse Flow platform, including our website at flatpurse.com, our web application, and related services (collectively, the "Service").
        </p>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: "16px 0 0", maxWidth: 720 }}>
          This Cookie Policy should be read alongside our{" "}
          <Link href="/privacy" style={{ color: BRAND_PURPLE, textDecoration: "none" }}>Privacy Policy</Link>,
          which sets out how we handle personal information more broadly.
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
                    <p style={{ margin: "0 0 16px" }}>Questions about this Cookie Policy? Reach us at:</p>
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
                        {(section.body as string).split("\n\n").map((para, i) => (
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
                        {(section.items as string[]).map((item, i) => (
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
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", margin: "0 0 8px" }}>
            © 2026 FlatPurse Inc. All rights reserved.
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.15)", margin: 0 }}>
            FlatPurse Flow: Cookie Policy &nbsp;|&nbsp; flatpurse.com/cookie-policy
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
