import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicFiles } from './release-files.mjs';

const source = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(source, '.publish');
const supplied = process.argv[2] || process.env.SITE_URL;
const simulation = process.argv.includes('--simulation');
if (!supplied) throw new Error('Release gate requires the approved SITE_URL.');
let base;
try { base = new URL(supplied); } catch { throw new Error('SITE_URL is not a valid URL.'); }
if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash || base.pathname.includes('..')) {
  throw new Error('SITE_URL must be a public HTTPS URL without credentials, query, fragment or parent path.');
}
base.pathname = base.pathname.replace(/\/+$/, '') + '/';
const siteUrl = base.href;
if (!simulation && (base.hostname === 'localhost' || base.hostname.endsWith('.localhost') || base.hostname.endsWith('.invalid') || base.hostname.endsWith('.test') || base.hostname.endsWith('.example') || base.hostname === 'example.com' || base.hostname.startsWith('example.') || /^(?:owner|account|your-account)(?:\.|-)/i.test(base.hostname) || base.hostname === 'foodadditivesource.com')) {
  throw new Error('Production release requires a confirmed, active public URL; example and proposed domains are blocked.');
}
if (!fs.existsSync(output) || !fs.lstatSync(output).isDirectory() || fs.lstatSync(output).isSymbolicLink()) {
  throw new Error('Missing normal .publish directory. Run publish.mjs first.');
}
const actual = [];
function visit(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Release contains symlink: ${file}`);
    if (entry.isDirectory()) visit(file);
    else if (entry.isFile()) actual.push(path.relative(output, file).replaceAll(path.sep, '/'));
    else throw new Error(`Unexpected release entry: ${file}`);
  }
}
visit(output);
const expected = [...publicFiles, 'sitemap.xml', 'robots.txt'].sort();
actual.sort();
if (new Set(expected).size !== expected.length || JSON.stringify(actual) !== JSON.stringify(expected)) {
  const missing = expected.filter(file => !actual.includes(file));
  const extra = actual.filter(file => !expected.includes(file));
  throw new Error(`Release file list differs from allowlist. Missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'}.`);
}
const sitemap = fs.readFileSync(path.join(output, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].replaceAll('&amp;', '&'));
const pages = publicFiles.filter(file => file.endsWith('.html') && file !== '404.html');
const expectedUrls = pages.map(page => new URL(page, siteUrl).href).sort();
if (JSON.stringify(urls.sort()) !== JSON.stringify(expectedUrls)) throw new Error('Sitemap URLs do not match approved SITE_URL and page list.');
if (fs.readFileSync(path.join(output, 'robots.txt'), 'utf8').includes(`Sitemap: ${new URL('sitemap.xml', siteUrl).href}`) === false) throw new Error('robots.txt points to a different sitemap.');
for (const page of pages) {
  const html = fs.readFileSync(path.join(output, page), 'utf8');
  const canonical = new URL(page, siteUrl).href;
  if (!html.includes(`<link rel="canonical" href="${canonical}">`) || !html.includes(`<meta property="og:url" content="${canonical}">`)) {
    throw new Error(`${page}: canonical or sharing URL does not match approved SITE_URL.`);
  }
}
const missingPage = fs.readFileSync(path.join(output, '404.html'), 'utf8');
if (!missingPage.includes(`<base href="${base.pathname}">`) || !missingPage.includes('content="noindex"') || missingPage.includes('rel="canonical"')) {
  throw new Error('404 page deployment base or index control is incorrect.');
}
console.log(`Release gate passed (${simulation ? 'local simulation' : 'production URL'}): ${actual.length} exact public files, ${pages.length} canonical pages at ${siteUrl}.`);
