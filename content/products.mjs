// Editorial summaries for the IngredientCore catalogue. These are screening notes,
// not product specifications or claims of approval in a destination market.
import { additionalPhosphateProducts, existingPhosphateFamilies } from './phosphates.mjs';
const originalProducts = [
  {
    slug:'sodium-tripolyphosphate-stpp', name:'Sodium Tripolyphosphate', abbr:'STPP', family:'Food phosphates',
    lead:'A sodium phosphate considered for water management, texture and emulsification in selected food systems.',
    role:'STPP can influence protein-water interactions and bind certain metal ions. Its practical effect depends on the food matrix, dose, process and the grade supplied.',
    uses:['Processed meat and poultry: compare moisture, texture and cooking yield in controlled trials.','Seafood: assess hydration, freeze-thaw behavior and finished-product quality.','Formulated foods: evaluate buffering and dispersion in the complete recipe.'],
    checks:['Confirm the exact food-grade identity and applicable destination-market use.','Agree assay, phosphorus content, insolubles, contaminants and test methods.','Check particle size and dissolution behavior against the process.'],
    question:'What food matrix, process temperature and water-management target are you trying to address?'
  },
  {
    slug:'sodium-hexametaphosphate-shmp', name:'Sodium Hexametaphosphate', abbr:'SHMP', family:'Food phosphates',
    lead:'A condensed phosphate commonly assessed for sequestration, dispersion and mineral-management tasks.',
    role:'Commercial SHMP is a phosphate glass rather than a single, fixed ring molecule. Chain distribution and solution behavior should be assessed against the intended use.',
    uses:['Beverage or dairy systems: test mineral interactions and stability.','Seafood processing: evaluate quality under the actual brine and storage conditions.','Other formulated foods: screen sequestration and dispersion where permitted.'],
    checks:['Identify the supplied grade and its composition, pH and solubility.','Review insolubles, contaminants and the current source specification.','Compare performance with STPP only in the actual formulation.'],
    question:'Is the main target mineral control, dispersion, texture or another function?'
  },
  {
    slug:'sodium-acid-pyrophosphate-sapp', name:'Sodium Acid Pyrophosphate', abbr:'SAPP', family:'Food phosphates',
    lead:'A leavening acid selected by reaction profile for bakery and dry-mix systems.',
    role:'SAPP reacts with bicarbonate to release carbon dioxide. Commercial grades can differ in reaction timing, which affects batter holding, oven lift and finished pH.',
    uses:['Cakes and muffins: balance early and later gas release.','Baking powders and dry mixes: check moisture protection and blend uniformity.','Prepared bakery mixes: compare holding behavior with the defined acid–bicarbonate system.'],
    checks:['Ask for the supplier-defined reaction-rate grade and test method.','Review neutralizing value, particle profile and assay.','Trial the complete leavening system rather than substituting on chemical name alone.'],
    question:'How long is the batter or dough held before heating?'
  },
  {
    slug:'sodium-aluminum-phosphate-salp', name:'Sodium Aluminum Phosphate', abbr:'SALP', family:'Food phosphates',
    lead:'For an identified acidic SALP grade, compare acid balance and gas-release timing in the bakery system.',
    role:'An acidic SALP grade can be discussed as an acid component with bicarbonate. Confirm exact identity and grade before comparing balance, reaction tests and the baking process.',
    uses:['Baking powder: compare reaction timing and dry-blend stability.','Cakes and bakery mixes: measure batter pH, volume, crumb and sensory outcome.','Frozen or delayed-bake formats: verify gas retention through the full process.'],
    checks:['Confirm the exact SALP type and current specification.','Define desired gas-release timing and bicarbonate balance.','Check destination-market permission and labeling requirements.'],
    question:'Which existing leavening acid and baking process will the candidate be compared against?'
  },
  {
    slug:'tetrapotassium-pyrophosphate-tkpp', name:'Tetrapotassium Pyrophosphate', abbr:'TKPP', family:'Food phosphates',
    lead:'A potassium phosphate evaluated for buffering, emulsification and water-binding roles.',
    role:'TKPP may be useful where a potassium-based phosphate system is desired. Solubility, alkalinity and ionic balance matter as much as the product name.',
    uses:['Processed protein foods: test texture and moisture management.','Dairy and prepared foods: examine emulsion and mineral balance.','Potassium-oriented formulations: assess sodium targets alongside total mineral contribution.'],
    checks:['Specify form, assay, pH and dissolution needs.','Check sodium, potassium and phosphate contribution to the complete formula.','Verify the relevant food category and destination-market rules.'],
    question:'Is potassium substitution, process behavior or both driving the selection?'
  },
  {
    slug:'calcium-propionate', name:'Calcium Propionate', abbr:'CaP', family:'Preservation',
    lead:'A propionate commonly screened to support mold control in bakery products.',
    role:'Performance depends on formulation pH, water activity, process hygiene, packaging and storage. Calcium contribution may also matter in the recipe.',
    uses:['Bread and rolls: compare mold-growth outcomes in the actual pack and storage conditions.','Tortillas and bakery mixes: check taste, dough handling and shelf-life targets.','Prepared bakery products: evaluate alongside other preservation hurdles.'],
    checks:['Confirm food grade, assay and physical form.','Review pH, flavor impact and compatibility with yeast or leavening.','Validate permitted use and maximum level for the market and food category.'],
    question:'What shelf-life target, product pH and packaging format are involved?'
  },
  {
    slug:'sodium-propionate', name:'Sodium Propionate', abbr:'NaP', family:'Preservation',
    lead:'A propionate option for shelf-life evaluation where sodium contribution and formulation fit are acceptable.',
    role:'Sodium propionate is not a drop-in substitute for calcium propionate. Cation contribution, taste, solubility and product conditions affect the decision.',
    uses:['Bakery formulations: compare mold-control performance with the existing system.','Prepared foods: screen only for permitted applications and conditions.','Reformulation work: examine sodium and calcium contributions.'],
    checks:['Compare the current and proposed propionate grade in the same recipe.','Review sensory effect, dissolution and process compatibility.','Confirm source specification and destination-market status.'],
    question:'Why is a sodium rather than calcium propionate being considered?'
  },
  {
    slug:'potassium-sorbate', name:'Potassium Sorbate', abbr:'KS', family:'Preservation',
    lead:'A sorbate used in suitable foods to support control of yeasts and molds.',
    role:'Its performance is strongly influenced by pH and the wider preservation system. It should be validated in the finished food, package and storage conditions.',
    uses:['Beverages and sauces: evaluate pH and microbial stability.','Bakery fillings and toppings: consider distribution and storage conditions.','Prepared foods: test the full preservation system rather than one ingredient in isolation.'],
    checks:['Define pH, water activity, packaging and target shelf life.','Check food-grade identity, assay and delivery form.','Verify permitted use level and labeling in the destination market.'],
    question:'What is the finished-product pH and which spoilage organisms are of concern?'
  },
  {
    slug:'calcium-sorbate', name:'Calcium Sorbate', abbr:'CaS', family:'Preservation',
    lead:'A sorbate option whose suitability depends on solubility, process conditions and the food category.',
    role:'Calcium sorbate is less commonly selected than potassium sorbate in many liquid systems. Its dispersion and calcium contribution should be checked before considering substitution.',
    uses:['Bakery and surface applications: evaluate distribution and mold-control objectives.','Solid or lower-moisture foods: assess incorporation method and product conditions.','Reformulation: compare with potassium sorbate under identical test conditions.'],
    checks:['Confirm the current food-grade source and physical form.','Test solubility or dispersion in the proposed process.','Verify destination-market permission, use level and label declaration.'],
    question:'Why is a calcium sorbate preferred over the current preservation option?'
  },
  {
    slug:'citric-acid', name:'Citric Acid', abbr:'CA', family:'Acidity control',
    lead:'An acidulant used to adjust acidity, flavor balance and process behavior.',
    role:'Citric acid can lower pH and bring a distinct sourness. Anhydrous and monohydrate forms are not identical on a weight basis, so the supplied form must be specified.',
    uses:['Beverages: tune pH and sensory profile with the full acid system.','Sauces and prepared foods: evaluate acidity alongside preservation and texture.','Confectionery: examine sourness, crystallization and ingredient interactions.'],
    checks:['State whether anhydrous or monohydrate is required.','Define target pH, titratable acidity and sensory target.','Confirm particle size, grade and current product documents.'],
    question:'Is the priority pH reduction, flavor, preservation support or a combination?'
  },
  {
    slug:'sodium-citrate', name:'Sodium Citrate', abbr:'SC', family:'Acidity control',
    lead:'A citrate salt evaluated for buffering, mineral management and flavor balance.',
    role:'Sodium citrate can modify pH behavior and interact with minerals. The hydrate form and sodium contribution should be considered in formula calculations.',
    uses:['Beverages: assess buffer behavior and flavor balance.','Processed cheese and dairy: evaluate mineral interactions and texture.','Prepared foods: screen pH stability and ingredient compatibility.'],
    checks:['Confirm the precise citrate identity and hydrate form.','Calculate sodium contribution and buffering target.','Test with the complete mineral and acid system.'],
    question:'Which pH range and mineral interactions need to be controlled?'
  },
  {
    slug:'sodium-cmc', name:'Sodium Carboxymethyl Cellulose', abbr:'Sodium CMC', family:'Texture & stability',
    lead:'A cellulose-derived hydrocolloid selected by viscosity grade for thickening and stabilization.',
    role:'CMC grade, viscosity method and hydration conditions determine performance. The same name can cover materials with different solution behavior.',
    uses:['Beverages: evaluate suspension and mouthfeel.','Sauces: test viscosity development and process tolerance.','Frozen desserts: assess texture and stability in the full stabilizer system.'],
    checks:['Specify viscosity range, concentration, test temperature and method.','Review degree of substitution and particle size where relevant.','Validate hydration sequence, salts, pH and shear conditions.'],
    question:'What viscosity or stability target must the grade meet in your process?'
  },
  {
    slug:'xanthan-gum', name:'Xanthan Gum', abbr:'Xanthan', family:'Texture & stability',
    lead:'A hydrocolloid commonly evaluated for viscosity, suspension and flow control.',
    role:'Xanthan can give strong low-shear viscosity and shear-thinning flow. Dispersion and hydration method affect lumping and final texture.',
    uses:['Dressings and sauces: balance cling, pourability and suspension.','Beverages: test particulate suspension and mouthfeel.','Bakery or gluten-free systems: evaluate water management with other gums.'],
    checks:['Confirm mesh size, viscosity specification and test method.','Trial dispersion order and hydration time.','Check sensory, pH and salt tolerance in the final formula.'],
    question:'Do you need suspension at rest, easier pouring under shear, or both?'
  },
  {
    slug:'carrageenan', name:'Carrageenan', abbr:'CGN', family:'Texture & stability',
    lead:'A seaweed-derived hydrocolloid family used to design gelation and texture.',
    role:'Kappa, iota and lambda carrageenan differ in gel behavior. Type, blend composition, ionic conditions and heat history influence the result; a family name is not a gel grade.',
    uses:['Dairy systems: assess protein interaction and stabilization.','Desserts: compare gel strength, elasticity and syneresis.','Prepared foods: test texture with the full salt and protein system.'],
    checks:['State the carrageenan type and blend composition.','Define gel or viscosity test method, ions and temperature.','Validate sensory and storage behavior in the finished food.'],
    question:'Is the target a firm gel, elastic gel or viscosity without gelation?'
  },
  {
    slug:'datem', name:'DATEM', abbr:'DATEM', family:'Emulsification',
    lead:'An additional technical guide to DATEM identity, composition and bakery trial questions.',
    role:'DATEM is a mixture rather than one pure molecule. Fatty-acid source, composition and physical form can affect dough response.',
    uses:['Yeast-leavened bread: compare mixing tolerance and loaf structure.','Industrial bakery lines: test proof variation and process interruptions.','Improver systems: evaluate alongside enzymes, other emulsifiers and flour quality.'],
    checks:['Confirm source-specific composition, form and current specification.','Run controlled bakes with the same flour and process.','Measure dough handling, volume, crumb and sensory effect.'],
    question:'Which dough weakness or line-tolerance issue are you trying to solve?'
  }
];

export const products = [...originalProducts.map(p=>({...p,family:existingPhosphateFamilies[p.slug]||p.family})),...additionalPhosphateProducts];
