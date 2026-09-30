// One static contact form for every inquiry route. The page itself makes no network request.
export function contactForm(e, brand, returnRoutes) {
  const field = (label, name, {type='text', required=false, limit=200, hint='', placeholder='', autocomplete=''}={}) =>
    `<label class="contact-field">${e(label)}${required?' <span aria-hidden="true">*</span>':''}<input name="${name}" type="${type}"${required?' required':''} maxlength="${limit}" data-limit="${limit}"${autocomplete?` autocomplete="${autocomplete}"`:''}${placeholder?` placeholder="${e(placeholder)}"`:''}${hint?` aria-describedby="hint-${name}"`:''}>${hint?`<small id="hint-${name}">${e(hint)}</small>`:''}</label>`;
  const area = (label,name,limit,placeholder) => `<label class="contact-field">${e(label)}<textarea name="${name}" rows="3" maxlength="${limit}" data-limit="${limit}" placeholder="${e(placeholder)}"></textarea></label>`;
  return `<form class="contact-form" data-contact-form data-inquiry-email="${e(brand.email)}" data-return-map="${e(JSON.stringify(returnRoutes))}" novalidate>
    <p class="contact-form__note">This prepares an email draft. You send the email yourself in your own mail app. Nothing is submitted by this website. Fields marked * are required.</p>
    <div class="contact-context" data-contact-context hidden><label>Reference page<input name="context" readonly maxlength="240"></label><a class="text-link" data-context-return target="_blank" rel="noopener noreferrer" href="../products/index.html">Return to the reference page <span aria-hidden="true">↗</span></a><p>Opens in a new tab. Your unsent brief is lost if you reload or close this page.</p></div>
    <fieldset class="contact-form__group"><legend>1 / What do you need?</legend>
      <label class="contact-field">Inquiry type<select name="inquiry_type"><option value="Product / quotation inquiry">Product / quotation inquiry</option><option value="Application / selection question">Application / selection question</option><option value="Product document request">Product document request</option><option value="Sample availability question">Sample availability question</option></select></label>
      ${field('Ingredient or target function','ingredient',{required:true,placeholder:'e.g. SAPP grade or leavening for a bakery mix',hint:'Name a product, or describe the function you need.'})}
      <div class="form-row">${field('Your name','name',{required:true,limit:150,autocomplete:'name'})}${field('Business email','email',{type:'email',required:true,limit:254,autocomplete:'email'})}</div>
    </fieldset>
    <fieldset class="contact-form__group"><legend>2 / Useful details, if known</legend><p class="contact-form__note">A short brief is enough to start. Add only details relevant to your question.</p>
      <div class="form-row">${field('Company','company',{autocomplete:'organization'})}${field('Destination market','market',{limit:120,placeholder:'Country or region'})}</div>
      <div class="form-row">${field('Food application','application',{placeholder:'Food type and process'})}${field('Target function','goal',{placeholder:'e.g. texture, suspension or preservation'})}</div>
      ${field('Estimated volume and timing','volume',{limit:150,placeholder:'Trial stage, first order or expected quantity; optional'})}
      ${area('Target grade or specification','specification',2000,'Relevant identity, limits, units and test methods, if known.')}
      ${area('Documents to review','documents',1200,'e.g. specification, TDS, SDS, batch COA or source-specific declarations')}
      ${area('Purpose of document request','purpose',500,'e.g. supplier qualification or sample comparison')}
      ${area('Process, packaging or delivery questions','details',2000,'Describe relevant conditions or commercial questions without sending a full confidential recipe.')}
    </fieldset>
    <p class="contact-form__privacy">Only the public product, application or document topic is carried in a link to this page. Your entries stay in this browser until you open a mail draft or copy them. This site does not submit or store the form. Avoid confidential full formulas at this stage. <a href="../privacy/index.html">Read how inquiry data is handled</a>.</p>
    <div class="contact-form__actions"><button class="button button--navy" type="submit" disabled>Open email draft <span aria-hidden="true">↗</span></button></div>
    <noscript><p class="contact-form__fallback">Preparing a form draft requires JavaScript. Use the email template or write directly to ${e(brand.email)}.</p></noscript>
    <p class="contact-form__fallback">Using webmail or no mail app? Use Copy inquiry for webmail after completing the fields, or <a href="mailto:${e(brand.email)}?subject=IngredientCore%20inquiry&amp;body=Product%20or%20target%20function%3A%0AFood%20application%3A%0ADestination%20market%3A%0ADocuments%20needed%3A">open a blank email template</a>. You can also write directly to <a href="mailto:${e(brand.email)}">${e(brand.email)}</a>.</p>
    <p class="contact-form__fallback">There is no file upload here. You may attach an existing specification in your own email app if appropriate; ask how to exchange restricted files first. A document or sample request does not confirm availability, approval, price or timing.</p>
  </form>`;
}
