// Route and association manifest; original reviewed bodies live in article-details.
import {enhanceArticles} from './article-details.mjs';
const manifest=[
 {slug:'stpp-vs-shmp',category:'Ingredient comparison',title:'STPP vs. SHMP: choose by the job, not the initials',products:['sodium-tripolyphosphate-stpp','sodium-hexametaphosphate-shmp'],applications:['meat-seafood','beverages']},
 {slug:'sapp-vs-salp-bakery',category:'Bakery formulation',title:'SAPP vs. SALP in bakery leavening systems',products:['sodium-acid-pyrophosphate-sapp','sodium-aluminum-phosphate-salp'],applications:['bakery']},
 {slug:'propionates-and-sorbates',category:'Ingredient comparison',title:'Propionates and sorbates: frame the preservation question',products:['calcium-propionate','sodium-propionate','potassium-sorbate','calcium-sorbate'],applications:['bakery','beverages','sauces']},
 {slug:'hydrocolloid-selection',category:'Texture & stability',title:'CMC, xanthan and carrageenan: select by texture behavior',products:['sodium-cmc','xanthan-gum','carrageenan'],applications:['dairy','beverages','sauces']},
 {slug:'citric-acid-vs-sodium-citrate',category:'Ingredient comparison',title:'Citric acid vs. sodium citrate in a formulation brief',products:['citric-acid','sodium-citrate'],applications:['beverages','dairy','sauces']},
 {slug:'specification-tds-coa',category:'Buyer documentation',title:'Specification, TDS and COA: three different questions',products:['sodium-tripolyphosphate-stpp','sodium-cmc'],applications:[]},
 {slug:'qualify-ingredient-source',category:'Supplier qualification',title:'How to qualify a new food ingredient source',products:[],applications:[]},
 {slug:'write-ingredient-brief',category:'Sourcing practice',title:'Write an ingredient brief that leads to a useful answer',products:['sodium-acid-pyrophosphate-sapp','sodium-aluminum-phosphate-salp'],applications:['bakery']}
];
export const articles=enhanceArticles(manifest);
