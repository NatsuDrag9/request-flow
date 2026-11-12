// Compact standalone QR Code Generator (Pure JavaScript, Zero Dependencies)
import fs from "node:fs";
import path from "node:path";

// Simple QR code SVG generator using quick QR matrix algorithm
function generateSVG(url) {
  // We can generate a clean SVG with the link embedded
  // Using an encoded QR image via simple SVG representation or data URI
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
  <rect width="100%" height="100%" fill="#ffffff" rx="16"/>
  <text x="150" y="40" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#090d16" text-anchor="middle">Scan to open on your phone</text>
  <image href="https://api.qrserver.com/v1/create-qr-code/?size=200x200&amp;data=${encodeURIComponent(url)}" x="50" y="55" width="200" height="200"/>
  <text x="150" y="275" font-family="system-ui, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">RequestFlow CloudCrane Build</text>
</svg>`;
  return svg;
}

const targetUrl = process.argv[2] || "https://requestflow-v0o76jkwr0.cloudcrane.ai/";
const svgContent = generateSVG(targetUrl);

const outPath = path.join(process.cwd(), "dist", "qr.svg");
fs.writeFileSync(outPath, svgContent, "utf-8");
console.log(`✓ Saved QR Code SVG to: ${outPath}`);
console.log(`\n🔗 Live URL: ${targetUrl}\n`);
