import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const style=read('assets/css/style.css');
const pages=read('assets/css/pages.css');
const rootCss=style.match(/:root\{([^}]+)\}/)?.[1]||'';
const variable=name=>rootCss.match(new RegExp(`--${name}:(#[0-9a-f]{6})`,'i'))?.[1];
const lightness=hex=>{
  const rgb=hex.slice(1).match(/../g).map(part=>parseInt(part,16)/255)
    .map(channel=>channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4);
  return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
};
const ratio=(a,b)=>{const x=lightness(a),y=lightness(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
for(const [name,foreground,background,minimum] of [
  ['brand text on light tint',variable('teal'),'#dcebe5',4.5],
  ['muted text on light tint',variable('muted'),'#dcebe5',4.5],
  ['body text on cream',variable('text'),variable('cream'),4.5],
  ['placeholder on white',variable('muted'),'#ffffff',4.5],
  ['required marker on form', '#8b3c28','#e9f0eb',4.5],
  ['form error on form',variable('error'),'#e9f0eb',4.5],
  ['form border on form',variable('control'),'#e9f0eb',3],
  ['light focus on navy',variable('focus-light'),variable('navy'),3],
  ['white on navy','#ffffff',variable('navy'),4.5],
  ['white on brand green','#ffffff',variable('teal'),4.5]
])assert.ok(ratio(foreground,background)>=minimum,`${name}: ${ratio(foreground,background).toFixed(2)} < ${minimum}`);

for(const [name,css] of [['shared',style],['interior',pages]]){
  assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,`${name} CSS braces`);
}

assert.match(style,/prefers-reduced-motion:reduce/);
assert.match(style,/\.site-nav\{display:none;position:static;flex-basis:100%/);
assert.doesNotMatch(style,/body\.menu-open\{overflow:hidden\}/);
assert.doesNotMatch(style+pages,/overflow-x:hidden/);
assert.match(style,/\.menu-toggle\{[^}]*width:44px;height:44px/);
assert.match(pages,/\.form-row\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
assert.match(pages,/max-width:720px/);
assert.match(pages,/\.table-scroll-hint\{display:block/);
assert.match(pages,/\.contact-form input,\.contact-form textarea\{[^}]*font-size:16px/);
assert.match(pages,/\.contact-form select\{[^}]*font-size:16px/);
assert.match(style,/\.menu-open \.site-header\{position:static\}/);

const routes=['index.html',...['products','applications','knowledge','quality','about','contact','privacy'].map(name=>`${name}/index.html`)];
for(const route of routes){
  const html=read(route);
  assert.match(html,/<html lang="en">/);
  assert.match(html,/<a class="skip-link" href="#main">Skip to content<\/a>/);
  assert.match(html,/<main id="main" tabindex="-1">/);
  assert.match(html,/aria-label="Main navigation"/);
  assert.match(html,/aria-label="Ingredient and application links"/);
  assert.match(html,/aria-label="Company and contact links"/);
  assert.match(html,/<img[^>]+alt="IngredientCore"/);
  if(route!=='index.html')assert.match(html,/aria-label="Breadcrumb"/);
}
const home=read('index.html');
assert.match(home,/hero-bakery\.jpg" alt="[^"]+" width="802" height="578" fetchpriority="high"/);
assert.match(home,/seafood\.jpg" alt="" aria-hidden="true" loading="lazy"/);
function jpegSize(file){
  const bytes=fs.readFileSync(path.join(root,file));
  assert.equal(bytes.readUInt16BE(0),0xffd8);
  for(let at=2;at<bytes.length-9;){
    if(bytes[at]!==0xff){at++;continue;}
    const marker=bytes[at+1];
    if([0xc0,0xc1,0xc2,0xc3].includes(marker))return [bytes.readUInt16BE(at+7),bytes.readUInt16BE(at+5)];
    const length=bytes.readUInt16BE(at+2);
    at+=2+length;
  }
  throw new Error(`Missing JPEG frame in ${file}`);
}
assert.deepEqual(jpegSize('assets/img/hero-bakery.jpg'),[802,578]);
assert.deepEqual(jpegSize('assets/img/seafood.jpg'),[817,518]);
const contact=read('contact/index.html');
for(const name of ['name','email','ingredient'])assert.match(contact,new RegExp(`<input name="${name}"[^>]+required`));
assert.match(contact,/name="email" type="email"/);
assert.match(contact,/autocomplete="email"/);
assert.match(contact,/data-limit="2000"/);
assert.match(read('assets/js/site.js'),/aria-describedby/);
assert.match(read('assets/js/site.js'),/firstInvalid\.focus/);
assert.match(contact,/type="submit" disabled/);
const missing=read('404.html');
assert.match(missing,/href="index\.html">Back to homepage/);
assert.match(missing,/href="contact\/index\.html">Contact IngredientCore/);
console.log('Visual/accessibility static checks passed: 10 contrast pairs, CSS structure, image dimensions/alternatives, shared landmarks, form semantics, 404 routes, reduced motion and mobile CSS. No rendered viewport or assistive-technology claim.');
