import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {articles} from './content/articles.mjs';
import {products} from './content/products.mjs';
import {applicationItems,applicationGoals} from './content/journeys.mjs';
import {sourceRecord} from './content/technical-sources.mjs';
const source=path.dirname(fileURLToPath(import.meta.url));
const root=process.argv[2]?path.resolve(source,process.argv[2]):source;
const read=route=>fs.readFileSync(path.join(root,route),'utf8');
const decode=value=>value.replaceAll('&amp;','&');
const productNames=new Set(products.map(p=>p.slug)),articleNames=new Set(articles.map(a=>a.slug));
const appHtml=read('applications/index.html');
assert.deepEqual(applicationItems.map(a=>a.id).sort(),['meat-seafood','bakery','dairy','beverages','sauces','starch-processing','fermentation','mineral-formulation'].sort());assert.equal(articles.length,8);
const used=new Set();
function checkTable(table){assert.ok(table.caption);assert.ok(table.headers.length>=3);assert.ok(table.rows.length>=2);for(const row of table.rows)assert.equal(row.length,table.headers.length);}
function checkSources(ids,html){for(const id of ids){const s=sourceRecord(id);assert.ok(s.scope&&s.url.startsWith('https://'));assert.ok(html.includes(s.url.replaceAll('&','&amp;')),`Source ${id} not rendered`);used.add(id);}}
for(const app of applicationItems){
 const section=appHtml.split(`id="${app.id}"`)[1]?.split('</article>')[0];assert.ok(section);
 assert.equal(app.systems.length,2);assert.ok(app.trial.length>=3&&app.documents.length>=2);
 checkTable({caption:app.name,headers:['problem','direction','conditions','observation'],rows:app.matrix});
 checkSources(app.sources,section);
 for(const slug of app.links){assert.ok(productNames.has(slug));assert.ok(section.includes(`products/${slug}.html?`));}
 for(const slug of app.readings){assert.ok(articleNames.has(slug));assert.ok(section.includes(`knowledge/${slug}.html`));}
 const request=[...section.matchAll(/href="([^"]+)"[^>]*>Prepare application inquiry/g)][0];assert.ok(request);
 const url=new URL(decode(request[1]),'https://example.invalid/applications/index.html');
 assert.equal(url.searchParams.get('application'),app.name);assert.equal(url.searchParams.get('goal'),applicationGoals[app.id]);
 assert.equal(url.searchParams.get('documents'),app.documents.join(' '));assert.equal(url.searchParams.get('purpose'),'Application screening and grade comparison');
 assert.ok(url.searchParams.get('documents').length<=1200);
}
for(const article of articles){
 const html=read(`knowledge/${article.slug}.html`);
 assert.ok(html.includes(`datetime="${article.updated}"`));assert.ok(html.includes('href="../knowledge/index.html" aria-current="page"'));
 assert.ok(article.sections.some(s=>s.table));assert.ok(article.sections.some(s=>s.bullets));
 for(const section of article.sections){
  if(section.table)checkTable(section.table);
  for(const id of section.refs||[])assert.ok(article.sourceIds.includes(id),`Unlisted section reference ${id}`);
 }
 checkSources(article.sourceIds,html);
 for(const slug of article.products)assert.ok(productNames.has(slug));
 for(const id of article.applications)assert.ok(applicationItems.some(app=>app.id===id));
 const request=[...html.matchAll(/href="([^"]+)"[^>]*>Prepare inquiry from this guide/g)][0];assert.ok(request);
 const url=new URL(decode(request[1]),'https://example.invalid/knowledge/page.html');
 assert.equal(url.searchParams.get('goal'),article.inquiryGoal);assert.equal(url.searchParams.get('documents'),article.requestedDocuments);
 assert.equal(url.searchParams.get('purpose'),article.requestPurpose);assert.equal(url.searchParams.get('from'),'article:'+article.slug);
 const editorial=JSON.stringify({intro:article.intro,sections:article.sections});
 assert.ok(!/\b\d+(?:\.\d+)?\s*(?:%|ppm|mg\/kg|kg\/|days|weeks)\b/i.test(editorial),'Unexpected recipe/result number');
 assert.ok(!/expert reviewed|reviewed by|validated formula|guaranteed shelf life/i.test(editorial.replaceAll('not a customer case, validated formula','not a customer case')));
}
assert.ok(appHtml.includes('Dairy &amp; dairy alternatives'));
assert.ok(appHtml.includes('does not replace hygiene'));
assert.ok(read('knowledge/hydrocolloid-selection.html').includes('alongside trials'));
assert.ok(read('knowledge/sapp-vs-salp-bakery.html').includes('balance difference must not be mistaken'));
assert.ok(read('knowledge/propionates-and-sorbates.html').includes('does not establish safety'));
const publicHtml=[appHtml,...articles.map(a=>read(`knowledge/${a.slug}.html`))];
for(const html of publicHtml){
 assert.ok(!/APPLICATIONS-TECHNICAL-AUDIT|\.internal\//.test(html));
 assert.ok(!/application\/ld\+json|<iframe|<script[^>]*src="https?:/.test(html));
 const tables=[...html.matchAll(/<table\b[\s\S]*?<\/table>/g)];
 for(const [table] of tables){assert.ok(table.includes('<caption>'));assert.ok(table.includes('scope="row"'));assert.ok(table.includes('scope="col"'));}
}
console.log(`Technical-content checks passed: ${applicationItems.length} application matrices, 8 substantive guides, ${used.size} scoped primary references, product/article relations, topic/document/purpose prefill and numeric-promise boundaries. Static HTML/data checks only.`);
