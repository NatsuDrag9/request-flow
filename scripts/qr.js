import QRCode from "qrcode";
import fs from "node:fs";
import path from "node:path";

const targetUrl = process.argv[2] || "https://requestflow-v0o76jkwr0.cloudcrane.ai/";
const distDir = path.join(process.cwd(), "dist");
const artifactDir = "/home/rohitimandi/.gemini/antigravity/brain/48551699-8b33-4a47-9444-1903624cc31e";

// 1. Generate standalone pure vector SVG
const svgString = await QRCode.toString(targetUrl, {
  type: "svg",
  margin: 2,
  color: {
    dark: "#090d16",
    light: "#ffffff"
  }
});

// 2. Generate PNG file as well for maximum scanner compatibility
await QRCode.toFile(path.join(distDir, "qr.png"), targetUrl, {
  width: 400,
  margin: 2,
  color: {
    dark: "#090d16",
    light: "#ffffff"
  }
});

fs.writeFileSync(path.join(distDir, "qr.svg"), svgString, "utf-8");

// Copy to artifact directory for instant IDE rendering
if (fs.existsSync(artifactDir)) {
  fs.writeFileSync(path.join(artifactDir, "qr.svg"), svgString, "utf-8");
  fs.copyFileSync(path.join(distDir, "qr.png"), path.join(artifactDir, "qr.png"));
}

// 3. Output ANSI terminal QR code
const terminalQR = await QRCode.toString(targetUrl, { type: "terminal", small: true });

console.log("\n📱 Scan this QR code directly from your terminal or chat:");
console.log(terminalQR);
console.log(`🔗 Live URL: ${targetUrl}\n`);
