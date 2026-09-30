export const navigation=[
  ['Products','products/index.html'],['Applications','applications/index.html'],
  ['Buying Guides','knowledge/index.html'],['Quality & Supply','quality/index.html'],['About','about/index.html']
];
export function primaryNavigation(prefix='',active=''){
  return navigation.map(([label,route])=>`<a href="${prefix}${route}"${active===label?' aria-current="page"':''}>${label}</a>`).join('')+
    `<a class="site-nav__cta" href="${prefix}contact/index.html"${active==='Contact'?' aria-current="page"':''}>Prepare inquiry <span aria-hidden="true">↗</span></a>`;
}
export function footerNavigation(prefix=''){
  return `<nav class="footer__links" aria-label="Ingredient and application links"><h3>Find an ingredient</h3><a href="${prefix}products/index.html">Product directory</a><a href="${prefix}applications/index.html">Food applications</a><a href="${prefix}knowledge/index.html">Buying guides</a></nav><nav class="footer__links" aria-label="Company and contact links"><h3>Company & contact</h3><a href="${prefix}about/index.html">About IngredientCore</a><a href="${prefix}quality/index.html#documents">Product documents</a><a href="${prefix}contact/index.html">Prepare inquiry</a><a href="${prefix}privacy/index.html">Privacy & inquiry data</a></nav>`;
}
