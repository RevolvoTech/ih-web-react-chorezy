import { ImageResponse } from "next/og";

export const alt = "Chorezy: get local help or earn close to home";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(125deg, #ff5533 0%, #ff3a6b 24%, #8e44ad 46%, #226dff 72%, #0f9d58 100%)",
        color: "white",
        display: "flex",
        height: "100%",
        justifyContent: "space-between",
        padding: "76px 84px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 790 }}>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em" }}>Chorezy</div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 78, fontWeight: 900, letterSpacing: "-0.055em", lineHeight: 0.98, marginTop: 72 }}>
          <span>Get local help.</span>
          <span>Earn close to home.</span>
        </div>
        <div style={{ fontSize: 27, marginTop: 42, opacity: 0.86 }}>Launching across the United States</div>
      </div>
      <div
        style={{
          alignItems: "center",
          background: "rgba(255,255,255,0.95)",
          borderRadius: 78,
          color: "#226dff",
          display: "flex",
          fontSize: 88,
          fontWeight: 900,
          height: 156,
          justifyContent: "center",
          width: 156,
        }}
      >
        C
      </div>
    </div>,
    size,
  );
}
