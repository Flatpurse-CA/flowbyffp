import { DM_Sans } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  RefreshCw,
  MessageCircle,
  Banknote,
  CreditCard,
  Camera,
  Calendar as CalendarIcon,
  Star,
} from "lucide-react";
import FAQAccordion from "@/components/home2/FAQAccordion";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const H2 = {
  bg: "#F7F7F4",
  surface: "#EEEDE6",
  border: "#E4E0DD",
  ink: "#251F19",
  inkSoft: "#57504A",
  muted: "#948B81",
  accent: "#712AE2",
  accentDeep: "#5B1FBE",
};

function SectionTag({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: H2.accent, display: "inline-block" }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: H2.accentDeep, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </span>
    </div>
  );
}

const FOUNDATIONS = [
  {
    icon: <CalendarCheck size={22} strokeWidth={1.5} />,
    title: "Online Booking",
    description: "Your shop gets a live booking page clients can access anytime, from any device, no calls needed.",
  },
  {
    icon: <RefreshCw size={22} strokeWidth={1.5} />,
    title: "AutoPilot Engine",
    description: "Six always-on AI flows working in the background, filling slots, sending reminders, and recovering revenue.",
  },
  {
    icon: <MessageCircle size={22} strokeWidth={1.5} />,
    title: "AI Front Desk",
    description: "AutoPilot answers client messages, books appointments, and only escalates to you when it truly needs a human.",
  },
  {
    icon: <Banknote size={22} strokeWidth={1.5} />,
    title: "Payments, Zero Commission",
    description: "Collect deposits, tips, and full payments in-app through Stripe. You keep every dollar, no cuts, no fees beyond processing.",
  },
];

const TESTIMONIALS = [
  { name: "Ade Williams", shop: "Williams Barbershop", type: "Barbershop", img: "/sd1.jpg", quote: "No-shows dropped by 80% in the first month alone. I didn't change anything about how I run my shop, Flow just handled it." },
  { name: "Temi Okafor", shop: "The Curl Studio", type: "Hair Salon", img: "/sd2.jpg", quote: "AutoPilot books clients while I sleep. I wake up to a full calendar every single morning." },
  { name: "Seun Adeyemi", shop: "Fade Factory", type: "Barbershop", img: "/sd4.jpg", quote: "The AI front desk handles every DM. I haven't had to reply to a booking request in weeks." },
  { name: "Chioma Eze", shop: "Glow Beauty Lounge", type: "Nail & Beauty", img: "/make-up-artist-working-medium-shot.jpg", quote: "My clients love the booking page. Seamless, professional. It's exactly what we needed to look legit." },
  { name: "Kola Mensah", shop: "Precision Cuts", type: "Barbershop", img: "/sd5.jpg", quote: "Revenue up 35% in two months. The win-back flow alone paid for the whole year." },
  { name: "Femi & Dami", shop: "Kings & Queens Cuts", type: "Unisex Salon", img: "/sd3.jpg", quote: "We used to lose thousands a month to cancellations. That money stays with us now." },
];

const PLANS = [
  {
    id: "starter", label: "Starter", badge: null, dark: false,
    price: "C$23.40", suffix: "/mo", subtitle: "Year 1 · then C$29.25/mo forever",
    description: "Solo businesses getting started",
    features: ["Home Dashboard & booking calendar", "Full POS, payments & Tap to Pay", "Client CRM & appointment history", "Up to 2 team members"],
    cta: "Start free trial",
  },
  {
    id: "pro", label: "Pro", badge: null, dark: false,
    price: "C$53.40", suffix: "/mo", subtitle: "Year 1 · then C$66.75/mo forever",
    description: "Run your business",
    features: ["AutoPilot — no-show recovery, win-backs, AI Front Desk", "Daily Brief — morning business summary", "Client segmentation & churn-risk alerts", "Up to 10 team members"],
    cta: "Get started with Pro",
  },
  {
    id: "pro-plus", label: "Pro+", badge: "Most popular", dark: true,
    price: "C$113.40", suffix: "/mo", subtitle: "Year 1 · then C$141.75/mo forever",
    description: "Grow your business",
    features: ["Flow Coach™ — your AI business consultant", "Business Health Score & revenue forecasting", "Staffing & retention insights", "Up to 25 team members"],
    cta: "Get started with Pro+",
  },
  {
    id: "enterprise", label: "Enterprise", badge: null, dark: false,
    price: "Custom", suffix: "", subtitle: "Unlimited staff, 3+ locations",
    description: "Scale your business",
    features: ["Multi-location dashboard", "Advanced reporting & priority support", "Dedicated onboarding", "Unlimited team members"],
    cta: "Talk to us",
  },
];

