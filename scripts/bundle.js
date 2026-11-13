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

// Compile TypeScript core module into self-contained IIFE
const corePath = path.join(srcDir, "core/index.ts");
const enginePath = fs.existsSync(corePath) ? corePath : path.join(srcDir, "features/01-pipeline-explorer/engine.ts");
let engineJs = "";
if (fs.existsSync(enginePath)) {
  const engineBuild = esbuild.buildSync({
    entryPoints: [enginePath],
    bundle: true,
    format: "iife",
    globalName: "RequestFlowEngine",
    minify: true,
    write: false,
  });
  engineJs = engineBuild.outputFiles[0].text;
}

let htmlContent = fs.readFileSync(srcHtmlPath, "utf-8");

// Minify CSS inside <style>
htmlContent = htmlContent.replace(/<style>([\s\S]*?)<\/style>/g, (_, css) => {
  const minCss = esbuild.transformSync(css, { loader: "css", minify: true }).code;
  return `<style>${minCss}</style>`;
});

// Inject compiled engine into HTML before user script and safely minify JS
if (engineJs) {
  if (htmlContent.includes("/* <!-- ENGINE_BUNDLE --> */")) {
    htmlContent = htmlContent.replace("/* <!-- ENGINE_BUNDLE --> */", engineJs);
  } else {
    htmlContent = htmlContent.replace("<script>", `<script>\n${engineJs}\n`);
  }
}

// Split HTML by <style> and <script> to minify each block appropriately
const parts = htmlContent.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/g);
const minifiedParts = parts.map(part => {
  if (part.startsWith("<style")) {
    return part;
  }
  if (part.startsWith("<script")) {
    const js = part.replace(/^<script>/, "").replace(/<\/script>$/, "");
    const minJs = esbuild.transformSync(js, { loader: "js", minify: true }).code;
    return `<script>${minJs}</script>`;
  }
  // Minify HTML markup: strip comments and collapse redundant whitespace
  return part
    .replace(/<!--(?!\[)[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .trim();
});

htmlContent = minifiedParts.join("");

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
