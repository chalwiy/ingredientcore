(() => {
  "استخدام صارم";
  const form = document.querySelector('[data-inquiry-form]');
  if (!form) return;
  const status = form.querySelector('[data-inquiry-status]');
  const previewBox = form.querySelector('[data-inquiry-preview-box]');
  const preview = form.querySelector('[data-inquiry-preview]');
  const extra = form.querySelector('[data-inquiry-extra]');
  const type = form.elements.namedItem('inquiry_type');
  const hints = {
    'Product / quotation inquiry': "وتضاف، لأغراض اقتباس، المواصفات المحددة للرتب أو الهدف، والكميات المقدرة وسوق المقصد، إذا كان معروفا.",
    'Sample availability question': "وتتوفر عينات مجانية، إضافة المنتج أو الرتبة، والغرض من المحاكمة والمقصد، وستناقش المبيعات ترتيبات الكمية والشحن.",
    'Product document request': "سم المنتج أو الصف والسجلات التي تحتاجها، للحصول على الشهادات، تشمل سوق الوجهة والغرض من مراجعتك.",
    'Application / selection question': "وصف وظيفة الغذاء والعملية والمستهدفة - إضافة ظروف المحاكمة ذات الصلة أو متطلبات المواصفات."
  };
  const intentMap = { product: 'Product / quotation inquiry', sample: 'Sample availability question', documents: 'Product document request', application: 'Application / selection question', comparison: 'Application / selection question' };
  const hint = form.querySelector('[data-inquiry-hint]');
  const fields = [...form.querySelectorAll('[data-limit]')];
  const labels = { ingredient: "وظيفة الناتج أو الهدف", name: 'Name', email: "البريد الإلكتروني لأغراض العمل", company: 'Company', market: "سوق الوجهة", application: "تطبيق الأغذية", goal: "الوظيفة المستهدفة", volume: "الكمية المقدرة والتوقيت", specification: "الدرجة أو المواصفات المستهدفة", documents: "الوثائق أو الشهادات المطلوبة", purpose: "الغرض من الاستعراض أو اختبار العينة", details: "ثالثا - مسائل أخرى", context: "الصفحة المرجعية" };
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
    form.elements.namedItem('context').value = `${reference.label} — https://www.ingredientcore.com/ar/${reference.path.slice(3)}`;
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
      if (field.required && !value) message = "ضع علامة في هذا الحقل.";
      else if (value.length > Number(field.dataset.limit)) message = "هذه القيمة طويلة جداً.";
      else if (field.name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "أدخل عنوان بريد إلكتروني صالحًا، مثل name@company.com.";
      else if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) || (field.tagName === 'INPUT' && /[\r\n\t]/.test(value))) message = "أزالة حروف التحكم غير المدعومة.";
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        const error = document.getElementById(`${field.id}-error`); error.textContent = message; error.hidden = false;
        first ||= field;
      }
    });
    if (first) {
      status.textContent = "يرجى التحقق من الحقول الموضحة قبل إعداد استفساراتكم.";
      if (first.closest('details')) extra.open = true;
      first.focus(); return false;
    }
    return true;
  };
  const compose = () => {
    const title = type.selectedOptions[0].textContent.trim();
    const ingredient = form.elements.namedItem('ingredient').value.trim();
    const subject = `IngredientCore | ${title} | ${ingredient}`.replace(/[\r\n\t]/g, ' ');
    const lines = [`Request: ${title}`];
    Object.keys(labels).forEach(name => {
      const value = form.elements.namedItem(name).value.trim();
      if (value) lines.push(`${labels[name]}: ${value}`);
    });
    const body = lines.join('\n\n');
    return { subject, body, text: `To: ${form.dataset.inquiryEmail}\nSubject: ${subject}\n\n${body}` };
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
      showPreview(inquiry.text, "هذا التحقيق طويل جداً لوصله بريديه موثوق به، ونسخ النص الكامل تحت تطبيقك البريدي وأرسله بنفسك");
      return;
    }
    showPreview(inquiry.text, "يمكن أن يفتح برنامج بريدك الإلكتروني، وأن يستعرضه ويرسله إلى هناك، ولم يقدم أي شيء من خلال هذا الموقع الشبكي، كما يمكنك أن تنسخ النص الوارد أدناه.");
    const link = document.createElement('a'); link.href = url; link.hidden = true;
    form.append(link); link.click(); link.remove();
  });
  form.querySelector('[data-copy-inquiry]').addEventListener('click', async () => {
    clearOutput(); if (!validate()) return;
    const text = compose().text;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("لوح التجميع غير متاح");
      await navigator.clipboard.writeText(text);
      showPreview(text, "تم نسخ التحقيق، وإستبقه في تطبيقك الإلكتروني، وراجعه وأرسله بنفسك، لم يتم تقديم شيء من خلال هذا الموقع");
    } catch (_) {
      showPreview(text, "النسخ الآلي غير متاح. ويرد أدناه اختيار للاستعلام الكامل. استخدموا أوامركم بالنسخ، ثم استجمعوها في تطبيقك الإلكتروني وأرسلوها بنفسك.");
    }
  });
  form.querySelectorAll('button[disabled]').forEach(button => { button.disabled = false; });
})();
