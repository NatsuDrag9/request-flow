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

// Strip HTML comments (preserving conditional IE comments if any)
htmlContent = htmlContent.replace(/<!--(?!\[)[\s\S]*?-->/g, "");

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

// Safely minify inline <script> blocks (preserves function names & top-level bindings)
htmlContent = htmlContent.replace(/<script>([\s\S]*?)<\/script>/g, (_, js) => {
  const minJs = esbuild.transformSync(js, {
    loader: "js",
    minifyWhitespace: true,
    minifySyntax: true,
    minifyIdentifiers: false,
  }).code;
  return `<script>${minJs}</script>`;
});

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
