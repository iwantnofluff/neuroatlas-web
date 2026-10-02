import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "NeuroAtlas - The First Stress Management Band";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The default share image for every page, rendered once at build time:
 *  the band photo under a navy wash, with the brand headline in BOOWIE.
 *  The _og fonts are BOOWIE and Mont subset to printable ASCII with its
 *  GPOS/GSUB/GDEF tables dropped, because the image renderer cannot parse
 *  the full fonts' layout tables ("ClassDef format must be 1 or 2"). */
export default async function OpengraphImage() {
  const [boowie, mont, background, mark] = await Promise.all([
    readFile(join(process.cwd(), "src/app/_og/boowie-og.ttf")),
    readFile(join(process.cwd(), "src/app/_og/mont-og.ttf")),
    readFile(join(process.cwd(), "src/app/_og/background.jpg")),
    readFile(join(process.cwd(), "public/brand/logo-mark.svg"), "utf8"),
  ]);
  const markSrc = `data:image/svg+xml;base64,${Buffer.from(mark.replace("currentColor", "#dac79e")).toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", backgroundColor: "#0b1016" }}>
        <img
          src={`data:image/jpeg;base64,${background.toString("base64")}`}
          width={1200}
          height={630}
          alt=""
          style={{ position: "absolute", top: 0, left: 0 }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            backgroundImage: "linear-gradient(90deg, rgba(4,18,31,0.95) 0%, rgba(4,18,31,0.82) 50%, rgba(4,18,31,0.2) 100%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px", width: 760 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <img src={markSrc} width={52} height={53} alt="" />
            <span style={{ fontFamily: "Boowie", fontSize: 34, color: "#f4f0e9", letterSpacing: 2 }}>NEUROATLAS</span>
          </div>
          <div style={{ marginTop: 44, fontFamily: "Boowie", fontSize: 76, lineHeight: 1.05, color: "#f4f0e9" }}>
            THE FIRST STRESS MANAGEMENT BAND
          </div>
          <div style={{ marginTop: 28, fontFamily: "Mont", fontSize: 28, lineHeight: 1.45, color: "rgba(244,240,233,0.82)" }}>
            Know when pressure is building, and reset before it takes over.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Boowie", data: boowie, style: "normal", weight: 400 },
        { name: "Mont", data: mont, style: "normal", weight: 400 },
      ],
    }
  );
}
