(() => {
  'use strict';
  const form = document.querySelector('[data-inquiry-form]');
  if (!form) return;
  const status = form.querySelector('[data-inquiry-status]');
  const previewBox = form.querySelector('[data-inquiry-preview-box]');
  const preview = form.querySelector('[data-inquiry-preview]');
  const extra = form.querySelector('[data-inquiry-extra]');
  const type = form.elements.namedItem('inquiry_type');
  const hints = {
    'Product / quotation inquiry': "Pour demander un devis, indiquez le grade ou la spécification, la quantité estimée et le lieu de livraison, si vous les connaissez.",
    'Sample availability question': "Pour un échantillon gratuit, indiquez le produit ou le grade, l’objectif de l’essai et le lieu de livraison. Le service commercial vérifie la quantité et les modalités d’expédition.",
    'Product document request': "Indiquez le produit ou le grade et les documents nécessaires. Pour les certificats, précisez le marché de destination et l’objet de la vérification.",
    'Application / selection question': "Décrivez la denrée, le procédé et la fonction recherchée. Ajoutez les conditions d’essai ou les critères de spécification connus."
  };
  const intentMap = { product: 'Product / quotation inquiry', sample: 'Sample availability question', documents: 'Product document request', application: 'Application / selection question', comparison: 'Application / selection question' };
  const hint = form.querySelector('[data-inquiry-hint]');
  const fields = [...form.querySelectorAll('[data-limit]')];
  const labels = { ingredient: "Nom du produit ou fonction recherchée", name: "Nom", email: "Adresse e-mail professionnelle", company: "Entreprise", market: "Marché de destination", application: "Application dans l’aliment", goal: "Fonction recherchée", volume: "Quantité estimée et date souhaitée", specification: "Grade ou spécification recherchés", documents: "Documents ou certificats nécessaires", purpose: "Objet de l’évaluation ou de l’essai", details: "Autres questions", context: "Page d’origine" };
  fields.forEach(field => {
    field.id ||= `inquiry-${field.name}`;
    const error = document.createElement('span');
    error.id = `${field.id}-error`;
    error.className = 'contact-form__error';
    error.hidden = true;
    field.insertAdjacentElement('afterend', error);
    field.setAttribute('aria-describedby', [field.getAttribute('aria-describedby'), error.id].filter(Boolean).join(' '));
  });
  const clearField = field => {
    field.removeAttribute('aria-invalid');
    const error = document.getElementById(`${field.id}-error`);
    error.textContent = ''; error.hidden = true;
  };
  const clearOutput = () => { status.textContent = ''; preview.value = ''; previewBox.hidden = true; };
  const updateHint = () => { hint.textContent = hints[type.value]; };
  const query = new URLSearchParams(location.search.length <= 4096 ? location.search : '');
  ['ingredient', 'application', 'goal', 'documents', 'purpose'].forEach(name => {
    const field = form.elements.namedItem(name), value = query.get(name);
    if (value && value.length <= Number(field.dataset.limit) && !/[\u0000-\u001f\u007f]/.test(value)) {
      field.value = value;
      if (field.closest('details')) extra.open = true;
    }
  });
  if (intentMap[query.get('intent')]) type.value = intentMap[query.get('intent')];
  // Only the fixed local route map may supply a return link; URL parameters never become link destinations.
  let routes = {};
  try { routes = JSON.parse(form.dataset.returnMap); } catch (_) { /* The form remains usable without a reference link. */ }
  const reference = Object.prototype.hasOwnProperty.call(routes, query.get('from')) ? routes[query.get('from')] : null;
  if (reference && /^\.\.\/(?:products|applications|knowledge|quality|about)\//.test(reference.path)) {
    const box = form.querySelector('[data-contact-context]'), link = box.querySelector('a');
    link.href = reference.path; link.textContent = reference.label;
    form.elements.namedItem('context').value = `${reference.label} — https://www.ingredientcore.com/fr/${reference.path.slice(3)}`;
    box.hidden = false;
  }
  updateHint();
  type.addEventListener('change', () => { updateHint(); clearOutput(); });
  form.addEventListener('input', event => { clearOutput(); if (event.target.matches('[data-limit]')) clearField(event.target); });
  const validate = () => {
    let first = null;
    fields.forEach(field => {
      clearField(field);
      const value = field.value.trim();
      let message = '';
      if (field.required && !value) message = "Renseignez ce champ.";
      else if (value.length > Number(field.dataset.limit)) message = "Le texte dépasse le nombre de caractères autorisé.";
      else if (field.name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "Saisissez une adresse e-mail professionnelle valide.";
      else if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) || (field.tagName === 'INPUT' && /[\r\n\t]/.test(value))) message = "Supprimez les caractères non autorisés dans ce champ.";
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        const error = document.getElementById(`${field.id}-error`); error.textContent = message; error.hidden = false;
        first ||= field;
      }
    });
    if (first) {
      status.textContent = "Vérifiez les champs signalés.";
      if (first.closest('details')) extra.open = true;
      first.focus(); return false;
    }
    return true;
  };
  const compose = () => {
    const title = type.selectedOptions[0].textContent.trim();
    const ingredient = form.elements.namedItem('ingredient').value.trim();
    const subject = `IngredientCore | ${title} | ${ingredient}`.replace(/[\r\n\t]/g, ' ');
    const lines = [`Type de demande : ${title}`];
    Object.keys(labels).forEach(name => {
      const value = form.elements.namedItem(name).value.trim();
      if (value) lines.push(`${labels[name]} : ${value}`);
    });
    const body = lines.join('\n\n');
    return { subject, body, text: `Destinataire : ${form.dataset.inquiryEmail}\nObjet : ${subject}\n\n${body}` };
  };
  const showPreview = (text, message) => {
    previewBox.hidden = false; preview.value = text; status.textContent = message;
    preview.focus(); preview.select();
  };
  form.addEventListener('submit', event => {
    event.preventDefault(); clearOutput();
    if (!validate()) return;
    const inquiry = compose();
    const url = `mailto:${form.dataset.inquiryEmail}?subject=${encodeURIComponent(inquiry.subject)}&body=${encodeURIComponent(inquiry.body)}`;
    if (url.length > 1800) {
      showPreview(inquiry.text, "La demande est trop longue pour un lien d’e-mail. Copiez le texte intégral dans un nouveau message, puis envoyez-le vous-même.");
      return;
    }
    showPreview(inquiry.text, "Le brouillon est prêt. Vérifiez-le dans votre messagerie et envoyez-le vous-même. Vous pouvez aussi copier le texte affiché.");
    const link = document.createElement('a'); link.href = url; link.hidden = true;
    form.append(link); link.click(); link.remove();
  });
  form.querySelector('[data-copy-inquiry]').addEventListener('click', async () => {
    clearOutput(); if (!validate()) return;
    const text = compose().text;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Presse-papiers indisponible");
      await navigator.clipboard.writeText(text);
      showPreview(text, "La demande a été copiée. Collez le texte dans un nouveau message, vérifiez-le et envoyez-le vous-même.");
    } catch (_) {
      showPreview(text, "La copie automatique est indisponible. Copiez le texte sélectionné, collez-le dans un nouveau message et envoyez-le vous-même.");
    }
  });
  form.querySelectorAll('button[disabled]').forEach(button => { button.disabled = false; });
})();
