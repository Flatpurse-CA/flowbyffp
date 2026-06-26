"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { joinWaitlist } from "./actions";
import Link from "next/link";
import { ArrowRight, ChevronDown, CheckCircle2, Sparkles, CalendarDays, Lock, Users, MessageSquare } from "lucide-react";
import AutoPilotChip from "@/components/AutoPilotChip";
import ScrollZoom from "@/components/ScrollZoom";
import Footer from "@/components/Footer";

const BRAND_PURPLE = "#712AE2";


const PERKS = [
  { icon: <CalendarDays size={22} strokeWidth={1.5} />, iconColor: "#2563eb", iconBg: "rgba(37,99,235,0.08)", title: "30-day extended free trial",       desc: "3× longer than the standard trial. Full access to every feature, no card required." },
  { icon: <Lock size={22} strokeWidth={1.5} />,         iconColor: "#712AE2", iconBg: "rgba(113,42,226,0.08)", title: "Founder pricing — locked for life", desc: "Early members get our lowest price forever. It never goes up when we raise rates." },
  { icon: <Users size={22} strokeWidth={1.5} />,        iconColor: "#16a34a", iconBg: "rgba(22,163,74,0.08)",  title: "Priority onboarding",               desc: "Skip the queue. We personally onboard the first wave of shops to make sure everything runs perfectly." },
  { icon: <MessageSquare size={22} strokeWidth={1.5} />, iconColor: "#f59e0b", iconBg: "rgba(245,158,11,0.08)", title: "Direct founder access",             desc: "A private channel with George and the team. Shape the product before it goes public." },
];

const STEPS = [
  { n: "Step 1", title: "Join the waitlist",              desc: "Enter your name, email, and shop type. It takes less than 60 seconds and your spot is reserved instantly." },
  { n: "Step 2", title: "Get your early access invite",   desc: "When we open doors, you get a personal invite before anyone else. Early members get an extended free trial and locked-in pricing." },
  { n: "Step 3", title: "Set up your shop",               desc: "Add your services, set your hours, and share your booking link. AutoPilot switches on automatically and starts working from day one." },
];


const FAQS = [
  { n: "01", q: "When does FlatPurse Flow launch?",            a: "We're rolling out access to waitlist members in waves starting soon. The earlier you join, the sooner you get in. We don't have a fixed public launch date — early access members come first." },
  { n: "02", q: "What do early access members actually get?",  a: "A 30-day free trial (3× the standard), founder pricing locked for life, priority onboarding with our team, and a direct line to the founders to shape the product." },
  { n: "03", q: "How much does it cost?",                      a: "Early access members get a special founder rate that's locked forever — lower than our public pricing. We'll share exact numbers when we send your invite. Zero commission on revenue, always." },
  { n: "04", q: "Do waitlist spots expire?",                   a: "Your spot is reserved as long as your email is on the list. We'll send a reminder before your invite goes out. If we don't hear back within 7 days, your spot moves to the next person." },
  { n: "05", q: "Can I use FlatPurse Flow right now?",         a: "We're in a closed beta with a small group of shops. Joining the waitlist is the fastest way to get access — we're not accepting public signups outside the waitlist at this stage." },
];

const BUSINESS_TYPES = [
  { label: "Hair Salon",  emoji: "✂️" },
  { label: "Barbershop",  emoji: "💈" },
  { label: "Spa",         emoji: "🧖" },
  { label: "Massage",     emoji: "💆" },
  { label: "Nail Studio", emoji: "💅" },
  { label: "Other",       emoji: "🏢" },
];
const AVATARS = ["/sd1.jpg", "/sd2.jpg", "/sd3.jpg", "/sd4.jpg"];

