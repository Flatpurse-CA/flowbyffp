import Link from "next/link";

const INK = "#342448";
const NAV_MUTED = "#5b5b5b";
const PURPLE = "#33067a";

const NAV_LINKS = [
  { key: "home", label: "Home", href: "/" },
  { key: "features", label: "Features", href: "/features" },
  { key: "pricing", label: "Pricing", href: "/pricing" },
  { key: "resources", label: "Resources", href: "/#resources" },
];

export default function LandingNav({ active = "home" }: { active?: string }) {
  return (
    <nav
      style={{
        position: "relative",
        height: 90,
        display: "flex",
        alignItems: "center",
        background: "#ffffff",
      }}
    >
      <div
        className="h3-shell"
        style={{
          width: "100%",
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <img src="/home3/logo-mark.svg" alt="" width={28} height={28} />
          <span style={{ fontSize: 16, fontWeight: 700, color: INK }}>
            FlatPurse<span style={{ fontWeight: 400 }}> Flow</span>
          </span>
        </Link>

        <div className="h3-nav-links" style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {NAV_LINKS.map((l) => (
            <a
              key={l.key}
              href={l.href}
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: l.key === active ? "#000" : NAV_MUTED,
                textDecoration: "none",
              }}
            >
              {l.label}
            </a>
          ))}
        </div>

        <Link
          href="/login"
          className="h3-account-btn"
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: PURPLE,
            color: "#fff",
            fontSize: 15,
            padding: "10px 20px",
            borderRadius: 100,
            textDecoration: "none",
          }}
        >
          <img
            src="/home3/btn-glow.svg"
            alt=""
            style={{
              position: "absolute",
              top: -14,
              left: "50%",
              transform: "translateX(-50%)",
              width: "148%",
              pointerEvents: "none",
            }}
          />
          <img src="/home3/lock-icon.svg" alt="" width={18} height={18} style={{ position: "relative" }} />
          <span style={{ position: "relative" }}>Account</span>
        </Link>
      </div>
    </nav>
  );
}
