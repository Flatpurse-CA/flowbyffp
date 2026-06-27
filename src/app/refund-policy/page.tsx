import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

const BRAND_PURPLE = "#712AE2";

const SECTIONS = [
  {
    n: "1",
    title: "General Rule — Fees Are Non-Refundable",
    intro: "Except as expressly stated in this policy or required by applicable law, all subscription fees paid to FlatPurse are non-refundable. This applies to:",
    items: [
      "Monthly and annual plan fees.",
      "Fees paid for add-ons, integrations, or upgrades.",
      "Fees for partial billing periods remaining after cancellation.",
    ],
    footer: "Cancelling your subscription stops future charges but does not entitle you to a refund of amounts already paid. You will retain access to paid features until the end of the current billing period.",
  },
  {
    n: "2",
    title: "Founders Beta Participants",
    body: `Founders Beta participants who activate an annual plan agree to annual billing at the time of sign-up. Annual fees are charged upfront and are non-refundable once the billing period begins, except as required by law.

If FlatPurse discontinues the Founders Beta program or the Service entirely before the end of your annual billing period, we will provide a pro-rated refund for the unused portion of your subscription.`,
  },
  {
    n: "3",
    title: "Exceptions — When We Do Issue Refunds",
    subsections: [
      {
        title: "3.1 Duplicate Charges",
        body: "If you are charged more than once for the same billing period due to a technical error on our part, we will refund the duplicate charge promptly upon verification.",
      },
      {
        title: "3.2 Unauthorized Transactions",
        body: "If you believe a charge was made to your account without your authorization, contact us immediately. We will investigate and, where confirmed, reverse the charge.",
      },
      {
        title: "3.3 Service Discontinuation",
        body: "If FlatPurse permanently discontinues the Service, we will provide a pro-rated refund for any prepaid annual subscription fees covering the period after the discontinuation date.",
      },
      {
        title: "3.4 Consumer Protection Laws",
        body: "Nothing in this policy limits rights you may have under applicable Alberta or Canadian consumer-protection legislation. Where such laws require a refund in circumstances not addressed above, we will comply.",
      },
    ],
  },
  {
    n: "4",
    title: "Transaction Fees and Third-Party Charges",
    body: "FlatPurse is not responsible for refunding transaction fees charged by Stripe or other third-party payment processors. Stripe's own refund and dispute policies apply to payment processing fees. For chargebacks and disputes initiated by your end customers, you remain responsible under your Stripe Connected Account Agreement.",
  },
  {
    n: "5",
    title: "How to Request a Refund",
    intro: "To request a refund under one of the exceptions in Section 3, contact us within 30 days of the charge:",
    items: [
      "Email: support@flatpurse.com",
      "Subject line: \"Refund Request — [Your Account Name]\"",
      "Include: the date of the charge, the amount, and a brief description of the reason for your request.",
    ],
    footer: "We will acknowledge your request within 3 business days and aim to resolve it within 10 business days. Approved refunds will be returned to the original payment method.",
  },
  {
    n: "6",
    title: "Changes to This Policy",
    body: "We may update this Refund Policy from time to time. We will post the updated policy at flatpurse.com/refund-policy and update the \"Last Updated\" date above. For material changes, we will provide at least 30 days' notice by email or in-app notification before the change takes effect. Continued use of the Service after that date constitutes your acceptance of the updated policy.",
  },
  {
    n: "7",
    title: "Contact",
    contact: true,
  },
];

export default function RefundPolicyPage() {
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
          Refund Policy
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.7 }}>
          FlatPurse Flow &nbsp;|&nbsp; Effective Date: June 2026 &nbsp;|&nbsp; Last Updated: June 2026
        </p>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: "28px 0 0", maxWidth: 720 }}>
          This Refund Policy explains when FlatPurse Inc. ("FlatPurse," "we," "us") issues refunds for subscription fees paid for the FlatPurse Flow platform. It is incorporated into and forms part of the FlatPurse Flow Terms of Service. By using the Service, you agree to this policy.
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
                    <p style={{ margin: "0 0 16px" }}>Questions about this policy? Reach us at:</p>
                    <div style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12, padding: "24px 28px",
                    }}>
                      <p style={{ margin: "0 0 4px", color: "#fff", fontWeight: 600 }}>FlatPurse Inc.</p>
                      <p style={{ margin: "0 0 4px" }}>Edmonton, Alberta, Canada</p>
                      <p style={{ margin: 0 }}>
                        Email:{" "}
                        <a href="mailto:support@flatpurse.com" style={{ color: BRAND_PURPLE, textDecoration: "none" }}>
                          support@flatpurse.com
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
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", margin: "0 0 8px" }}>
            © 2026 FlatPurse Inc. All rights reserved.
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.15)", margin: 0 }}>
            FlatPurse Flow — Refund Policy &nbsp;|&nbsp; flatpurse.com/refund-policy
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
