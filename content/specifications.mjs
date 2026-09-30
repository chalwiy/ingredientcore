// Public reference values only. Evidence, exclusions and permissions:
// SPECIFICATION-AUDIT.md (internal; not part of the release).
// Source rows are strings to preserve inequality, range and reporting basis.
const parent = (slug,identity,scope,rows,conditions='The source does not identify analytical methods for these selected fields.') => ({
 kind:'parent-reference', publication:'reference-values-only', downloadApproved:false,
 title:'Bespring reference specification', identity, scope, rows, conditions,
 issuer:'Bespring Chemical', version:'Undated reference sheet',
 sourceLabel:'Bespring product reference',
 sourceUrl:`https://www.bespringchem.com/products/food-ingredients/${slug}.html`,
 acceptance:'These selected composition and physical fields are a reference for comparison, not a complete food-grade acceptance specification or an IngredientCore supply guarantee. Ask us for the specification, test methods and impurity requirements for the proposed grade and source.'
});
export const specifications = {
 'sodium-tripolyphosphate-stpp':parent('sodium-tripolyphosphate-stpp','Sodium tripolyphosphate (Na₅P₃O₁₀), powder or granules',
  'Selected limits from Bespring’s STPP Product Specification. They describe that reference sheet; a different commercial grade or batch must be assessed against its own specification.',[
   ['Assay as Na₅P₃O₁₀','≥ 85.0','%'],['Phosphorus expressed as P₂O₅','56.0–58.0','%'],['Water-insoluble matter','≤ 0.1','%']]),
 'sodium-hexametaphosphate-shmp':parent('sodium-hexametaphosphate-shmp','Commercial sodium hexametaphosphate (SHMP), powder',
  'Selected limits from Bespring’s SHMP Product Specification. The phosphate expressions below are separate fields; they do not define chain-length distribution or a single pure hexamer.',[
   ['Total phosphate as P₂O₅','≥ 68.0','%'],['Inactive phosphate as P₂O₅','≤ 7.5','%'],['Water-insoluble matter','≤ 0.06','%'],['pH — 1% solution','5.8–6.5','Dimensionless']
  ],'The pH concentration is stated in the source. Temperature, concentration basis and analytical methods are not specified.'),
 'sodium-acid-pyrophosphate-sapp':parent('sodium-acid-pyrophosphate-sapp','Sodium acid pyrophosphate (Na₂H₂P₂O₇), white powder',
  'Selected limits from Bespring’s SAPP specification sheet. They do not identify a commercial leavening reaction grade or establish its reaction rate.',[
   ['SAPP content as Na₂H₂P₂O₇','≥ 95.0','%'],['Water-insoluble matter','≤ 1.0','%'],['pH — 1% aqueous solution','3.5–4.5','Dimensionless']
  ],'The pH concentration is stated; temperature and concentration basis are not. The source does not state an assay basis or analytical method for these rows.'),
 'monopotassium-phosphate-mkp':parent('monopotassium-phosphate-mkp','Monopotassium phosphate (KH₂PO₄)',
  'Selected limits from Bespring’s MKP specification sheet. The assay is expressly on a dry basis. These fields do not qualify an agricultural grade for food use.',[
   ['KH₂PO₄ content — dry basis','≥ 98.0','%'],['Water-insoluble matter','≤ 0.1','%']]),
 'sodium-trimetaphosphate-stmp':parent('sodium-trimetaphosphate-stmp','Sodium trimetaphosphate, cyclic Na₃(PO₃)₃',
  'Selected limits from Bespring’s STMP specification sheet, for reagent comparison in starch-modification discussions. These values do not establish permission for direct addition to finished foods.',[
   ['Sodium trimetaphosphate content','≥ 98.5','%'],['P₂O₅ content','≥ 68.0','%'],['Insoluble matter','≤ 0.1','%'],['pH — 1% solution','6.0–8.0','Dimensionless']
  ],'The source states the pH concentration but not its basis or temperature. It gives no analytical methods for these selected rows.'),
 'potassium-sorbate':parent('potassium-sorbate','Potassium sorbate, white to off-white granules',
  'Selected limits from Bespring’s granular potassium sorbate specification sheet. The assay is on a dry basis; the drying condition belongs to the loss-on-drying test.',[
   ['Potassium sorbate content — dry basis','99.0–101.0','%'],['Loss on drying — 105°C for 3 hours','≤ 1.0','%']
  ],'The drying temperature and duration are stated in the source. The assay method is not specified.'),
 'sodium-cmc':{
  kind:'standard-reference',publication:'reference-values-only',downloadApproved:false,
  title:'JECFA reference requirements',identity:'Sodium carboxymethyl cellulose (INS 466)',
  issuer:'FAO/JECFA',version:'Monograph 11 (2011), Sodium Carboxymethyl Cellulose',
  sourceLabel:'FAO/JECFA Monograph 11 — sodium CMC',sourceUrl:'https://www.fao.org/4/i2358e/i2358e00.pdf#page=107',
  scope:'Selected identity and purity requirements from the sodium CMC monograph. They are not commercial viscosity grades and do not apply to cross-linked or enzymatically hydrolyzed CMC.',
  rows:[['Assay — dried basis','≥ 99.5','%'],['Loss on drying — 105°C to constant weight','≤ 12','%'],['pH — 1 in 100 solution','6.0–8.5','Dimensionless'],['Degree of substitution','0.20–1.50','Dimensionless']],
  conditions:'The monograph gives the stated drying and pH preparation conditions and refers to analytical methods. Commercial viscosity requires a separately agreed concentration, temperature and measurement method.',
  acceptance:'These selected standard requirements are not results for an IngredientCore product or evidence of conformity. Request the proposed commercial grade’s complete specification and supporting records; review food-use requirements for the destination market separately.'
 }
};
