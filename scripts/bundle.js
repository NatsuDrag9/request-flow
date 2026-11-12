import fs from "node:fs";
import path from "node:path";
import esbuild from "esbuild";

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

// Compile TypeScript engine module into self-contained IIFE
const enginePath = path.join(srcDir, "features/01-pipeline-explorer/engine.ts");
let engineJs = "";
if (fs.existsSync(enginePath)) {
  const engineBuild = esbuild.buildSync({
    entryPoints: [enginePath],
    bundle: true,
    format: "iife",
    globalName: "RequestFlowEngine",
    minify: false,
    write: false,
  });
  engineJs = engineBuild.outputFiles[0].text;
}

let htmlContent = fs.readFileSync(srcHtmlPath, "utf-8");

// Inject compiled engine into HTML before user script
if (engineJs) {
  if (htmlContent.includes("/* <!-- ENGINE_BUNDLE --> */")) {
    htmlContent = htmlContent.replace("/* <!-- ENGINE_BUNDLE --> */", engineJs);
  } else {
    htmlContent = htmlContent.replace("<script>", `<script>\n/* Compiled RequestFlowEngine */\n${engineJs}\n`);
  }
}

// Validation checks
if (htmlContent.length > 1024 * 1024) {
  console.error(`Error: Bundle size exceeds 1 MB limit (${(htmlContent.length / 1024).toFixed(2)} KB)`);
  process.exit(1);
}

// Forbidden identifier check per CloudCrane rules
if (/\b(?:var|let|const|function)\s+open\b/.test(htmlContent)) {
  console.error("Error: Forbidden top-level identifier 'open' found in bundle!");
  process.exit(1);
}

fs.writeFileSync(distHtml, htmlContent, "utf-8");
const sizeKb = (Buffer.byteLength(htmlContent, "utf-8") / 1024).toFixed(2);
console.log(`✓ Built single-file bundle with TypeScript Engine: dist/index.html (${sizeKb} KB)`);
