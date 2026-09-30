import { articleExtensions } from './content/catalogue.mjs';
import { publicFiles } from './release-files.mjs';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {products} from './content/products.mjs';
import {articles} from './content/articles.mjs';
import {applicationItems,inquiryUrl} from './content/journeys.mjs';
const source=path.dirname(fileURLToPath(import.meta.url));
const root=process.argv[2]?path.resolve(source,process.argv[2]):source;
const base='https://example.invalid/IngredientCore/';
const read=route=>fs.readFileSync(path.join(root,route),'utf8');
const script=read('assets/js/site.js');
const decode=text=>text.replaceAll('&quot;','"').replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>');
const links=(html,route)=>[...html.matchAll(/<a\b([^>]*?)href="([^"]+)"([^>]*?)>([\s\S]*?)<\/a>/g)].map(m=>({attrs:m[1]+m[3],url:new URL(decode(m[2]),new URL(route,base)),label:m[4].replace(/<[^>]+>/g,'').trim()}));
const find=(route,label)=>{const link=links(read(route),route).find(link=>link.label.includes(label));assert.ok(link,`${route}: missing ${label}`);return link.url;};
const contactHtml=read('contact/index.html');
assert.ok(contactHtml.includes('type="submit" disabled'));
assert.ok(contactHtml.includes('Preparing a form draft requires JavaScript'));
const routeMap=decode(contactHtml.match(/data-return-map="([^"]+)"/)[1]);
const node=()=>({hidden:true,textContent:'',value:'',attrs:{},listeners:{},setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k];},addEventListener(k,v){this.listeners[k]=v;},focus(){this.focused=true;},select(){this.selected=true;},insertAdjacentElement(){}});
async function contact(url,initial={}){
  const fields=['name','email','company','market','ingredient','application','goal','documents','purpose','details','context','specification','volume','inquiry_type'];
  const elements=Object.fromEntries(fields.map(key=>[key,{value:initial[key]||''}]));
  elements.name.value='Example Buyer';elements.email.value='buyer@example.invalid';elements.inquiry_type.value='Ingredient inquiry';
  const submit=node(),reference=node(),contextBox=node();
  const form={elements,listeners:{},getAttribute:key=>key==='data-return-map'?routeMap:key==='data-inquiry-email'?'ingredientcore@bespringchem.com':null,querySelector:()=>submit,reportValidity:()=>true,addEventListener(k,v){this.listeners[k]=v;}};
  const created=[];let copied='';
  const location={href:url.href,search:url.search};
  vm.runInNewContext(script,{URLSearchParams,URL,window:{location},navigator:{clipboard:{async writeText(value){copied=value;}}},FormData:class{get(key){return elements[key]?.value||'';}},document:{querySelector:selector=>selector==='[data-contact-form]'?form:selector==='[data-contact-context]'?contextBox:selector==='[data-context-return]'?reference:null,querySelectorAll:()=>[],createElement(){const result=node();created.push(result);return result;}}});
  // Generic document routes require the buyer to name the product before sending.
  if(!elements.ingredient.value)elements.ingredient.value='Product and grade for review';
  form.listeners.submit({preventDefault(){}});
  await created.find(n=>n.textContent==='Copy inquiry for webmail').listeners.click();
  return {elements,reference,contextBox,draft:new URL(location.href),copied};
}
function carryProductContext(pageUrl){
  const route=pageUrl.pathname.replace('/IngredientCore/','');
  const anchors=links(read(route),route).filter(link=>link.attrs.includes('data-context-inquiry')).map(link=>{const result=node();result.attrs.href=link.url.href;return result;});
  vm.runInNewContext(script,{URLSearchParams,URL,window:{location:{href:pageUrl.href,search:pageUrl.search}},document:{querySelector:()=>null,querySelectorAll:selector=>selector==='[data-context-inquiry]'?anchors:[]}});
  return anchors.map(anchor=>new URL(anchor.attrs.href,pageUrl));
}