export default function WaitlistPage() {
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [bizType, setBizType]     = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [open, setOpen]         = useState<number | null>(null);
  const [howVisible, setHowVisible] = useState(false);
  const howRef = useRef<HTMLHeadingElement>(null);
  const founderParaRef = useRef<HTMLParagraphElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const el = howRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setHowVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const para = founderParaRef.current;
      if (!para) return;
      const rect = para.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when bottom of para enters viewport, 1 when top exits at top
      const progress = 1 - rect.bottom / (vh + rect.height);
      const clamped = Math.max(0, Math.min(1, progress * 1.6));
      wordRefs.current.forEach((span, i) => {
        if (!span) return;
        const threshold = i / wordRefs.current.length;
        const wordProgress = Math.max(0, Math.min(1, (clamped - threshold) / (1 / wordRefs.current.length)));
        const alpha = 0.15 + wordProgress * 0.75;
        span.style.color = `rgba(255,255,255,${alpha.toFixed(2)})`;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;
    setLoading(true);
    setFormError(null);
    const { error } = await joinWaitlist(email, shopType);
    setLoading(false);
    if (error) {
      setFormError(error);
    } else {
      setSubmitted(true);
    }
  }

  return (
    <div style={{ background: "#060606", color: "#fff", minHeight: "100vh" }}>

      {/* ── Hero (nav lives inside so it overlays the bg image) ── */}
      <section className="wl-hero" style={{
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
        padding: "0 40px 80px",
        minHeight: "100vh",
      }}>
        <Image
          src="/hero-p2.png"
          alt=""
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center bottom", zIndex: 0 }}
        />

        {/* ── Minimal nav ── */}
        <nav className="wl-nav" style={{
          padding: "22px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 10,
        }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <Image src="/logo-white.svg" alt="FLOWBYFFP" width={105} height={35} priority />
          </Link>
          <Link href="/signup"
            style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.4)", textDecoration: "none", letterSpacing: "-0.01em" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
          >
            Already have an account?
          </Link>
        </nav>

        {/* AutoPilot pill */}
        <div style={{ position: "relative", zIndex: 1, marginBottom: 16, display: "inline-block" }}>
          <AutoPilotChip words={["AutoPilot", "·", "Early", "Access"]} />
        </div>

        {/* Headline — blur-drop per character */}
        <h1 style={{
          fontSize: "clamp(38px, 5vw, 66px)",
          fontWeight: 900,
          letterSpacing: "-0.05em",
          lineHeight: 1.08,
          color: "#fff",
          margin: "0 auto 8px",
          maxWidth: 800,
          position: "relative", zIndex: 1,
        }}>
          {"Reserve your beta spot.".split("").map((char, i) => (
            <span key={i} className="blur-drop" style={{
              display: "inline-block",
              animationDelay: `${i * 0.04}s`,
              whiteSpace: char === " " ? "pre" : "normal",
            }}>
              {char}
            </span>
          ))}
        </h1>

        {/* Gold italic subheading */}
        <p style={{
          fontSize: "clamp(28px, 3.8vw, 52px)",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          lineHeight: 1.1,
          fontStyle: "italic",
          color: "#D8C8FF",
          margin: "0 auto 32px",
          maxWidth: 800,
          position: "relative", zIndex: 1,
        }}>
          {"Get 40% off forever.".split("").map((char, i) => (
            <span key={i} className="blur-drop" style={{
              display: "inline-block",
              animationDelay: `${0.92 + i * 0.035}s`,
              whiteSpace: char === " " ? "pre" : "normal",
            }}>
              {char}
            </span>
          ))}
        </p>

        {/* Subtext */}
        <p style={{
          fontSize: 17,
          color: "rgba(255,255,255,0.45)",
          lineHeight: 1.7,
          margin: "0 auto 48px",
          maxWidth: 520,
          position: "relative", zIndex: 1,
        }}>
          {"First 40 shops get free beta access + automatic enrollment in Founders 100 — 40% off your subscription for 12 months, then 25% off as long as you stay.".split("").map((char, i) => (
            <span key={i} className="blur-drop" style={{
              display: "inline-block",
              animationDelay: `${0.72 + i * 0.018}s`,
              whiteSpace: char === " " ? "pre" : "normal",
            }}>
              {char}
            </span>
          ))}
        </p>

        {/* Form */}
        {submitted ? (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            background: "rgba(113,42,226,0.12)",
            border: "1px solid rgba(113,42,226,0.3)",
            borderRadius: 14, padding: "20px 36px",
            position: "relative", zIndex: 1,
            marginBottom: 32,
          }}>
            <CheckCircle2 size={20} color={BRAND_PURPLE} />
            <span style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>
              You&apos;re on the list. We&apos;ll be in touch soon.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            position: "relative", zIndex: 1,
            width: "100%", maxWidth: 520,
            margin: "0 auto 28px",
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            {/* Name */}
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "14px 18px",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12, color: "#fff", fontSize: 14.5,
                outline: "none", fontFamily: "inherit",
              }}
            />
            {/* Email */}
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email"
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "14px 18px",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12, color: "#fff", fontSize: 14.5,
                outline: "none", fontFamily: "inherit",
              }}
            />
            {/* Business type grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {BUSINESS_TYPES.map((type) => {
                const sel = bizType === type.label;
                return (
                  <button
                    key={type.label}
                    type="button"
                    onClick={() => setBizType(type.label)}
                    style={{
                      padding: "12px 6px",
                      background: sel ? "rgba(113,42,226,0.2)" : "rgba(255,255,255,0.06)",
                      border: `1.5px solid ${sel ? BRAND_PURPLE : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 10, cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{type.emoji}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: sel ? "#fff" : "rgba(255,255,255,0.5)", letterSpacing: "-0.01em" }}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* CTA */}
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "15px 24px",
              background: BRAND_PURPLE, color: "#fff",
              fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em",
              border: "none", borderRadius: 12,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: "inherit",
            }}>
              {loading ? "Claiming…" : <><span>Claim My Spot</span><ArrowRight size={15} /></>}
            </button>
          </form>
        )}

        {formError && !submitted && (
          <p style={{ color: "rgb(248,113,113)", fontSize: 13, margin: "10px auto 0", maxWidth: 480, textAlign: "center" }}>
            {formError}
          </p>
        )}

        {/* Social proof */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 12, marginTop: 24, marginBottom: 28,
          position: "relative", zIndex: 1,
        }}>
          <div style={{ display: "flex" }}>
            {AVATARS.map((src, i) => (
              <div key={i} style={{
                width: 32, height: 32, borderRadius: "50%",
                border: "2px solid #060606",
                overflow: "hidden",
                marginLeft: i === 0 ? 0 : -10,
                position: "relative",
                zIndex: AVATARS.length - i,
              }}>
                <Image src={src} alt="" width={32} height={32} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
              </div>
            ))}
          </div>
          <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.45)", letterSpacing: "-0.01em" }}>
            Join <strong style={{ color: "#fff" }}>1,280+</strong> shop owners already on the waitlist
          </span>
        </div>

        {/* Photo cards — unequal widths */}
        <div className="wl-photo-grid" style={{
          position: "relative", zIndex: 1,
          display: "grid", gridTemplateColumns: "1.45fr 1fr",
          gap: 10,
          marginTop: 48,
          paddingLeft: 120,
          paddingRight: 120,
          boxSizing: "border-box",
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
          height: 540,
        }}>
          {/* Left card — wider */}
          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", height: "100%" }}>
            <Image src="/her1.png" alt="" fill sizes="60vw" style={{ objectFit: "cover", objectPosition: "center top" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }} />
            <div style={{
              position: "absolute", bottom: 20, left: 20,
              background: "#fff", borderRadius: 12, padding: "14px 18px",
              minWidth: 210, boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Bookings Today</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", background: "rgba(22,163,74,0.1)", borderRadius: 999, padding: "2px 7px" }}>↑ 23%</span>
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, color: "#0a0a0a", letterSpacing: "-0.04em", marginBottom: 12 }}>47</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[["Confirmed", "31", "#16a34a"], ["Pending", "10", "#f59e0b"], ["No-shows filled", "6", "#712AE2"]].map(([label, val, color]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#999", display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />{label}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#0a0a0a" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right card — narrower */}
          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", height: "100%" }}>
            <Image src="/her2.png" alt="" fill sizes="40vw" style={{ objectFit: "cover", objectPosition: "center top" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }} />
            <div style={{
              position: "absolute", bottom: 20, left: 20,
              background: "#fff", borderRadius: 12, padding: "14px 18px",
              minWidth: 210, boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>Revenue This Week</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", background: "rgba(22,163,74,0.1)", borderRadius: 999, padding: "2px 7px" }}>↑ 18%</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#0a0a0a", letterSpacing: "-0.04em", marginBottom: 12 }}>£3,840</div>
              <div style={{ height: 6, borderRadius: 3, background: "#f0f0f0", overflow: "hidden", marginBottom: 10 }}>
                <div style={{ height: "100%", width: "78%", borderRadius: 3, background: `linear-gradient(to right, ${BRAND_PURPLE}, #a06ee8)` }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[["Bookings", "£2,400", "#712AE2"], ["Recovered", "£1,240", "#16a34a"], ["Tips", "£200", "#f59e0b"]].map(([label, val, color]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#999", display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />{label}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#0a0a0a" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. How it works ── */}
      <section className="wl-how" style={{
        padding: "100px 120px 120px",
        width: "100%", boxSizing: "border-box",
      }}>
        <div>
          {/* Header row */}
          <div style={{ marginBottom: 72 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "rgba(113,42,226,0.12)", border: "1px solid rgba(113,42,226,0.3)",
              borderRadius: 999, padding: "6px 14px", marginBottom: 28,
            }}>
              <span style={{ fontSize: 11, color: BRAND_PURPLE }}>✦</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: BRAND_PURPLE, letterSpacing: "0.08em", textTransform: "uppercase" }}>How It Works</span>
            </div>
            <h2 ref={howRef} style={{
              fontSize: "clamp(32px, 4vw, 56px)",
              fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.08,
              color: "#fff", margin: 0, maxWidth: 900,
            }}>
              {"From waitlist to fully\nrunning shop in minutes.".split("").map((char, i) =>
                char === "\n"
                  ? <br key={i} />
                  : (
                    <span key={i} style={{
                      display: "inline-block",
                      opacity: howVisible ? undefined : 0,
                      animation: howVisible ? `blurDrop 0.45s cubic-bezier(0.16,1,0.3,1) ${i * 0.03}s forwards` : "none",
                      whiteSpace: char === " " ? "pre" : "normal",
                    }}>
                      {char}
                    </span>
                  )
              )}
            </h2>
          </div>

          {/* 3-column steps */}
          <div className="wl-steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{ paddingRight: i < 2 ? 48 : 0, paddingLeft: i > 0 ? 48 : 0, borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                <div style={{ height: 2, background: i === 0 ? BRAND_PURPLE : "rgba(255,255,255,0.1)", marginBottom: 24, borderRadius: 1 }} />
                <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: BRAND_PURPLE, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>{step.n}</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", margin: "0 0 12px" }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Video */}
          <div style={{ marginTop: 72 }}>
            <ScrollZoom minScale={0.88}>
              <div style={{ aspectRatio: "16/9", borderRadius: 10, overflow: "hidden" }}>
                <iframe
                  src="https://drive.google.com/file/d/16kEw9y92fjrpefWpY39HA_DjDehmx9oU/preview"
                  style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                  allow="autoplay"
                  allowFullScreen
                />
              </div>
            </ScrollZoom>
          </div>
        </div>
      </section>

      {/* ── Founder's Note ── */}
      <section className="wl-founder" style={{
        padding: "100px 120px",
        width: "100%", boxSizing: "border-box",
      }}>
        <div style={{ width: "100%", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              background: "rgba(250,219,229,0.07)", border: "0.5px solid rgba(250,219,229,0.22)",
              borderRadius: 7, padding: "10px 15px",
            }}>
              <Sparkles size={14} color="rgb(250,219,229)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, fontWeight: 500, color: "rgb(250,219,229)", letterSpacing: "0.01em", whiteSpace: "nowrap" }}>
                A note from our founder
              </span>
            </div>
          </div>
          <blockquote style={{ margin: 0, padding: 0 }}>
            <p
              ref={founderParaRef}
              style={{ fontSize: "clamp(20px, 2.4vw, 36px)", lineHeight: 1.6, letterSpacing: "-0.02em", fontWeight: 600, margin: "0 0 48px", textAlign: "center" }}
            >
              {`“I built FlatPurse Flow because I watched my cousin lose thousands every month to no-shows and cancellations — and no existing tool actually fixed it. AutoPilot isn’t a feature, it’s the whole point. The shops joining us early aren’t just customers. They’re the reason we keep building. I want to speak to every one of them personally.”`.split(" ").map((word, i) => (
                <span
                  key={i}
                  ref={(el) => { wordRefs.current[i] = el; }}
                  style={{ color: "rgba(255,255,255,0.15)", transition: "color 0.1s ease" }}
                >
                  {word}{" "}
                </span>
              ))}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: BRAND_PURPLE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>G</span>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>George</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Co-founder, FlatPurse Flow</div>
              </div>
            </div>
          </blockquote>
        </div>
      </section>

      {/* ── 3. What you get ── */}
      <section className="wl-perks-section" style={{ background: "#060606", padding: "100px 120px 0", boxSizing: "border-box", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(113,42,226,0.12)", border: "1px solid rgba(113,42,226,0.3)",
            borderRadius: 999, padding: "6px 14px", marginBottom: 20,
          }}>
            <span style={{ fontSize: 11, color: BRAND_PURPLE }}>✦</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: BRAND_PURPLE, letterSpacing: "0.06em", textTransform: "uppercase" }}>Early Access</span>
          </div>
          <h2 style={{ fontSize: "clamp(26px, 3vw, 42px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, color: "#fff", margin: "0 0 14px" }}>
            What you get for joining early.
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.7 }}>
            Early members get more than access. They get an unfair advantage.
          </p>
        </div>
        <div className="wl-perks-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
          {PERKS.map((perk, i) => {
            const isTop = true;
            const isLeft = i === 0;
            const BORDER = "1px solid rgba(255,255,255,0.07)";
            return (
              <div key={i} className="perk-cell" style={{
                padding: "48px 48px",
                aspectRatio: "1",
                borderTop: isTop ? BORDER : "none",
                borderBottom: BORDER,
                borderLeft: isLeft ? BORDER : "none",
                borderRight: BORDER,
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                transition: "background 0.25s ease",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 0,
                  background: perk.iconBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: perk.iconColor,
                }}>
                  {perk.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.025em", margin: "0 0 8px" }}>{perk.title}</h3>
                  <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{perk.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div style={{ padding: "80px 0 100px", maxWidth: 860, margin: "0 auto" }}>
          <h3 style={{ fontSize: "clamp(24px, 2.5vw, 36px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 48px", textAlign: "center" }}>
            Frequently Asked Questions
          </h3>
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  style={{ all: "unset", width: "100%", display: "flex", alignItems: "center", gap: 24, padding: "28px 0", cursor: "pointer", boxSizing: "border-box" }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: BRAND_PURPLE, letterSpacing: "0.06em", flexShrink: 0, width: 20 }}>{faq.n}</span>
                  <span style={{ flex: 1, fontSize: 16, fontWeight: 500, color: isOpen ? "#fff" : "rgba(255,255,255,0.7)", letterSpacing: "-0.02em", textAlign: "left", transition: "color 0.2s" }}>{faq.q}</span>
                  <ChevronDown size={18} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)" }} />
                </button>
                <div style={{ overflow: "hidden", maxHeight: isOpen ? 220 : 0, opacity: isOpen ? 1 : 0, transition: "max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease" }}>
                  <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, margin: "0 0 28px", paddingLeft: 44 }}>{faq.a}</p>
                </div>
              </div>
            );
          })}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />
        </div>
      </section>

      <Footer />

      <style>{`
        input::placeholder { color: rgba(255,255,255,0.3); }
        input:focus { outline: none; }
        .perk-cell:hover { background: rgba(255,255,255,0.03); }

        @keyframes blurDrop {
          from { opacity: 0; filter: blur(10px); transform: translateY(-14px); }
          to   { opacity: 1; filter: blur(0px);  transform: translateY(0px); }
        }
        .blur-drop {
          opacity: 0;
          animation: blurDrop 0.45s cubic-bezier(0.16,1,0.3,1) forwards;
        }

        @media (max-width: 768px) {
          .wl-nav { padding: 16px 20px !important; }

          .wl-hero { padding: 24px 20px 60px !important; min-height: auto !important; }

          .wl-form {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: auto auto !important;
            border-radius: 16px !important;
            gap: 0 !important;
            padding: 10px !important;
          }
          .wl-form input {
            grid-column: 1;
            grid-row: 1;
            padding: 13px 14px !important;
            font-size: 15px !important;
            border-right: 1px solid rgba(255,255,255,0.08) !important;
          }
          .wl-form select {
            grid-column: 2;
            grid-row: 1;
            padding: 13px 14px !important;
            font-size: 15px !important;
          }
          .wl-form button {
            grid-column: 1 / -1 !important;
            grid-row: 2 !important;
            width: 100% !important;
            justify-content: center !important;
            border-radius: 10px !important;
            margin-top: 8px !important;
          }
          .wl-form > div { display: none !important; }

          .wl-photo-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          .wl-photo-grid > div { height: 300px !important; }
          .wl-photo-grid > div:last-child { display: none !important; }

          .wl-how { padding: 60px 20px 60px !important; }
          .wl-steps-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .wl-steps-grid > div {
            padding-left: 0 !important;
            padding-right: 0 !important;
            border-left: none !important;
            padding-bottom: 40px !important;
            border-bottom: 1px solid rgba(255,255,255,0.07) !important;
          }
          .wl-steps-grid > div:last-child { border-bottom: none !important; padding-bottom: 0 !important; }

          .wl-founder { padding: 60px 20px !important; }

          .wl-perks-section { padding: 60px 0 0 !important; }
          .wl-perks-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .perk-cell {
            padding: 28px 24px !important;
            aspect-ratio: unset !important;
            min-height: 200px !important;
          }
        }
      `}</style>
    </div>
  );
}
