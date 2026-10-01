import fs from 'node:fs';
import path from 'node:path';

// Match Bespring's branch publishing: derive URLs from public HTML at repo root.
const root = path.resolve(process.argv[2] || '.');
const origin = 'https://www.ingredientcore.com/';
if (!fs.statSync(root).isDirectory()) throw new Error('Missing static site directory: ' + root);
const pages = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && !['docs','建站过程','content','internal-tools'].includes(entry.name)) walk(file);
    else if (entry.isFile() && entry.name.endsWith('.html')) pages.push(path.relative(root, file).replaceAll(path.sep, '/'));
  }
}
walk(root);
const escapeXml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const urls = [];
for (const page of pages.sort()) {
  if (page === '404.html') continue;
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  if (/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue;
  const url = new URL(page, origin).href;
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
  if (canonical && canonical !== url) throw new Error(`${page}: canonical ${canonical} does not match ${url}`);
  urls.push(url);
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${escapeXml(url)}</loc></url>`).join('\n')}\n</urlset>\n`;
const target = path.join(root, 'sitemap.xml');
if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== sitemap) fs.writeFileSync(target, sitemap);
console.log(`Sitemap checked: ${urls.length} public HTML pages.`);
