import fs from 'node:fs';
import path from 'node:path';
import {publicPath,noindex,pageURL} from './site-urls.mjs';
const root=path.resolve(process.argv[2] || '.');
const urls=[];
const seen=new Set();
function walk(dir) {
  for(const e of fs.readdirSync(dir,{withFileTypes:true})) {
    const p=path.join(dir,e.name), rel=path.relative(root,p).split(path.sep).join('/');
    if(e.isDirectory() && publicPath(rel+'/probe.html')) walk(p);
    else if(e.isFile() && publicPath(rel)) {
      const html=fs.readFileSync(p,'utf8');
      if(noindex(html)) continue;
      const url=pageURL(rel);
      const tags=[...html.matchAll(/<link\b[^>]*>/gi)].map(x=>x[0]).filter(x=>/\brel\s*=\s*["']canonical["']/i.test(x));
      if(tags.length>1) throw Error(rel+': duplicate canonical');
      const canonical=tags[0]?.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
      if(!canonical) throw Error(rel+': missing canonical');
      if(canonical && canonical!==url) throw Error(rel+': canonical mismatch '+canonical);
      if(seen.has(url)) throw Error(rel+': duplicate URL '+url);
      seen.add(url);urls.push(url);
    }
  }
}
walk(root);
const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.sort().map(u=>'  <url><loc>'+u.replaceAll('&','&amp;')+'</loc></url>').join('\n')+'\n</urlset>\n';
if(urls.length>50000 || Buffer.byteLength(xml)>50*1024*1024) throw Error('Single sitemap protocol limit exceeded');
fs.writeFileSync(path.join(root,'sitemap.xml'),xml);
// Remove only obsolete generated language maps, never arbitrary XML.
for(const name of fs.readdirSync(root)) {
  if(/^sitemap-[a-z]{2}(?:-[a-z]{2})?\.xml$/i.test(name)) {
    const file=path.join(root,name);
    if(fs.statSync(file).isFile() && /<(?:urlset|sitemapindex)\b/.test(fs.readFileSync(file,'utf8'))) fs.unlinkSync(file);
  }
}
console.log('Sitemap: '+urls.length+' public pages');
