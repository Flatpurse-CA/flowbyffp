"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Armchair, CalendarClock, Check, ChevronLeft, ChevronRight, Flower2,
  MonitorPlay, Rocket, Scissors, Sparkles, Users, X,
} from "lucide-react";
import { submitDemoFunnel } from "./actions";

// Set after a successful submit so returning visitors go straight to the video.
const UNLOCK_KEY = "flow-demo-unlocked";

const BUSINESS_TYPES = [
  { label: "Hair salon", icon: Scissors },
  { label: "Barbershop", icon: Armchair },
  { label: "Nails & beauty", icon: Sparkles },
  { label: "Spa & wellness", icon: Flower2 },
];
const TEAM_SIZES = ["Just me", "2-3", "4-6", "7-10", "11-20", "21+"];
const BOOKING_METHODS = ["Walk-ins", "Phone or text", "Instagram or WhatsApp", "Another booking app", "Pen and paper", "A mix of these"];

function readUnlocked(): string | null {
  try { return localStorage.getItem(UNLOCK_KEY); } catch { return null; }
}
const noopSubscribe = () => () => {};

const STEP_ICONS = [MonitorPlay, Users, CalendarClock, Rocket];
const TOTAL_STEPS = 4;

export default function DemoFunnel() {
  const router = useRouter();
  // Question steps 0-3; the video replaces them once details are submitted.
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ businessType: "", teamSize: "", bookingMethod: "" });
  const [form, setForm] = useState({ name: "", email: "", business: "", phone: "", website: "", marketing: false });
  const [status, setStatus] = useState({ submitting: false, error: "" });
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Name saved by an earlier visit's submit; null on the server and when storage is blocked.
  const storedName = useSyncExternalStore(noopSubscribe, readUnlocked, () => null);
  const unlockedName = submittedName ?? storedName;
  const showVideo = unlockedName !== null;
  const firstName = unlockedName ?? "";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") router.push("/"); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router]);

  useEffect(() => {
    if (!showVideo) return;
    const video = videoRef.current;
    if (!video) return;
    // Browsers may block autoplay with sound; fall back to muted playback.
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => {});
    });
  }, [showVideo]);

  function choose(key: keyof typeof answers, value: string) {
    setAnswers((a) => ({ ...a, [key]: value }));
    // Short pause so the selected card registers before the step changes.
    setTimeout(() => setStep((s) => s + 1), 220);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    setStatus({ submitting: true, error: "" });
    try {
      const { error } = await submitDemoFunnel({ ...form, ...answers });
      if (error) {
        setStatus({ submitting: false, error });
        return;
      }
      const first = form.name.trim().split(/\s+/)[0] ?? "";
      try { localStorage.setItem(UNLOCK_KEY, first); } catch {}
      setSubmittedName(first);
      setStatus({ submitting: false, error: "" });
    } catch {
      setStatus({ submitting: false, error: "We couldn't save your details. Please try again or email support@flatpurse.com." });
    }
  }

  const StepIcon = STEP_ICONS[step];

  return (
    <div className="demo-shell">
      <Link href="/" className="demo-close" aria-label="Close and go back to the homepage">
        <X size={28} strokeWidth={1.6} />
      </Link>

      {!showVideo ? (
        <div className="demo-stage" key={step}>
          <StepIcon className="demo-step-icon" size={56} strokeWidth={1.5} aria-hidden="true" />
          <Stepper current={step} />

          {step === 0 && (
            <>
              <h1>See Flow in action</h1>
              <p className="demo-sub">We just need to know a bit about your business first. Let&apos;s start with what you run.</p>
              <div className="demo-grid demo-grid-types">
                {BUSINESS_TYPES.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    className={`demo-card demo-card-icon${answers.businessType === label ? " is-selected" : ""}`}
                    onClick={() => choose("businessType", label)}
                  >
                    <Icon size={30} strokeWidth={1.6} aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1>How many people work in your shop?</h1>
              <p className="demo-sub">Include yourself and anyone who takes bookings.</p>
              <div className="demo-grid">
                {TEAM_SIZES.map((label) => (
                  <button
                    key={label}
                    type="button"
                    className={`demo-card${answers.teamSize === label ? " is-selected" : ""}`}
                    onClick={() => choose("teamSize", label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <StepNav onBack={() => setStep(0)} onSkip={() => { setAnswers((a) => ({ ...a, teamSize: "" })); setStep(2); }} />
            </>
          )}

          {step === 2 && (
            <>
              <h1>How do clients book with you today?</h1>
              <p className="demo-sub">Pick the one you rely on most.</p>
              <div className="demo-grid">
                {BOOKING_METHODS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    className={`demo-card${answers.bookingMethod === label ? " is-selected" : ""}`}
                    onClick={() => choose("bookingMethod", label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <StepNav onBack={() => setStep(1)} onSkip={() => { setAnswers((a) => ({ ...a, bookingMethod: "" })); setStep(3); }} />
              <div className="demo-why">
                <strong>Why are we asking?</strong>
                <p>It helps us show you the parts of Flow that matter most for how your shop runs.</p>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1>You&apos;re almost there!</h1>
              <p className="demo-sub">Tell us where to reach you and the walkthrough starts right away.</p>
              <form className="demo-form" onSubmit={handleSubmit}>
                <input aria-label="Full name" placeholder="Full name" name="name" required autoFocus autoComplete="name" maxLength={100}
                  value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} disabled={status.submitting} />
                <input aria-label="Email address" placeholder="Email address" name="email" type="email" required autoComplete="email" maxLength={254}
                  value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} disabled={status.submitting} />
                <input aria-label="Phone number (optional)" placeholder="Phone number (optional)" name="phone" type="tel" autoComplete="tel" maxLength={40}
                  value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} disabled={status.submitting} />
                <input aria-label="Business name" placeholder="Business name" name="business" required autoComplete="organization" maxLength={150}
                  value={form.business} onChange={(e) => setForm((f) => ({ ...f, business: e.target.value }))} disabled={status.submitting} />
                <div className="demo-trap" aria-hidden="true">
                  <label>Website
                    <input name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
                  </label>
                </div>
                <label className="demo-check">
                  <input type="checkbox" checked={form.marketing} onChange={(e) => setForm((f) => ({ ...f, marketing: e.target.checked }))} disabled={status.submitting} />
                  <span>I&apos;d also like occasional Flow product updates and offers. Optional.</span>
                </label>
                <button type="submit" className="demo-submit" disabled={status.submitting}>
                  {status.submitting ? "Saving..." : "Watch now"}
                </button>
                <p role="status" aria-live="polite" className="demo-error">{status.error}</p>
                <p className="demo-legal">
                  We&apos;ll use your details to follow up about Flow. Marketing updates are optional and you can opt out at any time.
                  See our <Link href="/privacy">Privacy Policy</Link> for more details.
                </p>
              </form>
              <StepNav onBack={() => setStep(2)} />
            </>
          )}
        </div>
      ) : (
        <div className="demo-stage demo-stage-video">
          <h1>{firstName ? `Here's Flow in action, ${firstName}.` : "Here's Flow in action."}</h1>
          <p className="demo-sub">A quick tour of bookings, payments and AI follow-ups.</p>
          <div className="demo-video">
            <video ref={videoRef} controls playsInline preload="auto" aria-label="FlatPurse Flow walkthrough">
              <source src="/flowdemo.mp4" type="video/mp4" />
              Your browser does not support embedded video. <a href="/flowdemo.mp4">Watch the video</a>.
            </video>
          </div>
          <div className="demo-after">
            <Link href="/signup" className="demo-submit">Start your free trial</Link>
            <a href="mailto:support@flatpurse.com?subject=Flow%20live%20demo" className="demo-ghost">Book a live call</a>
          </div>
        </div>
      )}
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="demo-stepper" aria-label={`Step ${current + 1} of ${TOTAL_STEPS}`}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li key={i} className={`is-${state}`}>
            {i > 0 && <span className="demo-stepper-line" aria-hidden="true" />}
            <span className="demo-stepper-dot">
              {state === "done" ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : i + 1}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function StepNav({ onBack, onSkip }: { onBack: () => void; onSkip?: () => void }) {
  return (
    <div className="demo-nav">
      <button type="button" onClick={onBack}><ChevronLeft size={18} /> Previous</button>
      {onSkip && <button type="button" onClick={onSkip}>I prefer not to say <ChevronRight size={18} /></button>}
    </div>
  );
}