// 1. Named product: ordinary static links, product inquiry and file request.
for(const slug of ['sodium-acid-pyrophosphate-sapp','sodium-tripolyphosphate-stpp','potassium-sorbate','sodium-cmc']){
  assert.ok(links(read('products/index.html'),'products/index.html').some(link=>link.url.pathname.endsWith('/'+slug+'.html')));
  const product=products.find(p=>p.slug===slug);
  const draft=await contact(find(`products/${slug}.html`,'Prepare product inquiry'));
  assert.equal(draft.elements.ingredient.value,product.name);
  assert.equal(draft.reference.attrs.href,'../products/'+slug+'.html');
  const documents=await contact(find(`products/${slug}.html`,'Request product documents'));
  assert.equal(documents.elements.inquiry_type.value,'Product document request');
  assert.ok(documents.elements.documents.value.includes('specification'));
}
// 2. All five applications: direct inquiry and application -> product -> inquiry.
for(const app of applicationItems){
  const segment=read('applications/index.html').split(`id="${app.id}"`)[1].split('</article>')[0];
  const route=links(segment,'applications/index.html').find(link=>link.label.includes('Prepare application inquiry')).url;
  const direct=await contact(route);
  assert.equal(direct.elements.application.value,app.name);
  assert.equal(direct.elements.inquiry_type.value,'Application / selection question');
  const candidate=links(segment,'applications/index.html').find(link=>link.url.pathname.includes('/products/')).url;
  const product=products.find(p=>candidate.pathname.endsWith('/'+p.slug+'.html'));
  const productInquiry=carryProductContext(candidate).find(url=>!url.searchParams.has('documents'));
  const continued=await contact(productInquiry);
  assert.equal(continued.elements.ingredient.value,product.name);
  assert.equal(continued.elements.application.value,app.name);
  assert.ok(continued.elements.goal.value);
  assert.ok(continued.draft.searchParams.get('body').includes(app.name));
}
// 3. Comparisons: every article has an inquiry tied to its actual topic.
for(const article of articles){
  const draft=await contact(find(`knowledge/${article.slug}.html`,'Prepare inquiry from this guide'));
  assert.equal(draft.elements.context.value,article.title);
  assert.ok(draft.copied.includes(article.title));
  assert.equal(draft.contextBox.hidden,false);
  if(article.applications.length===1)assert.equal(draft.elements.application.value,applicationItems.find(app=>app.id===article.applications[0]).name);
}
// 4. Supplier review: company -> qualification -> relevant document request.
assert.ok(find('about/index.html','Product documents and purchasing details').hash==='#supply-identity');
const coa=links(read('quality/index.html'),'quality/index.html').find(link=>link.label==='Request COA ↗').url;
const request=await contact(coa);
assert.equal(request.elements.inquiry_type.value,'Product document request');
assert.ok(request.elements.documents.value.includes('COA'));
assert.equal(request.reference.attrs.href,'../quality/index.html#documents');
// 5. Ready buyer: mail/copy, input preservation, parameter boundaries, safe return.
// Long qualification requests use the complete copy path to avoid mailto truncation.
assert.ok(request.draft.pathname==='ingredientcore@bespringchem.com'||request.draft.pathname==='/IngredientCore/contact/index.html');
assert.ok(request.copied.startsWith('To: ingredientcore@bespringchem.com'));
const preserved=await contact(new URL(inquiryUrl({ingredient:'SAPP',application:'Bakery',goal:'Leavening'}),new URL('products/index.html',base)),{ingredient:'CMC',application:'Sauces',goal:'Suspension'});
assert.equal(preserved.elements.ingredient.value,'CMC');assert.equal(preserved.elements.application.value,'Sauces');assert.equal(preserved.elements.goal.value,'Suspension');
const unknown=await contact(new URL('contact/index.html?from=https://evil.invalid&return=https://evil.invalid&name=URL-name&email=URL-email&application='+ 'x'.repeat(201)+'&goal='+'x'.repeat(201),base));
assert.equal(unknown.contextBox.hidden,true);assert.equal(unknown.elements.application.value,'');assert.equal(unknown.elements.goal.value,'');assert.equal(unknown.elements.name.value,'Example Buyer');
assert.equal(inquiryUrl({name:'Buyer',email:'buyer@example.invalid',recipe:'private'}),'../contact/index.html');

// Every public content page is reachable without scripts; 404 is a host route.
const routes=['index.html',...['products','applications','knowledge','quality','about','contact','privacy'].map(name=>name+'/index.html'),...products.map(p=>'products/'+p.slug+'.html'),...articles.map(a=>'knowledge/'+a.slug+'.html')];
const visited=new Set(['index.html']);const queue=['index.html'];
while(queue.length){const current=queue.shift();for(const link of links(read(current),current)){if(link.url.origin!==new URL(base).origin)continue;const target=link.url.pathname.replace('/IngredientCore/','');if(routes.includes(target)&&!visited.has(target)){visited.add(target);queue.push(target);}}}
assert.equal(visited.size,publicFiles.filter(f=>f.endsWith('.html')&&f!=='404.html').length);
for(const route of routes){
  const html=read(route);let nesting=0;
  for(const token of html.match(/<a\b[^>]*>|<\/a>/g)||[]){if(token.startsWith('</'))nesting--;else nesting++;assert.ok(nesting>=0&&nesting<=1,`Nested/broken links in ${route}`);}assert.equal(nesting,0);
  if(route!=='index.html')assert.ok(html.includes('aria-label="Breadcrumb"'));
  for(const link of links(html,route))for(const key of link.url.searchParams.keys())assert.ok(!['name','email','recipe','return'].includes(key),`Sensitive/unsafe query key in ${route}`);
}
console.log('Five procurement journeys passed: named products, all application chains, 8 guide inquiries, qualification/document requests and email/copy. All catalogue content pages reachable without JavaScript; no nested links or sensitive inquiry parameters. Tests use a simulated DOM, not a real browser.');

for(const [article,entries] of Object.entries(articleExtensions)){const html=read(`knowledge/${article}.html`);for(const [slug,note] of entries){assert.ok(html.includes(`../products/${slug}.html`));assert.ok(html.includes(note));}}
