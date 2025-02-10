const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const isRunFromRoot = () => {
  return fs.existsSync(path.join(process.cwd(), "package.json"));
};

if (!isRunFromRoot()) {
  console.error("This script must be run from the project root directory.");
  process.exit(1);
}

const componentsDir = path.join(__dirname, "../src/components/icons/");
const indexFile = path.join(__dirname, "../src/components/icons/index.ts");

const generateIndex = () => {
  execSync(
    'svgr --icon --typescript --filename-case pascal --out-dir ./src/components/icons/ --jsx-runtime "automatic" --no-index --no-dimensions --no-prettier -- ./src/assets'
  );

  const files = fs.readdirSync(componentsDir);
  const imports = files
    .filter((file) => file.endsWith(".tsx") && file !== "index.tsx")
    .map((file) => {
      const componentName = path.basename(file, ".tsx");
      return `export { default as Icon${componentName} } from './${componentName}';`;
    });

  const indexContent = `${imports.join("\n")}\n`;
  fs.writeFileSync(indexFile, indexContent);
};

generateIndex();
