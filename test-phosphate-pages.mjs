import fs from 'node:fs';
import assert from 'node:assert/strict';
import { products } from './content/products.mjs';
import { phosphateFamilies } from './content/phosphates.mjs';
import { phosphateDetails } from './content/phosphate-details.mjs';
import { applicationItems } from './content/applications.mjs';
import { articles } from './content/articles.mjs';
import { specifications } from './content/specifications.mjs';
import { publicFiles } from './release-files.mjs';
const root=process.argv[2]?new URL(process.argv[2].replace(/\/$/,'')+'/',import.meta.url):new URL('./',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const phosphates=products.filter(p=>phosphateFamilies.some(([family])=>family===p.family));
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
assert.deepEqual(Object.keys(phosphateDetails).sort(),phosphates.map(p=>p.slug).sort());
for(const field of ['introduction','forms','trial','handling'])assert.equal(new Set(Object.values(phosphateDetails).map(d=>d[field])).size,phosphates.length,`Repeated ${field}`);
for(const p of phosphates){
 const d=phosphateDetails[p.slug],route=`products/${p.slug}.html`,html=read(route);
 assert.ok(publicFiles.includes(route));
 for(const field of ['introduction','forms','trial','handling'])assert.ok(html.includes(escape(d[field])),`${p.slug}: missing ${field}`);
 assert.ok(!/PHOSPHATE-PAGES-AUDIT|\.internal\//.test(html));
 assert.ok(!/\b(?:guaranteed yield|free samples|in stock|custom formulation service)\b/i.test(JSON.stringify(d)));
 for(const label of ['Prepare product inquiry','Request specification','Request product documents']){
  const match=[...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].find(m=>m[2].startsWith(label));
  assert.ok(match,`${p.slug}: ${label}`);
  const url=new URL(match[1].replaceAll('&amp;','&'),'https://example.invalid/products/page.html');
  assert.equal(url.searchParams.get('ingredient'),p.name);
  assert.equal(url.searchParams.get('from'),'product:'+p.slug);
  if(label==='Request specification')assert.ok(url.searchParams.get('documents').includes('Current product specification'));
 }
 assert.equal(html.includes('id="reference-specification"'),Boolean(specifications[p.slug]));
 assert.ok(d.related.length && d.applications.length && d.readings.length);
 assert.equal(new Set(d.related).size,d.related.length);
 for(const slug of d.related){assert.notEqual(slug,p.slug);assert.ok(products.some(p=>p.slug===slug));assert.ok(html.includes(`../products/${slug}.html`));}
 for(const id of d.applications){const app=applicationItems.find(a=>a.id===id);assert.ok(app?.links.includes(p.slug));assert.ok(html.includes(`../applications/index.html#${id}`));}
 for(const slug of d.readings){assert.ok(articles.some(a=>a.slug===slug));assert.ok(html.includes(`../knowledge/${slug}.html`));}
}
console.log(`Phosphate page checks passed: ${phosphates.length} distinct narratives, material/trial/handling sections, three request paths, scoped specifications and reciprocal application links. Static verification only.`);
