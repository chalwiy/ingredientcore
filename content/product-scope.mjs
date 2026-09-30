// Internal scope classification, not a declaration of stock, approved grade or
// current sale of each molecule. See BUSINESS-FACTS.md before upgrading a guide.
import { additionalPhosphateProducts, existingPhosphateFamilies } from './phosphates.mjs';
export const productScope = {
  ...Object.fromEntries(additionalPhosphateProducts.map(p=>[p.slug,{family:p.family,scope:'core-family',source:'PHOSPHATE-CATALOG-PLAN.md'}])),
  'sodium-tripolyphosphate-stpp':{family:'Phosphates',scope:'core-family',source:'sodium-tripolyphosphate-stpp'},
  'sodium-hexametaphosphate-shmp':{family:'Phosphates',scope:'core-family',source:'sodium-hexametaphosphate-shmp'},
  'sodium-acid-pyrophosphate-sapp':{family:'Phosphates',scope:'core-family',source:'sodium-acid-pyrophosphate-sapp'},
  'sodium-aluminum-phosphate-salp':{family:'Phosphates',scope:'core-family',source:'sodium-aluminum-phosphate-salp'},
  'tetrapotassium-pyrophosphate-tkpp':{family:'Phosphates',scope:'core-family',source:'tetrapotassium-pyrophosphate-tkpp'},
  'calcium-propionate':{family:'Propionates',scope:'core-family',source:'calcium-propionate'},
  'sodium-propionate':{family:'Propionates',scope:'core-family',source:'sodium-propionate'},
  'potassium-sorbate':{family:'Sorbates',scope:'core-family',source:'potassium-sorbate'},
  'calcium-sorbate':{family:'Sorbates',scope:'core-family',source:'calcium-sorbate'},
  'sodium-cmc':{family:'Sodium CMC',scope:'core-family',source:'sodium-carboxymethyl-cellulose-cmc'},
  'xanthan-gum':{family:'Hydrocolloids',scope:'core-family',source:'xanthan-gum'},
  'carrageenan':{family:'Hydrocolloids',scope:'core-family',source:'carrageenan'},
  'citric-acid':{family:'Acidulants',scope:'selection-guide',source:'citric-acid'},
  'sodium-citrate':{family:'Citrates',scope:'selection-guide',source:'sodium-citrate'},
  'datem':{family:'Emulsifiers',scope:'selection-guide',source:'datem'}
};
export function scopeFor(product){
  const record=productScope[product.slug];
  if(!record)throw new Error(`Classify the business scope for ${product.slug} before building.`);
  return {...record,family:existingPhosphateFamilies[product.slug]||record.family};
}
export const isSelectionGuide=product=>scopeFor(product).scope==='selection-guide';
