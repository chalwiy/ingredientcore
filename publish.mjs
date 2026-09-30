import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicFiles } from './release-files.mjs';

// Build a Pages artifact only after its real public URL is known. This keeps
// canonical and sitemap URLs off an unpurchased or unconfigured domain.
const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(root, '.publish');
const supplied = process.argv[2] || process.env.SITE_URL;
if (!supplied) throw new Error('Pass the public site URL, for example: node publish.mjs https://OWNER.github.io/IngredientCore/');
let base;
try { base = new URL(supplied); }
catch { throw new Error('SITE_URL must be a valid public HTTPS URL, for example https://OWNER.github.io/IngredientCore/'); }
if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) {
  throw new Error('SITE_URL must be a public HTTPS URL without credentials, query or fragment.');
}
if (base.pathname.includes('..')) throw new Error('SITE_URL cannot contain parent path segments.');
base.pathname = base.pathname.replace(/\/+$/, '') + '/';
const siteUrl = base.href;
const escapeXml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const jsonLd = value => JSON.stringify(value).replaceAll('<', '\\u003c');

if (output !== path.join(root, '.publish') || !output.startsWith(root + path.sep)) {
  throw new Error('Unexpected output directory.');
}
if (fs.existsSync(output) && (fs.lstatSync(output).isSymbolicLink() || !fs.lstatSync(output).isDirectory())) {
  throw new Error('Release output must be a normal .publish directory.');
}
// Explicit release allowlist: private documents or audit files placed in a
// source directory cannot become downloads through recursive directory copying.
if (new Set(publicFiles).size !== publicFiles.length) throw new Error('Duplicate public file in release allowlist.');
for (const relative of publicFiles) {
  const sourceFile = path.resolve(root,relative);
  if (!sourceFile.startsWith(root + path.sep) || !fs.existsSync(sourceFile) || !fs.lstatSync(sourceFile).isFile()) {
    throw new Error(`Missing or invalid public file before release cleanup: ${relative}`);
  }
}
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output);
for (const relative of publicFiles) {
  const sourceFile = path.resolve(root,relative);
  const destination = path.join(output,relative);
  fs.mkdirSync(path.dirname(destination),{recursive:true});
  fs.copyFileSync(sourceFile,destination);
}

const pages = [];
function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(file);
    else if (entry.name.endsWith('.html')) pages.push(path.relative(output, file).replaceAll(path.sep, '/'));
  }
}
visit(output);
for (const page of pages) {
  const file = path.join(output, page);
  let html = fs.readFileSync(file, 'utf8');
  if (page === '404.html') {
    // GitHub Pages serves this file at the missing URL, which can be nested.
    // An absolute base keeps its home link, styles and logo working there.
    html = html.replace('<head>', `<head>\n  <base href="${escapeXml(base.pathname)}">`);
  } else {
    const canonical = new URL(page, siteUrl).href;
    let seo = `  <link rel="canonical" href="${escapeXml(canonical)}">\n  <meta property="og:url" content="${escapeXml(canonical)}">\n`;
    if (page === 'index.html') {
      html = html.replace('content="assets/img/hero-bakery.jpg"', `content="${escapeXml(new URL('assets/img/hero-bakery.jpg', siteUrl).href)}"`);
      // The website name and public URL are known at release time. No SearchAction
      // is declared because this static catalogue has no results URL.
      seo += `  <script type="application/ld+json">${jsonLd({'@context':'https://schema.org','@type':'WebSite',name:'IngredientCore',url:siteUrl})}</script>\n`;
    }
    html = html.replace('</head>', `${seo}</head>`);
  }
  fs.writeFileSync(file, html);
}
const sitemapPages = pages.filter(page => page !== '404.html').sort();
fs.writeFileSync(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPages.map(page => `  <url><loc>${escapeXml(new URL(page, siteUrl).href)}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(output, 'robots.txt'), `User-agent: *\nAllow: ${base.pathname}\nSitemap: ${new URL('sitemap.xml', siteUrl).href}\n`);
console.log(`Prepared ${sitemapPages.length} indexable pages at ${output} for ${siteUrl}`);
