import fs from 'node:fs';
import path from 'node:path';
import {publicPath,noindex,pageURL} from './site-urls.mjs';
const root=path.resolve(process.argv[2] || '.');
const urls=[];
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
      if(canonical && canonical!==url) throw Error(rel+': canonical mismatch '+canonical);
      urls.push(url);
    }
  }
}
walk(root);
const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.sort().map(u=>'  <url><loc>'+u.replaceAll('&','&amp;')+'</loc></url>').join('\n')+'\n</urlset>\n';
fs.writeFileSync(path.join(root,'sitemap.xml'),xml);
console.log('Sitemap: '+urls.length+' public pages');
