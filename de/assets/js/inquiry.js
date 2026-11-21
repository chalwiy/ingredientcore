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
    'Product / quotation inquiry': "Nennen Sie gewünschte Qualität oder Produktspezifikation, voraussichtliche Menge und Lieferort, soweit bekannt.",
    'Sample availability question': "Nennen Sie Produkt oder Qualität, Testzweck und Lieferort. Stimmen Sie Menge und Versand des kostenlosen Evaluierungsmusters mit dem Vertrieb ab.",
    'Product document request': "Nennen Sie Produkt oder Qualität und die benötigten Unterlagen. Geben Sie bei Zertifikaten außerdem Absatzmarkt und Prüfzweck an.",
    'Application / selection question': "Beschreiben Sie das Lebensmittel, die Prozessbedingungen und die gewünschte Funktion. Ergänzen Sie bekannte Prüfbedingungen oder Spezifikationsanforderungen."
  };
  const intentMap = { product: 'Product / quotation inquiry', sample: 'Sample availability question', documents: 'Product document request', application: 'Application / selection question', comparison: 'Application / selection question' };
  const hint = form.querySelector('[data-inquiry-hint]');
  const fields = [...form.querySelectorAll('[data-limit]')];
  const labels = { ingredient: 'Produkt oder gewünschte Funktion', name: 'Name', email: 'Geschäftliche E-Mail-Adresse', company: 'Unternehmen', market: 'Vorgesehener Absatzmarkt', application: 'Lebensmittelanwendung', goal: 'Gewünschte Funktion', volume: 'Voraussichtliche Menge und Termin', specification: 'Gewünschte Qualität oder Produktspezifikation', documents: 'Benötigte Unterlagen oder Zertifikate', purpose: 'Zweck der Dokumenten- oder Musterprüfung', details: 'Weitere Fragen', context: 'Ausgangsseite' };
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
    form.elements.namedItem('context').value = `${reference.label} — https://www.ingredientcore.com/de/${reference.path.slice(3)}`;
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
      if (field.required && !value) message = "Füllen Sie dieses Feld aus.";
      else if (value.length > Number(field.dataset.limit)) message = "Die Eingabe überschreitet die zulässige Zeichenanzahl.";
      else if (field.name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "Geben Sie eine gültige geschäftliche E-Mail-Adresse ein.";
      else if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) || (field.tagName === 'INPUT' && /[\r\n\t]/.test(value))) message = "Entfernen Sie unzulässige Zeichen aus dem Feld.";
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        const error = document.getElementById(`${field.id}-error`); error.textContent = message; error.hidden = false;
        first ||= field;
      }
    });
    if (first) {
      status.textContent = "Überprüfen Sie die markierten Felder, bevor Sie Ihre Anfrage vorbereiten.";
      if (first.closest('details')) extra.open = true;
      first.focus(); return false;
    }
    return true;
  };
  const compose = () => {
    const title = type.selectedOptions[0].textContent.trim();
    const ingredient = form.elements.namedItem('ingredient').value.trim();
    const subject = `IngredientCore | ${title} | ${ingredient}`.replace(/[\r\n\t]/g, ' ');
    const lines = [`Anfrageart: ${title}`];
    Object.keys(labels).forEach(name => {
      const value = form.elements.namedItem(name).value.trim();
      if (value) lines.push(`${labels[name]}: ${value}`);
    });
    const body = lines.join('\n\n');
    return { subject, body, text: `Empfänger: ${form.dataset.inquiryEmail}\nBetreff: ${subject}\n\n${body}` };
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
      showPreview(inquiry.text, "Die Anfrage ist zu lang für einen E-Mail-Link. Kopieren Sie den vollständigen Text in eine neue E-Mail und versenden Sie sie selbst.");
      return;
    }
    showPreview(inquiry.text, "Der E-Mail-Entwurf ist vorbereitet. Prüfen und versenden Sie ihn in Ihrem E-Mail-Programm. Sie können den angezeigten Text auch kopieren.");
    const link = document.createElement('a'); link.href = url; link.hidden = true;
    form.append(link); link.click(); link.remove();
  });
  form.querySelector('[data-copy-inquiry]').addEventListener('click', async () => {
    clearOutput(); if (!validate()) return;
    const text = compose().text;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Zwischenablage nicht verfügbar");
      await navigator.clipboard.writeText(text);
      showPreview(text, "Die Anfrage wurde kopiert. Fügen Sie den Text in eine neue E-Mail ein. Prüfen und versenden Sie die Nachricht selbst.");
    } catch (_) {
      showPreview(text, "Automatisches Kopieren ist nicht verfügbar. Kopieren Sie den markierten Text in eine neue E-Mail und versenden Sie sie selbst.");
    }
  });
  form.querySelectorAll('button[disabled]').forEach(button => { button.disabled = false; });
})();
