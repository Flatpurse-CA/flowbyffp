const block = (h: number, w: string | number = "100%"): React.CSSProperties => ({
  height: h,
  width: w,
  borderRadius: 12,
  background: "var(--dsurface3)",
  animation: "fp-skeleton-pulse 1.3s ease-in-out infinite",
});

// Sits inside <main> (see DashboardShell), which already supplies the page
// padding — this only needs to fill it. One shared boundary covers every
// route under /dashboard since none of them nest their own layout.tsx, so
// tapping any mobile nav tab shows this instantly instead of a frozen
// screen while the target page's data streams in.
export default function DashboardLoading() {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", rowGap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={block(22, 160)} />
          <div style={block(13, 100)} />
        </div>
        <div style={block(38, 140)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 14 }}>
        <div style={block(90)} />
        <div style={block(90)} />
        <div style={block(90)} />
      </div>
      <div style={block(280)} />
    </div>
  );
}
