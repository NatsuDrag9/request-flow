import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const srcDir = path.join(rootDir, "src");
const distDir = path.join(rootDir, "dist");
const distHtml = path.join(distDir, "index.html");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Ensure source HTML exists
const srcHtmlPath = path.join(srcDir, "index.html");
if (!fs.existsSync(srcHtmlPath)) {
  console.error("Error: src/index.html not found!");
  process.exit(1);
}

const content = fs.readFileSync(srcHtmlPath, "utf-8");

// Validation checks
if (content.length > 1024 * 1024) {
  console.error(`Error: Bundle size exceeds 1 MB limit (${(content.length / 1024).toFixed(2)} KB)`);
  process.exit(1);
}

// Forbidden identifier check per CloudCrane rules
if (/\b(?:var|let|const|function)\s+open\b/.test(content)) {
  console.error("Error: Forbidden top-level identifier 'open' found in bundle!");
  process.exit(1);
}

fs.writeFileSync(distHtml, content, "utf-8");
const sizeKb = (Buffer.byteLength(content, "utf-8") / 1024).toFixed(2);
console.log(`✓ Built single-file bundle: dist/index.html (${sizeKb} KB)`);
