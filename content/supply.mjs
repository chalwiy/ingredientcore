// Editorial request categories, not a list of files verified as available.
// No local source document is approved for public download in this release.
export const documentTypes = [
  {id:'specification',label:'Product specification',short:'SPEC',request:'Current product specification',purpose:'Identity, proposed or agreed limits, units and analytical methods.',check:'Match the product, grade, source and revision. Agree which limits will govern the order.',boundary:'A brochure or reference standard is not an agreed specification for the offered supply.'},
  {id:'tds',label:'Technical Data Sheet',short:'TDS',request:'Current Technical Data Sheet (TDS)',purpose:'Technical context, typical properties, handling and application information.',check:'Read the version, measurement conditions and notes that distinguish typical values from limits.',boundary:'Typical properties and general application guidance are not batch results or guaranteed performance.'},
  {id:'coa',label:'Certificate of Analysis',short:'COA',request:'Representative COA and batch COA availability',purpose:'Reported test results for an identified sample or lot.',check:'Match the sample or lot, product, source, dates, units and methods to the agreed specification.',boundary:'A representative COA supports early review; it does not prove the results of a future batch.'},
  {id:'sds',label:'Safety Data Sheet',short:'SDS',request:'Current Safety Data Sheet (SDS)',purpose:'Material-specific hazard communication and handling information.',check:'Check the identity, issuer, revision and suitability of the document for the intended jurisdiction.',boundary:'An SDS does not by itself establish food-grade status, product conformity or permission in a food category.'},
  {id:'certificates',label:'Certificates with applicable scope',short:'CERT',request:'Applicable site- and product-specific certificates, if available',purpose:'Evidence covering the named entity, activity, product or site, within its stated scope.',check:'Confirm the issuer, named holder, sites, scope, dates and current status through an appropriate verification route.',boundary:'A parent-company certificate or a source certificate is not automatically an IngredientCore certificate.'},
  {id:'declarations',label:'Source-specific declarations',short:'DECL',request:'Required source-specific declarations (please specify)',purpose:'Information requested for the buyer’s particular qualification requirements.',check:'Specify the exact requirement: for example allergen, GMO, origin, irradiation, Halal or Kosher records.',boundary:'Availability and scope depend on the exact material and source.'}
];

export const identityChecks = [
  ['Sales and contracting entity','Confirm the complete legal name of the seller on the quotation and contract.'],
  ['Producer and site','Confirm the actual producer and manufacturing or packing site for the product and grade being proposed. A group relationship does not identify the producer.'],
  ['Invoice and export roles','Confirm who will issue the invoice and, where relevant, handle export or shipping documents. These roles must be checked for the individual transaction.'],
  ['Document-to-supply match','Check that each record relates to that entity, material, grade and source. Explain any difference in names before approval.']
];

export const orderChecks = [
  ['Sample and grade','Confirm whether a sample is available, what grade and source it represents, and how trial results will be compared with the commercial specification.'],
  ['Packaging and delivery','Agree quantity, pack format, labels, storage requirements, destination, delivery terms and timing for the offer.'],
  ['Batch and receiving records','Agree which batch records will accompany the shipment and which receiving checks, acceptance limits and handling of discrepancies are needed.'],
  ['Changes and exceptions','Ask what happens if the source, grade or specification changes, and agree how complaints or nonconforming deliveries will be handled.']
];
