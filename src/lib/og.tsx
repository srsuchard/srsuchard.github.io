import { ImageResponse } from "next/og";
import { COLORS } from "./tokens";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * The shared Open Graph card: dark base, one accent rule, name, a line of text and a mono fact line.
 * Rendered at build time (static export); uses the renderer's built-in font.
 */
export function ogImage({ eyebrow, title, line, meta }: { eyebrow: string; title: string; line: string; meta?: string }) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: COLORS.base, color: COLORS.text, padding: "72px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 44, height: 44, borderRadius: 9, background: COLORS.accent, color: COLORS.base, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700 }}>S</div>
          <div style={{ fontSize: 24, color: COLORS.muted, letterSpacing: 2, textTransform: "uppercase" }}>{eyebrow}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>{title}</div>
          <div style={{ marginTop: 24, fontSize: 34, lineHeight: 1.3, color: COLORS.text, maxWidth: 980 }}>{line}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, borderTop: `2px solid ${COLORS.border}`, paddingTop: 24, fontSize: 22, color: COLORS.muted }}>
          <div style={{ width: 28, height: 4, background: COLORS.accent }} />
          <div>{meta ?? "srsuchard.github.io"}</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
