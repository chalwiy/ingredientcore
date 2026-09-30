import assert from 'node:assert/strict';
import fs from 'node:fs';
import { products } from './content/products.mjs';
import { phosphateFamilies } from './content/phosphates.mjs';
import { productProcurement } from './content/product-procurement.mjs';
import { isSelectionGuide } from './content/product-scope.mjs';
import { publicFiles } from './release-files.mjs';

// Independent inventory contract: detect omitted identities or merged hydrates.
const inventory = {
 'Sodium Phosphates':['STPP','SHMP','SAPP','MSP','DSP','TSP','TSPP','STMP'],
 'Potassium Phosphates':['TKPP','MKP','DKP','TKP','KTPP','KMP'],
 'Calcium Phosphates':['MCP monohydrate','MCP anhydrous','DCP anhydrous','DCP dihydrate','TCP'],
 'Phosphate Blends':['Phosphate blends'],
 'Ammonium Phosphates':['MAP','DAP'],
 'Other Phosphates':['SALP']
};
const base = process.argv[2] ? new URL(process.argv[2].replace(/\/$/,'')+'/',import.meta.url) : new URL('./',import.meta.url);
const read = route => fs.readFileSync(new URL(route,base),'utf8');
const directory = read('products/index.html');
assert.equal(new Set(products.map(p=>p.slug)).size,products.length);
assert.equal(new Set(publicFiles).size,publicFiles.length);
assert.deepEqual(phosphateFamilies.map(([name])=>name),Object.keys(inventory));
for(const [family,names] of Object.entries(inventory)){
 const members=products.filter(p=>p.family===family);
 assert.deepEqual(members.map(p=>p.abbr).sort(),names.sort(),family);
 assert.ok(directory.includes('id="'+family.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'"'));
 for(const p of members){
  assert.equal(isSelectionGuide(p),false);
  const route=`products/${p.slug}.html`, html=read(route), data=productProcurement(p);
  assert.ok(publicFiles.includes(route));
  assert.ok(directory.includes(`href="${p.slug}.html"`));
  assert.ok(data.parameters.length>=3 && data.faqs.length>=2);
  assert.ok(html.includes('Request product documents'));
 }
}
assert.ok(directory.includes('id="food-phosphates"'),'Preserve old inbound anchor');
for(const slug of ['sodium-tripolyphosphate-stpp','sodium-hexametaphosphate-shmp','sodium-acid-pyrophosphate-sapp','sodium-aluminum-phosphate-salp','tetrapotassium-pyrophosphate-tkpp']){
 assert.ok(publicFiles.includes(`products/${slug}.html`),'Preserve original URL');
}
assert.ok(!publicFiles.some(p=>/\.md$|\.internal|phosphate-pages|phosphate-document-review/.test(p)));
console.log('Phosphate catalogue passed: six identity groups, hydrate separation, preserved URLs/anchor, substantive purchase content and release inclusion/exclusion. Static checks only.');
