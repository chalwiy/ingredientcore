import { publicFiles } from './release-files.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {brand} from './content/brand.mjs';
import {products} from './content/products.mjs';
import {productScope,isSelectionGuide} from './content/product-scope.mjs';
const source=path.dirname(fileURLToPath(import.meta.url));
const root=process.argv[2]?path.resolve(source,process.argv[2]):source;
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
function visit(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?(entry.name==='.publish'?[]:visit(path.join(directory,entry.name))):entry.name.endsWith('.html')?[path.join(directory,entry.name)]:[]);}
const pages=visit(root);
assert.equal(pages.length,publicFiles.filter(f=>f.endsWith('.html')).length);
assert.deepEqual(Object.keys(productScope).sort(),products.map(p=>p.slug).sort());
const guides=products.filter(isSelectionGuide);
assert.deepEqual(guides.map(p=>p.slug).sort(),['citric-acid','datem','sodium-citrate']);
for(const file of pages){
  const html=fs.readFileSync(file,'utf8');
  const relative=path.relative(root,file).replaceAll(path.sep,'/');
  assert.ok(!/\{\{\w+\}\}|\$\{/.test(html),`Unresolved template in ${relative}`);
  assert.ok(!/BUSINESS-FACTS|BRAND-POSITIONING/.test(html),`Internal document linked in ${relative}`);
  assert.ok(!/IngredientCore\s+(?:Co\.,?\s*Ltd\.?|Limited)|Backed by Bespring|CORE EXPERTISE|supplied with clarity/i.test(html),`Unsupported branding in ${relative}`);
  const emails=[...html.matchAll(/href="mailto:([^?"&]+)/g)].map(m=>m[1]);
  assert.ok(emails.every(email=>email===brand.email),`Inconsistent email in ${relative}`);
  const phones=[...html.matchAll(/href="tel:([^"?]+)/g)].map(m=>m[1]);
  assert.ok(phones.every(phone=>phone===brand.phone),`Inconsistent phone in ${relative}`);
  if(relative!=='404.html'){
    assert.ok(html.includes(brand.identity),`Missing subsidiary identity in ${relative}`);
    assert.ok(html.includes(brand.addressLines.join('<br>')),`Inconsistent contact address in ${relative}`);
  }
  for(const guide of guides){
    const links=[...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].filter(m=>m[1].split('?')[0].endsWith('/'+guide.slug+'.html')||m[1]===guide.slug+'.html');
    for(const link of links)assert.ok(/selection guide/i.test(link[2]),`Unclassified guide link to ${guide.slug} in ${relative}`);
  }
}
for(const guide of guides){
  const html=read(`products/${guide.slug}.html`);
  assert.ok(/<title>[^<]*Selection Guide/.test(html));
  assert.ok(html.includes('it is not an offer of supply'));
}
for(const product of products.filter(p=>!isSelectionGuide(p))){const page=read(`products/${product.slug}.html`);assert.ok(page.includes('Prepare product inquiry'));assert.ok(!page.includes('it is not an offer of supply'));}
assert.ok(read('index.html').includes(brand.positioning));
assert.ok(read('about/index.html').includes(brand.established));
assert.ok(read('contact/index.html').includes(`data-inquiry-email="${brand.email}"`));
assert.ok(read('products/index.html').includes('Additional selection guides.'));
console.log(`Brand checks passed: ${pages.length} pages, consistent identity/contact details, ${products.length} classified ingredients and 3 additional guides. Business authenticity remains a human verification task.`);