const INTEGRATIONS = [
  { icon: <CreditCard size={20} strokeWidth={1.5} />, title: "Stripe", description: "Collect deposits, tips, and full payments in-app." },
  { icon: <MessageCircle size={20} strokeWidth={1.5} />, title: "WhatsApp", description: "Confirmations, reminders, and win-back messages." },
  { icon: <Camera size={20} strokeWidth={1.5} />, title: "Instagram DMs", description: "Clients book straight from your Instagram page." },
  { icon: <CalendarIcon size={20} strokeWidth={1.5} />, title: "Google Calendar", description: "Every booking lands on your calendar in real time." },
];

const cardStyle: React.CSSProperties = {
  background: H2.surface,
  border: `1px solid ${H2.border}`,
  borderRadius: 16,
};

export default function Home2Page() {
  return (
    <div className={dmSans.className} style={{ background: H2.bg, color: H2.ink }}>

      {/* ── Nav (overlays hero) ── */}
      <nav style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 50,
        height: 84, display: "flex", alignItems: "center",
      }}>
        <div className="h2-shell" style={{
          width: "100%", maxWidth: 1240, margin: "0 auto", padding: "0 40px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Link href="/home-2" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: H2.accent }} />
            <span style={{ fontSize: 19, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>flow</span>
          </Link>

          <div className="h2-nav-links" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {[
              { label: "Why Flow", href: "#why" },
              { label: "Pricing", href: "#pricing" },
              { label: "Integrations", href: "#integrations" },
              { label: "FAQ", href: "#faq" },
            ].map((l) => (
              <a key={l.label} href={l.href} style={{
                color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500,
                padding: "8px 16px", textDecoration: "none",
              }}>
                {l.label}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/login" style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, textDecoration: "none", padding: "8px 4px" }} className="h2-nav-login">
              Log in
            </Link>
            <Link href="/signup" style={{
              background: H2.ink, color: "#fff", fontSize: 14, fontWeight: 600,
              padding: "11px 20px", borderRadius: 10, textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: H2.accent, display: "inline-block" }} />
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        position: "relative", minHeight: "88vh", display: "flex", alignItems: "center",
        overflow: "hidden",
        background: `
          radial-gradient(120% 90% at 15% 15%, rgba(216,180,255,0.9) 0%, rgba(139,61,220,0.55) 30%, transparent 60%),
          radial-gradient(140% 100% at 85% 0%, rgba(90,20,170,0.65) 0%, transparent 55%),
          linear-gradient(190deg, #8B3DDC 0%, #5B1FA8 42%, #2A0F52 78%, #120826 100%)
        `,
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(80% 60% at 50% 100%, rgba(0,0,0,0.35), transparent 70%)",
        }} />
        <div className="h2-shell" style={{
          position: "relative", width: "100%", maxWidth: 900, margin: "0 auto",
          padding: "0 40px", textAlign: "center", paddingTop: 84,
        }}>
          <p style={{
            fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.75)",
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 22,
          }}>
            AI-powered booking for salons &amp; barbershops
          </p>
          <h1 style={{
            fontSize: "clamp(34px, 5.2vw, 54px)", fontWeight: 600, color: "#fff",
            lineHeight: 1.08, letterSpacing: "-0.02em", margin: "0 0 26px",
          }}>
            The booking assistant that works<br />
            <em style={{ fontStyle: "italic", fontWeight: 400 }}>with you</em>, not just for you.
          </h1>
          <p style={{
            fontSize: 17, color: "rgba(255,255,255,0.82)", lineHeight: 1.7,
            maxWidth: 560, margin: "0 auto 40px",
          }}>
            AutoPilot fills your calendar, follows up with clients, and recovers lost revenue automatically, so you can stay focused on the chair.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" style={{
              background: H2.ink, color: "#fff", fontSize: 15, fontWeight: 600,
              padding: "15px 28px", borderRadius: 10, textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: H2.accent, display: "inline-block" }} />
              Get started free
            </Link>
            <a href="#why" style={{
              background: "rgba(255,255,255,0.12)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.28)",
              fontSize: 15, fontWeight: 500, padding: "15px 28px", borderRadius: 10, textDecoration: "none",
            }}>
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section style={{ padding: "40px 40px", borderBottom: `1px solid ${H2.border}` }}>
        <div className="h2-shell" style={{ maxWidth: 1160, margin: "0 auto" }}>
          <p style={{
            textAlign: "center", fontSize: 12, fontWeight: 600, color: H2.muted,
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 26,
          }}>
            Trusted by 500+ independent shops
          </p>
          <div className="h2-trust-row" style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            gap: 40, flexWrap: "wrap",
          }}>
            {["Williams Barbershop", "The Curl Studio", "Fade Factory", "Glow Beauty Lounge", "Precision Cuts", "Kings & Queens Cuts"].map((n) => (
              <span key={n} style={{ fontSize: 15, fontWeight: 600, color: H2.muted, letterSpacing: "-0.01em" }}>
                {n}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Flow ── */}
      <section id="why" style={{ padding: "110px 40px" }}>
        <div className="h2-shell" style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <SectionTag label="Why Flow" />
            </div>
            <h2 style={{
              fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 500, letterSpacing: "-0.02em",
              lineHeight: 1.15, margin: "0 auto", maxWidth: 640,
            }}>
              A real system, not just a calendar.
            </h2>
          </div>

          <div className="h2-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {FOUNDATIONS.map((f) => (
              <div key={f.title} style={{ ...cardStyle, padding: "40px 36px" }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 10, background: H2.bg,
                  border: `1px solid ${H2.border}`, display: "flex", alignItems: "center",
                  justifyContent: "center", color: H2.accentDeep, marginBottom: 22,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 10px", letterSpacing: "-0.01em" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14.5, color: H2.inkSoft, lineHeight: 1.7, margin: 0 }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AutoPilot showcase ── */}
      <section style={{ padding: "0 40px 120px" }}>
        <div className="h2-shell" style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div className="h2-grid-2" style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 56, alignItems: "center" }}>
            <div>
              <SectionTag label="AutoPilot" />
              <h2 style={{
                fontSize: "clamp(28px, 3.4vw, 40px)", fontWeight: 500, letterSpacing: "-0.02em",
                lineHeight: 1.15, margin: "0 0 20px",
              }}>
                Tell it once.<br />AutoPilot handles the rest.
              </h2>
              <p style={{ fontSize: 15.5, color: H2.inkSoft, lineHeight: 1.75, margin: "0 0 28px", maxWidth: 440 }}>
                Six always-on flows run quietly behind your shop, filling cancellations, chasing lapsed clients, and answering DMs, so nothing falls through the cracks.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {["Multi-step task automation", "Human-in-the-loop when it matters", "Persistent client profile & history"].map((t) => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: H2.accent }} />
                    <span style={{ fontSize: 14.5, color: H2.inkSoft, fontWeight: 500 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: H2.ink, borderRadius: 20, padding: "28px 28px 32px",
              boxShadow: "0 30px 60px -20px rgba(37,31,25,0.35)",
            }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Tasks / New task
              </p>
              <p style={{ fontSize: 15, color: "#fff", fontWeight: 600, margin: "0 0 20px" }}>
                prep tomorrow&rsquo;s schedule
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "Fill 3 open slots from the waitlist",
                  "Send reminders to 12 upcoming clients",
                  "Draft win-back messages to 5 lapsed clients",
                  "Confirm 2 Instagram DM booking requests",
                ].map((step, i) => (
                  <div key={step} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px",
                  }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: "50%", background: H2.accent,
                      color: H2.ink, fontSize: 11, fontWeight: 700, display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.85)" }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: "0 40px 120px" }}>
        <div className="h2-shell" style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <SectionTag label="What shop owners say" />
            </div>
            <h2 style={{
              fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 500, letterSpacing: "-0.02em",
              lineHeight: 1.15, margin: 0,
            }}>
              Real shops. Real results.
            </h2>
          </div>

          <div className="h2-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} style={{ ...cardStyle, padding: 32, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill={H2.accent} color={H2.accent} />
                  ))}
                </div>
                <p style={{ fontSize: 14.5, color: H2.ink, lineHeight: 1.7, margin: "0 0 26px", flex: 1 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Image src={t.img} alt={t.name} width={40} height={40} style={{ borderRadius: "50%", objectFit: "cover" }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>{t.name}</p>
                    <p style={{ margin: 0, fontSize: 12.5, color: H2.muted }}>{t.shop} · {t.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: "0 40px 120px" }}>
        <div className="h2-shell" style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <SectionTag label="Pricing" />
            </div>
            <h2 style={{
              fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 500, letterSpacing: "-0.02em",
              lineHeight: 1.15, margin: "0 0 14px",
            }}>
              Simple, transparent pricing.<br /><em style={{ fontStyle: "italic", fontWeight: 400 }}>No surprises.</em>
            </h2>
            <p style={{ fontSize: 15, color: H2.inkSoft, margin: 0 }}>
              Start free, scale as you grow. Upgrade or cancel anytime, no lock-in.
            </p>
          </div>

          <div className="h2-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {PLANS.map((p) => (
              <div key={p.id} style={{
                ...cardStyle,
                background: p.dark ? H2.ink : H2.surface,
                color: p.dark ? "#fff" : H2.ink,
                padding: 28,
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}>
                {p.badge && (
                  <span style={{
                    position: "absolute", top: 24, right: 24, fontSize: 11, fontWeight: 700,
                    color: H2.ink, background: H2.accent, padding: "4px 10px", borderRadius: 6,
                  }}>
                    {p.badge}
                  </span>
                )}
                <p style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: p.dark ? "rgba(255,255,255,0.6)" : H2.muted, margin: "0 0 18px" }}>
                  {p.label}
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em" }}>{p.price}</span>
                  <span style={{ fontSize: 14, color: p.dark ? "rgba(255,255,255,0.55)" : H2.muted }}>{p.suffix}</span>
                </div>
                <p style={{ fontSize: 12.5, color: p.dark ? "rgba(255,255,255,0.55)" : H2.muted, margin: "0 0 24px" }}>
                  {p.subtitle}
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: 10, fontSize: 13, lineHeight: 1.5, color: p.dark ? "rgba(255,255,255,0.8)" : H2.inkSoft }}>
                      <span style={{ color: H2.accent, flexShrink: 0 }}>&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" style={{
                  background: p.dark ? H2.accent : H2.ink,
                  color: p.dark ? H2.ink : "#fff",
                  fontSize: 13.5, fontWeight: 600, textAlign: "center",
                  padding: "13px 16px", borderRadius: 9, textDecoration: "none",
                }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations ── */}
      <section id="integrations" style={{ padding: "0 40px 120px" }}>
        <div className="h2-shell" style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <SectionTag label="Integrations" />
            </div>
            <h2 style={{
              fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 500, letterSpacing: "-0.02em",
              lineHeight: 1.15, margin: 0,
            }}>
              Connect your tools.<br />Flow meets you there.
            </h2>
          </div>

          <div className="h2-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {INTEGRATIONS.map((it) => (
              <div key={it.title} style={{ ...cardStyle, padding: 26 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 9, background: H2.bg,
                  border: `1px solid ${H2.border}`, display: "flex", alignItems: "center",
                  justifyContent: "center", color: H2.accentDeep, marginBottom: 18,
                }}>
                  {it.icon}
                </div>
                <h3 style={{ fontSize: 15.5, fontWeight: 600, margin: "0 0 8px" }}>{it.title}</h3>
                <p style={{ fontSize: 13, color: H2.inkSoft, lineHeight: 1.6, margin: "0 0 20px" }}>{it.description}</p>
                <button style={{
                  width: "100%", background: "transparent", border: `1px solid ${H2.border}`,
                  borderRadius: 8, padding: "9px 12px", fontSize: 13, fontWeight: 600,
                  color: H2.ink, cursor: "pointer",
                }}>
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: "0 40px 120px" }}>
        <div className="h2-shell" style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <SectionTag label="FAQ" />
            </div>
            <h2 style={{
              fontSize: "clamp(28px, 3.6vw, 40px)", fontWeight: 500, letterSpacing: "-0.02em",
              lineHeight: 1.15, margin: 0,
            }}>
              Questions answered.
            </h2>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* ── Dark CTA band ── */}
      <section style={{ background: H2.ink, padding: "110px 40px", textAlign: "center" }}>
        <div className="h2-shell" style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 500, color: "#fff",
            letterSpacing: "-0.02em", lineHeight: 1.15, margin: "0 0 16px",
          }}>
            Meet AutoPilot.<br /><em style={{ fontStyle: "italic", fontWeight: 400 }}>Built for real shops.</em>
          </h2>
          <p style={{ fontSize: 15.5, color: "rgba(255,255,255,0.65)", margin: "0 0 34px" }}>
            Join independent salons and barbershops already running their calendar on autopilot.
          </p>
          <Link href="/signup" style={{
            background: H2.accent, color: H2.ink, fontSize: 15, fontWeight: 700,
            padding: "15px 30px", borderRadius: 10, textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            Get started free <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        position: "relative", background: H2.bg, padding: "70px 40px 40px",
        borderTop: `1px solid ${H2.border}`, overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 6,
          backgroundImage: "url(/ffdot.png)", backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%", opacity: 0.5,
        }} />
        <div className="h2-shell h2-footer-grid" style={{
          maxWidth: 1160, margin: "0 auto", display: "flex",
          justifyContent: "space-between", gap: 40, flexWrap: "wrap", marginBottom: 50,
        }}>
          <div style={{ maxWidth: 280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: H2.accent }} />
              <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em" }}>flow</span>
            </div>
            <p style={{ fontSize: 13.5, color: H2.inkSoft, lineHeight: 1.7, margin: 0 }}>
              AI-powered booking and revenue management for independent salons and barbershops.
            </p>
          </div>

          <div style={{ display: "flex", gap: 64, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: H2.muted, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 16px" }}>Product</p>
              {[{ l: "Why Flow", h: "#why" }, { l: "Pricing", h: "#pricing" }, { l: "Integrations", h: "#integrations" }, { l: "FAQ", h: "#faq" }].map((i) => (
                <a key={i.l} href={i.h} style={{ display: "block", fontSize: 13.5, color: H2.inkSoft, textDecoration: "none", marginBottom: 10 }}>{i.l}</a>
              ))}
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: H2.muted, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 16px" }}>Legal</p>
              {[
                { l: "Terms of Service", h: "/terms" },
                { l: "Privacy Policy", h: "/privacy" },
                { l: "Cookie Policy", h: "/cookie-policy" },
                { l: "Refund Policy", h: "/refund-policy" },
              ].map((i) => (
                <Link key={i.l} href={i.h} style={{ display: "block", fontSize: 13.5, color: H2.inkSoft, textDecoration: "none", marginBottom: 10 }}>{i.l}</Link>
              ))}
            </div>
          </div>
        </div>

        <div className="h2-shell" style={{
          maxWidth: 1160, margin: "0 auto", paddingTop: 28, borderTop: `1px solid ${H2.border}`,
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        }}>
          <p style={{ fontSize: 12.5, color: H2.muted, margin: 0 }}>
            © {new Date().getFullYear()} FlatPurse Flow. All rights reserved.
          </p>
          <p style={{ fontSize: 12.5, color: H2.muted, margin: 0 }}>
            Made for independent shops.
          </p>
        </div>
      </footer>

    </div>
  );
}
