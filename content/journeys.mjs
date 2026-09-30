import { applicationItems } from './applications.mjs';
export { applicationItems };

// Inquiry URLs carry only public browsing context, not personal or recipe data.
export function inquiryUrl(values={},prefix='../'){
  const query=new URLSearchParams();
  for(const key of ['ingredient','application','goal','documents','purpose','intent','from'])if(values[key])query.set(key,values[key]);
  return prefix+'contact/index.html'+(query.size?'?'+query.toString():'');
}
export const applicationGoals={
  'starch-processing':'Reagent identity and finished-starch qualification',
  'fermentation':'Nutrient balance and process-specific evaluation',
  'mineral-formulation':'Calcium phosphate composition, powder behavior and dispersion',
  'meat-seafood':'Moisture, texture or mineral management',
  bakery:'Leavening, dough behavior or shelf-life evaluation',
  dairy:'Texture, gelation or mineral balance',
  beverages:'Suspension, acidity or shelf-life evaluation',
  sauces:'Texture, flow or preservation evaluation'
};
export function applicationInquiry(item){return inquiryUrl({application:item.name,ingredient:applicationGoals[item.id],goal:applicationGoals[item.id],documents:item.documents.join(' '),purpose:'Application screening and grade comparison',intent:'application',from:'application:'+item.id});}
const groups=[['sodium-dihydrogen-phosphate-msp','disodium-phosphate-dsp','trisodium-phosphate-tsp'],['monopotassium-phosphate-mkp','dipotassium-phosphate-dkp','tripotassium-phosphate-tkp'],['monocalcium-phosphate-mcp','monocalcium-phosphate-anhydrous'],['dicalcium-phosphate-dcp','dicalcium-phosphate-dihydrate','tricalcium-phosphate-tcp'],['monoammonium-phosphate-map','diammonium-phosphate-dap'],['potassium-tripolyphosphate-ktpp','tetrasodium-pyrophosphate-tspp','food-phosphate-blends','tetrapotassium-pyrophosphate-tkpp'],['potassium-metaphosphate-kmp','sodium-hexametaphosphate-shmp'],['sodium-tripolyphosphate-stpp','sodium-hexametaphosphate-shmp','tetrapotassium-pyrophosphate-tkpp'],['sodium-acid-pyrophosphate-sapp','sodium-aluminum-phosphate-salp'],['calcium-propionate','sodium-propionate'],['potassium-sorbate','calcium-sorbate'],['sodium-cmc','xanthan-gum','carrageenan'],['citric-acid','sodium-citrate']];
export function relatedProductSlugs(slug){return(groups.find(group=>group.includes(slug))||[]).filter(id=>id!==slug);}
export function productApplications(slug){return applicationItems.filter(item=>item.links.includes(slug));}
export function articleInquiry(article,products){
 const names=article.products.map(slug=>products.find(p=>p.slug===slug).abbr);
 const application=article.applications.length===1?applicationItems.find(item=>item.id===article.applications[0]).name:'';
 return inquiryUrl({ingredient:names.length?names.join(' / ')+' selection':(article.inquiryGoal||'Supplier and document review'),application,goal:article.inquiryGoal,documents:article.requestedDocuments,purpose:article.requestPurpose,intent:article.inquiryIntent||(article.products.length?'comparison':'documents'),from:'article:'+article.slug});
}
export function relatedArticles(article,articles){
 const score=other=>other.products.filter(id=>article.products.includes(id)).length*4+other.applications.filter(id=>article.applications.includes(id)).length+(other.category===article.category?2:0)+(articles.indexOf(article)>=5&&articles.indexOf(other)>=5?2:0);
 return articles.filter(other=>other.slug!==article.slug&&score(other)>0).sort((a,b)=>score(b)-score(a)).slice(0,2);
}
export function returnRoutes(products,articles){
 const result={quality:{path:'../quality/index.html#documents',label:'Quality & Supply document guide'},about:{path:'../about/index.html',label:'Company identity'}};
 for(const product of products)result['product:'+product.slug]={path:'../products/'+product.slug+'.html',label:product.name+' ingredient guide'};
 for(const item of applicationItems)result['application:'+item.id]={path:'../applications/index.html#'+item.id,label:item.name+' application'};
 for(const article of articles)result['article:'+article.slug]={path:'../knowledge/'+article.slug+'.html',label:article.title};
 return result;
}
