import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {ORIGIN,KEY,publicPath,noindex,pageURL} from './site-urls.mjs';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'});
const urls=new Set();
function add(ref,p) {
  if(!publicPath(p)) return;
  const html=git('show',ref+':'+p);
  if(!noindex(html)) urls.add(pageURL(p));
}
if(process.env.FULL==='true') {
  for(const m of fs.readFileSync('sitemap.xml','utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(m[1].replaceAll('&amp;','&'));
} else {
  const {BEFORE,AFTER}=process.env;
  if(!/^[0-9a-f]{40}$/.test(BEFORE||'') || !/^[0-9a-f]{40}$/.test(AFTER||'')) throw Error('Missing valid push range');
  if(/^0+$/.test(BEFORE)) {
    for(const p of git('ls-tree','-r','--name-only',AFTER).trim().split('\n')) add(AFTER,p);
  } else {
    const parts=git('diff','--name-status','-z','--find-renames',BEFORE,AFTER).split('\0');
    for(let i=0;i<parts.length-1;) {
      const status=parts[i++], p=parts[i++];
      if(status.startsWith('R')) {add(BEFORE,p);add(AFTER,parts[i++]);}
      else if(status==='D') add(BEFORE,p);
      else if(status==='A') add(AFTER,p);
      else if(status==='M' || status==='T') {add(BEFORE,p);add(AFTER,p);}
    }
  }
}
const urlList=[...urls].sort();
for(const u of urlList) {const parsed=new URL(u);if(parsed.origin!==new URL(ORIGIN).origin || parsed.search || parsed.hash) throw Error('Invalid IndexNow URL '+u);}
console.log('IndexNow candidate URLs: '+urlList.length);
if(process.env.DRY_RUN==='true') {console.log(JSON.stringify(urlList));process.exit(0);}
if(!urlList.length) process.exit(0);
if(fs.readFileSync(KEY+'.txt','utf8').trim()!==KEY) throw Error('Local key mismatch');
const keyLocation=ORIGIN+KEY+'.txt';
let verified=false;
for(let attempt=0;attempt<6;attempt++) {
  const r=await fetch(keyLocation,{redirect:'error',signal:AbortSignal.timeout(15000)});
  if(r.status===200 && (await r.text()).trim()===KEY) {verified=true;break;}
  if(attempt<5) await new Promise(r=>setTimeout(r,10000));
}
if(!verified) throw Error('Public IndexNow key is unavailable or incorrect: '+keyLocation);
for(let i=0;i<urlList.length;i+=10000) {
  const r=await fetch('https://api.indexnow.org/indexnow',{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},body:JSON.stringify({host:new URL(ORIGIN).hostname,key:KEY,keyLocation,urlList:urlList.slice(i,i+10000)}),signal:AbortSignal.timeout(30000)});
  const body=await r.text();
  if(![200,202].includes(r.status)) throw Error('IndexNow HTTP '+r.status+': '+body);
  console.log('IndexNow accepted: HTTP '+r.status);
}
