import { publicFiles } from './release-files.mjs';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {products} from './content/products.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
for(const product of products){
  const html=read(`products/${product.slug}.html`);
  const requests=[...html.matchAll(/href="([^"]+)"[^>]*>Request product documents/g)];
  assert.equal(requests.length,1,`Missing or duplicated request for ${product.slug}`);
  const url=new URL(requests[0][1].replaceAll('&amp;','&'),'https://example.invalid/products/page.html');
  assert.equal(url.pathname,'/contact/index.html');
  assert.equal(url.searchParams.get('ingredient'),product.name);
  assert.equal(url.searchParams.get('intent'),'documents');
  assert.ok(url.searchParams.get('documents').includes('confirm availability'));
  assert.equal(url.searchParams.get('purpose'),'Supplier qualification');
}
const contact=read('contact/index.html');
for(const field of ['inquiry_type','ingredient','documents','purpose','market','application'])assert.ok(contact.includes(`name="${field}"`));
assert.ok(contact.includes('You send the email yourself'));
function visit(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?visit(path.join(directory,entry.name)):[path.join(directory,entry.name)]);}
const pages=visit(root).filter(file=>file.endsWith('.html')&&!file.includes(path.sep+'.publish'+path.sep));
for(const file of pages){
  const html=fs.readFileSync(file,'utf8');
  assert.ok(!/href="(?!https?:\/\/)[^"]*\.(?:pdf|docx?|xlsx?|zip)(?:[?#][^"]*)?"|<a\b[^>]*\sdownload(?:\s|=|>)/i.test(html),`Unapproved local download in ${path.basename(file)}`);
  assert.ok(!/SPECIFICATION-AUDIT|PHOSPHATE-PAGES-AUDIT|PHOSPHATE-CATALOG-PLAN|DOCUMENT-REGISTER|SUPPLIER-CREDIBILITY-AUDIT|BUSINESS-FACTS|BRAND-POSITIONING|CUSTOMER-JOURNEYS|PRODUCT-CONTENT-AUDIT|APPLICATIONS-TECHNICAL-AUDIT|INQUIRY-CONVERSION-AUDIT|VISUAL-ACCESSIBILITY-AUDIT|DESIGN-SYSTEM|\.internal\//.test(html),`Internal reference in public page ${path.basename(file)}`);
}
if(process.argv[2]){
  const directory=path.resolve(root,process.argv[2]);
  const files=visit(directory);
  for(const file of files){
    const relative=path.relative(directory,file);
    assert.ok(!/(?:^|[\\/])(?:content|internal-tools|\.internal)(?:[\\/]|$)/.test(relative),`Internal directory released: ${relative}`);
    assert.ok(/\.(?:html|css|js|svg|jpg)$/.test(file)||['.nojekyll','robots.txt','sitemap.xml'].includes(path.basename(file)),`Unexpected public file: ${relative}`);
  }
  assert.equal(files.filter(file=>file.endsWith('.html')).length,publicFiles.filter(f=>f.endsWith('.html')).length);
  console.log(`Release isolation passed for ${files.length} files; no audit documents, source data or original business files released.`);
}
console.log(`Document entry checks passed for ${products.length} products and ${pages.length} source pages.`);
