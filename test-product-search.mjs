import { products } from './content/products.mjs';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const html=fs.readFileSync(path.join(root,process.argv[2]||'.','products/index.html'),'utf8');
const cards=[...html.matchAll(/data-product-card data-search="([^"]+)" data-family="([^"]+)" data-abbreviation="([^"]+)"/g)].map(m=>({hidden:false,dataset:{search:m[1].replaceAll('&amp;','&'),family:m[2].replaceAll('&amp;','&'),abbreviation:m[3]}}));
const search={value:'',disabled:true,listeners:{},addEventListener(k,v){this.listeners[k]=v;},focus(){this.focused=true;}};
const clear={hidden:true,listeners:{},addEventListener(k,v){this.listeners[k]=v;}};
const status={textContent:''},empty={hidden:true};
const filter={value:'',disabled:true,listeners:{},addEventListener(k,v){this.listeners[k]=v;}};
const categories=[{listeners:{},addEventListener(k,v){this.listeners[k]=v;}}];
const families=[...new Set(cards.map(c=>c.dataset.family))].map(name=>({name,hidden:false,querySelector(){return cards.find(c=>c.dataset.family===name&&!c.hidden);}}));
const group={hidden:false,querySelector(){return cards.find(c=>!c.hidden);}};
vm.runInNewContext(fs.readFileSync(path.join(root,process.argv[2]||'.','assets/js/site.js'),'utf8'),{URLSearchParams,URL,window:{location:{search:''}},document:{querySelector:selector=>({'[data-product-search]':search,'[data-product-family]':filter,'[data-search-clear]':clear,'[data-search-status]':status,'[data-search-empty]':empty}[selector]||null),querySelectorAll:selector=>selector==='[data-product-card]'?cards:selector==='.catalog-family'?families:selector==='[data-catalog-group]'?[group]:selector==='[data-catalog-category]'?categories:[]}});
assert.equal(search.disabled,false);assert.equal(cards.length,products.length);
for(const query of ['SAPP','stpp','Potassium Sorbate','Sodium CMC','NaCMC','cellulose gum','Pentasodium triphosphate','Disodium dihydrogen diphosphate','Sodium aluminium phosphate','Calcium propanoate','Graham’s salt']){
  search.value=' '+query+' ';search.listeners.input();
  assert.equal(cards.filter(c=>!c.hidden).length,1,`Search failed for ${query}`);
  assert.equal(status.textContent,'1 ingredient guide shown');assert.equal(clear.hidden,false);
}
for(const [query,count] of [['MCP',2],['DCP',2],['TSPP',1],['KTPP',1],['STMP',1],['Sodium Phosphates',8],['Potassium Phosphates',6],['Calcium Phosphates',5],['Phosphate Blends',1],['Ammonium Phosphates',2]]){search.value=query;search.listeners.input();assert.equal(cards.filter(c=>!c.hidden).length,count,query);}
for(const [query,count] of [['TSP',1],['DSP',1],['anhydrous DCP',1],['phosphate calcium dihydrate',1],['sodium-phosphate-monobasic',1]]){search.value=query;search.listeners.input();assert.equal(cards.filter(c=>!c.hidden).length,count,query);}
assert.equal(filter.disabled,false);
filter.value='Calcium Phosphates';search.value='anhydrous';filter.listeners.change();assert.equal(cards.filter(c=>!c.hidden).length,2);assert.ok(families.filter(f=>f.name!=='Calcium Phosphates').every(f=>f.hidden));
search.value='STPP';search.listeners.input();assert.equal(status.textContent,'0 ingredient guides shown');assert.equal(group.hidden,true);
categories[0].listeners.click();assert.equal(filter.value,'');assert.equal(search.value,'');assert.ok(families.every(f=>!f.hidden));assert.equal(group.hidden,false);
filter.value='Potassium Phosphates';filter.listeners.change();assert.equal(cards.filter(c=>!c.hidden).length,6);clear.listeners.click();assert.equal(filter.value,'');
search.value='no-such-ingredient';search.listeners.input();
assert.equal(status.textContent,'0 ingredient guides shown');assert.equal(empty.hidden,false);
const firstSearchText=cards[0].dataset.search;
delete cards[0].dataset.search;
search.value='SAPP';search.listeners.input();
assert.equal(status.textContent,'1 ingredient guide shown');
cards[0].dataset.search=firstSearchText;
clear.listeners.click();
assert.equal(search.value,'');assert.ok(search.focused);assert.equal(clear.hidden,true);assert.equal(empty.hidden,true);assert.equal(cards.filter(c=>!c.hidden).length,products.length);
assert.ok(html.includes('<noscript>'));assert.equal([...html.matchAll(/class="catalog-card" href="([^"]+\.html)"/g)].length,products.length);
console.log('Product search passed: names/abbreviations, case/whitespace, counts, no results, clear/focus and all catalogue static links. Simulated DOM only.');
