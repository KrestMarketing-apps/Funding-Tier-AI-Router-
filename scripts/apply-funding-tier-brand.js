const fs = require('fs');
const path = require('path');

const root = process.cwd();
const pkgRoot = path.join(root, 'node_modules', 'funding-tier-brand-system');
const brandDir = path.join(root, 'brand');

const copyTargets = [
  ['css/funding-tier-brand.css', 'funding-tier-brand.css'],
  ['tokens/funding-tier.tokens.json', 'funding-tier.tokens.json'],
  ['src/index.js', 'funding-tier-brand.js']
];

const htmlFiles = [
  'index.html',
  'credit-card-calculator.html',
  'legacy-support.html',
  'admins/legacy-capital-billable-payout-simulator.html',
  'agents/legacy-capital-program-calculator.html'
];

function assertExists(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found: ${filePath}`);
  }
}

function ensureBrandFiles() {
  assertExists(pkgRoot, 'Brand package');
  fs.mkdirSync(brandDir, { recursive: true });

  for (const [sourceRel, destName] of copyTargets) {
    const source = path.join(pkgRoot, sourceRel);
    const dest = path.join(brandDir, destName);
    assertExists(source, 'Brand source file');
    fs.copyFileSync(source, dest);
    console.log(`Copied ${sourceRel} -> brand/${destName}`);
  }
}

function getRelativeBrandHref(htmlRelPath) {
  const depth = htmlRelPath.split('/').length - 1;
  const prefix = depth === 0 ? './' : '../'.repeat(depth);
  return `${prefix}brand/funding-tier-brand.css`;
}

function patchHtmlFile(htmlRelPath) {
  const filePath = path.join(root, htmlRelPath);
  if (!fs.existsSync(filePath)) {
    console.warn(`Skipped missing HTML file: ${htmlRelPath}`);
    return;
  }

  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('funding-tier-brand.css')) {
    console.log(`Already linked: ${htmlRelPath}`);
    return;
  }

  const href = getRelativeBrandHref(htmlRelPath);
  const tag = `<link rel="stylesheet" href="${href}">`;

  if (html.includes('</head>')) {
    html = html.replace('</head>', `${tag}\n</head>`);
  } else if (html.includes('<head>')) {
    html = html.replace('<head>', `<head>\n${tag}`);
  } else {
    console.warn(`No <head> found, skipped: ${htmlRelPath}`);
    return;
  }

  fs.writeFileSync(filePath, html);
  console.log(`Patched ${htmlRelPath} with ${href}`);
}

function main() {
  ensureBrandFiles();
  htmlFiles.forEach(patchHtmlFile);
  console.log('\nFunding Tier brand files copied and HTML pages patched.');
}

main();
