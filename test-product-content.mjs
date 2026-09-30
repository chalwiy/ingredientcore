import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {products} from './content/products.mjs';
import {focusProducts,productProcurement} from './content/product-procurement.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const directory=process.argv[2]?path.resolve(root,process.argv[2]):root;
assert.equal(focusProducts.length,8);
for(const product of products){
 const data=productProcurement(product);
 const html=fs.readFileSync(path.join(directory,`products/${product.slug}.html`),'utf8');
 assert.ok(data.identity.length>80);assert.ok(data.grade.length>80);
 assert.ok(data.parameters.length>=3);assert.ok(data.parameters.every(row=>row.length===4&&row.every(cell=>cell.length>0)));
 assert.ok(html.includes('<caption>Key parameters to confirm'));
 const purchaseTable=html.match(/<table class="parameter-table">[\s\S]*?<\/table>/)[0];
 assert.equal([...purchaseTable.matchAll(/<th scope="col">/g)].length,4);
 assert.equal([...purchaseTable.matchAll(/<th scope="row">/g)].length,data.parameters.length);
 assert.ok(html.includes('tabindex="0" role="region"'));
 assert.equal([...html.matchAll(/<details>/g)].length,data.faqs.length);
 assert.ok(data.faqs.length>=2);
 assert.ok(data.documents.includes('confirm availability'));
 if(focusProducts.includes(product.slug)){
  assert.ok(data.trialBrief&&data.observations);assert.ok(html.includes('Observe in a controlled trial'));
  assert.ok(data.parameters.length>=5&&data.faqs.length>=3);
 }
 // This editorial dataset contains no supplied numerical limits, lead times or packing claims.
 const {references,...editorial}=data;
 assert.ok(!/\d+(?:\.\d+)?\s*(?:%|kg|days|years|ppm)\b|25\s*kg|free samples|in stock/i.test(JSON.stringify(editorial)),product.slug);
 assert.ok(!/application\/ld\+json|\bdownload=|href="(?!https?:\/\/)[^"]+\.pdf"/.test(html));
}
console.log('Product procurement content passed for all catalogue routes: 8 detailed trials, contextual parameter tables, FAQs and no fabricated numerical limits/downloads. Static checks only.');
