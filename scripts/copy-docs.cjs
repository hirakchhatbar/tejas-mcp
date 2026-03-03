const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "src", "data", "docs");
const dest = path.join(__dirname, "..", "dist", "data", "docs");

if (!fs.existsSync(path.join(__dirname, "..", "dist"))) {
  console.error("Run tsc first (dist/ not found).");
  process.exit(1);
}

fs.mkdirSync(dest, { recursive: true });
for (const name of fs.readdirSync(src)) {
  const srcPath = path.join(src, name);
  const destPath = path.join(dest, name);
  if (fs.statSync(srcPath).isFile()) {
    fs.copyFileSync(srcPath, destPath);
  }
}
console.log("Copied docs to dist/data/docs");
