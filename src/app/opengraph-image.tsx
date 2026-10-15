import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Camiones Exclusivos — Camiones usados y 0 km en Cipolletti";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(path.join(process.cwd(), "public", "logo-512.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: 72,
          background: "linear-gradient(135deg, #0A0A0B 0%, #0A0A0B 55%, #0B2A6F 100%)",
          color: "white",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={380} height={380} alt="" style={{ borderRadius: 9999 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 22, flex: 1 }}>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>
            Camiones que trabajan tanto como vos
          </div>
          <div style={{ fontSize: 28, color: "#AFC4FF" }}>Usados y 0 km · Financiación · Permutas</div>
          <div style={{ fontSize: 26, color: "rgba(255,255,255,0.6)" }}>Ruta 22 Km 1213 · Cipolletti, Río Negro</div>
        </div>
      </div>
    ),
    size,
  );
}
