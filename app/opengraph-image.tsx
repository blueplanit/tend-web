import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Tend: Pippy, a calm little creature, in its garden";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const pippy = await readFile(
  join(process.cwd(), "public/pippy/pippy-content-512.png"),
  "base64",
);

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 90px",
          background: "linear-gradient(180deg, #DDEBF3 0%, #DDEBF3 62%, #CFE3CC 62%, #CFE3CC 100%)",
          color: "#26332E",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 620 }}>
          <div style={{ fontSize: 96, fontWeight: 700, color: "#3E6B52" }}>Tend</div>
          <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.2, marginTop: 12 }}>
            A calmer way to pay down debt, with Pippy.
          </div>
          <div style={{ fontSize: 30, marginTop: 24, color: "#5E6B66" }}>
            Beta coming soon on Android and iPhone
          </div>
        </div>
        <img src={`data:image/png;base64,${pippy}`} width={400} height={400} alt="" />
      </div>
    ),
    size,
  );
}
