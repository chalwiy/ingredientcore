import { publicFiles } from './release-files.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const source = path.dirname(fileURLToPath(import.meta.url));
const root = process.argv[2] ? path.resolve(source, process.argv[2]) : source;
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const pages = [];
function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.publish' && directory === source) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(target);
    else if (entry.name.endsWith('.html')) pages.push(path.relative(root, target).replaceAll(path.sep, '/'));
  }
}
collect(root);
assert.equal(pages.length, publicFiles.filter(f=>f.endsWith('.html')).length);
const privacy = read('privacy/index.html');
const contact = read('contact/index.html');
const script = read('assets/js/site.js');
const externalHosts = new Set();
assert.match(privacy, /This website has no online form submission endpoint/);
assert.match(privacy, /does not set cookies, use localStorage or sessionStorage/);
assert.match(privacy, /mail provider and the receiving email systems/);
assert.match(contact, /href="\.\.\/privacy\/index\.html"/);
assert.match(contact, /data-contact-form/);
assert.doesNotMatch(contact, /<form\b[^>]*\baction=/i);
assert.doesNotMatch(script, /\b(?:fetch\s*\(|XMLHttpRequest\b|sendBeacon\s*\(|eval\s*\(|localStorage\b|sessionStorage\b|document\.cookie)/);
for (const page of pages) {
  const html = read(page);
  assert.match(html, /<meta name="referrer" content="no-referrer">/, `${page}: missing referrer rule`);
  if (page !== '404.html') assert.match(html, /href="(?:\.\.\/)?privacy\/index\.html"/, `${page}: missing privacy link`);
  for (const tag of html.matchAll(/<(?:script|link|img)\b[^>]*>/g)) {
    if (tag[0].startsWith('<link') && !/\brel="(?:stylesheet|icon|preload|modulepreload)"/.test(tag[0])) continue;
    assert.doesNotMatch(tag[0], /\b(?:src|href)="https?:\/\//i, `${page}: automatic third-party resource`);
  }
  for (const [, href, attrs] of html.matchAll(/<a\b[^>]*href="(https?:[^"]+)"([^>]*)>/g)) {
    const destination = new URL(href.replaceAll('&amp;', '&'));
    assert.equal(destination.protocol, 'https:', `${page}: insecure external link`);
    externalHosts.add(destination.host);
    if (/target="_blank"/.test(attrs)) assert.match(attrs, /rel="[^"]*noopener[^"]*noreferrer[^"]*"/, `${page}: new-window link lacks noreferrer`);
  }
}
for (const name of ['style.css', 'pages.css']) {
  const css = read(`assets/css/${name}`);
  assert.doesNotMatch(css, /@import|@font-face|url\(\s*['"]?https?:/i, `${name}: external font or CSS dependency`);
}
console.log(`Privacy and reliability checks passed for ${pages.length} pages: notice links, referrer rule, static form, no automatic third-party resource and HTTPS references across ${externalHosts.size} hosts.`);
