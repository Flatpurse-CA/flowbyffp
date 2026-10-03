import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// Header for the home-4 design's subpages (/about, /autopilot); they use the app's own Footer.
// Same markup and classes as Home4Landing so home-4.css styles them.

export function FlowLogo() {
  return (
    <svg className="brand-mark" viewBox="0 0 604 364" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="h4ChromeLogoGradient" x1="0" y1="0" x2="604" y2="364" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#534AB7" />
          <stop offset="100%" stopColor="#B05CF0" />
        </linearGradient>
      </defs>
      <g stroke="url(#h4ChromeLogoGradient)" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 212C12 132 72 72 152 72H312" />
        <path d="M312 12V352" />
        <path d="M312 72H592C592 122 552 152 502 152H312" />
        <path d="M12 212H592" />
        <path d="M312 212H592C592 262 552 292 502 292H312" />
      </g>
    </svg>
  );
}

export function Arrow({ size = 16 }: { size?: number }) {
  return <ArrowUpRight className="h4-arrow" size={size} aria-hidden="true" />;
}

export function H4Header({ current }: { current?: "about" | "autopilot" }) {
  return (
    <header>
      <Link className="brand" href="/">
        <FlowLogo /> <span>FlatPurse <b>Flow</b></span>
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/about" aria-current={current === "about" ? "page" : undefined}>About</Link>
        <Link href="/autopilot" aria-current={current === "autopilot" ? "page" : undefined}>AutoPilot</Link>
        <Link href="/pricing">Pricing</Link>
      </nav>
      <div className="nav-end">
        <Link className="login" href="/login">Log in</Link>
        <Link className="button small" href="/signup">
          Start free trial <Arrow />
        </Link>
      </div>
    </header>
  );
}
