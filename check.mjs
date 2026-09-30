import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { products } from './content/products.mjs';
import { articles } from './content/articles.mjs';

const source = path.dirname(fileURLToPath(import.meta.url));
const root = process.argv[2] ? path.resolve(source, process.argv[2]) : source;
const published = root !== source;
const errors = [];
const pages = [];
const pageLinks = new Map();
const titles = new Map();
const descriptions = new Map();
const sitemap = published ? fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8') : '';
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].replaceAll('&amp;', '&'));
const homeLocation = locations.filter(location => location.endsWith('/index.html')).sort((a, b) => new URL(a).pathname.length - new URL(b).pathname.length)[0];
const siteUrl = homeLocation ? new URL('./', homeLocation).href : undefined;
if (published && (!siteUrl || !siteUrl.startsWith('https://'))) errors.push('sitemap.xml: missing HTTPS homepage URL');

function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.publish' && directory === source) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(target);
    else if (entry.name.endsWith('.html')) pages.push(path.relative(root, target).replaceAll(path.sep, '/'));
  }
}
collect(root);
for (const [label, entries] of [['product', products], ['article', articles]]) {
  if (new Set(entries.map(entry => entry.slug)).size !== entries.length) errors.push(`Duplicate ${label} route in content manifest`);
}
const expectedPages = new Set([
  'index.html', '404.html',
  ...['products','applications','knowledge','quality','about','contact','privacy'].map(name => `${name}/index.html`),
  ...products.map(product => `products/${product.slug}.html`),
  ...articles.map(article => `knowledge/${article.slug}.html`)
]);
for (const page of pages) if (!expectedPages.has(page)) errors.push(`${page}: stale or unlisted HTML page`);
for (const page of expectedPages) if (!pages.includes(page)) errors.push(`${page}: expected HTML page missing`);
function exactCase(target) {
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return false;
  let current = root;
  for (const segment of relative.split(path.sep)) {
    if (!fs.readdirSync(current).includes(segment)) return false;
    current = path.join(current, segment);
  }
  return true;
}
for (const page of pages) {
  const file = path.join(root, page);
  const html = fs.readFileSync(file, 'utf8');
  const linkedPages = new Set();
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  if (new Set(ids).size !== ids.length) errors.push(`${page}: duplicate id`);
  if (!html.includes('<html lang="en">')) errors.push(`${page}: missing English language declaration`);
  if (!/<meta name="viewport" content="width=device-width, initial-scale=1">/.test(html)) errors.push(`${page}: missing mobile viewport`);
  if (/Lorem ipsum|coming soon|placeholder text/i.test(html)) errors.push(`${page}: placeholder content`);
  const customerText = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  if (/public name used on this website|this website presents|the client has confirmed|internal review status|awaiting content approval|TODO\s*:/i.test(customerText)) errors.push(`${page}: internal editorial language in customer copy`);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim();
  const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1]?.trim();
  if (!title) errors.push(`${page}: missing title`);
  if (!description) errors.push(`${page}: missing description`);
  if (/<meta\s+name="keywords"/i.test(html)) errors.push(`${page}: obsolete meta keywords`);
  if (page !== '404.html' && /<meta\s+name="robots"[^>]*noindex/i.test(html)) errors.push(`${page}: unexpected noindex`);
  if (page !== '404.html') {
    if (titles.has(title)) errors.push(`${page}: duplicate title with ${titles.get(title)}`);
    if (descriptions.has(description)) errors.push(`${page}: duplicate description with ${descriptions.get(description)}`);
    titles.set(title, page);
    descriptions.set(description, page);
  }
  if (!/<link rel="icon"[^>]*href="[^"]+"/.test(html)) errors.push(`${page}: missing favicon`);
  const canonical = [...html.matchAll(/<link rel="canonical" href="([^"]+)">/g)];
  if (!published && canonical.length) errors.push(`${page}: source canonical must be generated at release`);
  if (!published && html.includes('property="og:url"')) errors.push(`${page}: source Open Graph URL must be generated at release`);
  if (published && page !== '404.html' && siteUrl) {
    if (canonical.length !== 1 || canonical[0][1] !== new URL(page, siteUrl).href) errors.push(`${page}: incorrect canonical`);
    const ogUrl = [...html.matchAll(/<meta property="og:url" content="([^"]+)">/g)];
    if (ogUrl.length !== 1 || ogUrl[0][1] !== new URL(page, siteUrl).href) errors.push(`${page}: incorrect Open Graph URL`);
  }
  if (page !== '404.html') {
    for (const property of ['og:title', 'og:description', 'og:site_name']) {
      if ([...html.matchAll(new RegExp(`<meta property="${property}"`, 'g'))].length !== 1) errors.push(`${page}: expected one ${property}`);
    }
  }
  if (page === '404.html') {
    if (!html.includes('name="robots" content="noindex"')) errors.push('404.html: missing noindex');
    if (published && siteUrl && !html.includes(`<base href="${new URL(siteUrl).pathname}">`)) errors.push('404.html: missing deployment base URL');
    if (canonical.length) errors.push('404.html: should not have canonical');
    if (html.includes('property="og:url"')) errors.push('404.html: should not have Open Graph URL');
  }
  const structured = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const [, data] of structured) {
    try { JSON.parse(data); } catch { errors.push(`${page}: invalid JSON-LD`); }
  }
  if (published && page === 'index.html' && siteUrl) {
    const website = structured.map(([, data]) => JSON.parse(data)).find(data => data['@type'] === 'WebSite');
    if (structured.length !== 1 || !website || website.name !== 'IngredientCore' || website.url !== siteUrl || website.potentialAction) errors.push('index.html: incorrect WebSite data');
    const image = html.match(/<meta property="og:image" content="([^"]+)">/)?.[1];
    if (image !== new URL('assets/img/hero-bakery.jpg', siteUrl).href) errors.push('index.html: incorrect share image URL');
  }
  for (const image of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = image[0];
    const alt = tag.match(/\balt="([^"]*)"/);
    if (!alt) errors.push(`${page}: image missing alt attribute`);
    if (!/\bwidth="\d+"/.test(tag) || !/\bheight="\d+"/.test(tag)) errors.push(`${page}: image missing intrinsic dimensions`);
    if (alt && !alt[1] && !/aria-hidden="true"/.test(tag)) errors.push(`${page}: empty alt without decorative marker`);
  }
  for (const [, attribute, value] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    if (value.startsWith('http://')) errors.push(`${page}: insecure HTTP link or resource`);
    if (/^(?:https?:|mailto:|tel:|data:)/.test(value)) continue;
    if (published && page === '404.html' && siteUrl && value === new URL(siteUrl).pathname) continue;
    const target = value.replace(/&amp;/g, '&').split('?')[0];
    if (target.startsWith('#')) {
      if (!ids.includes(target.slice(1))) errors.push(`${page}: missing anchor ${target}`);
      continue;
    }
    const [relative, hash] = target.split('#');
    const resolved = path.resolve(root, path.dirname(page), relative);
    if (!resolved.startsWith(root + path.sep) || !fs.existsSync(resolved)) errors.push(`${page}: missing file ${relative}`);
    else if (!exactCase(resolved)) errors.push(`${page}: path case mismatch ${relative}`);
    if (attribute === 'href' && relative && resolved.endsWith('.html') && fs.existsSync(resolved)) linkedPages.add(path.relative(root, resolved).replaceAll(path.sep, '/'));
    if (hash && fs.existsSync(resolved)) {
      const destination = fs.readFileSync(resolved, 'utf8');
      if (!destination.includes(`id="${hash}"`)) errors.push(`${page}: missing destination anchor ${target}`);
    }
  }
  if ((html.match(/<h1\b/g) || []).length !== 1) errors.push(`${page}: expected one h1`);
  pageLinks.set(page, linkedPages);
}
const discovered = new Set(['index.html']);
const queue = ['index.html'];
while (queue.length) {
  for (const target of pageLinks.get(queue.shift()) || []) {
    if (!discovered.has(target)) { discovered.add(target); queue.push(target); }
  }
}
for (const page of pages) if (page !== '404.html' && !discovered.has(page)) errors.push(`${page}: no ordinary-link path from homepage`);
for (const name of ['style.css', 'pages.css']) {
  const file = path.join(root, 'assets/css', name);
  if (!fs.existsSync(file)) { errors.push(`${name}: missing`); continue; }
  const css = fs.readFileSync(file, 'utf8');
  if ((css.match(/{/g) || []).length !== (css.match(/}/g) || []).length) errors.push(`${name}: unbalanced braces`);
}
for (const name of ['hero-bakery.jpg', 'seafood.jpg']) {
  const file = path.join(root, 'assets/img', name);
  if (!fs.existsSync(file)) errors.push(`${name}: missing image`);
  else if (fs.statSync(file).size > 200_000) errors.push(`${name}: image exceeds 200 KB`);
}
if (!fs.existsSync(path.join(root, 'assets/img/mark.svg'))) errors.push('favicon: missing SVG file');
if (published) {
  const expected = new Set(siteUrl ? pages.filter(page => page !== '404.html').map(page => new URL(page, siteUrl).href) : []);
  if (locations.length !== expected.size || new Set(locations).size !== expected.size || locations.some(location => !expected.has(location))) errors.push('sitemap.xml: URLs must equal the exact canonical page set');
  if (/<lastmod>/.test(sitemap)) errors.push('sitemap.xml: unverified lastmod');
  const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
  if (siteUrl && !robots.includes(`Sitemap: ${new URL('sitemap.xml', siteUrl).href}`)) errors.push('robots.txt: incorrect sitemap URL');
  if (/^Disallow:\s*\/?(?:\s|$)/m.test(robots)) errors.push('robots.txt: blanket crawl restriction');
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Checks passed for ${pages.length} ${published ? 'published' : 'source'} pages: metadata, reachable links, anchors, images, headings, CSS${published ? ', canonical, Open Graph, sitemap and robots' : ''}.`);
}
