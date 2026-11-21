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
    'Product / quotation inquiry': "見積もりをご希望の場合は、グレードまたは希望規格、予定数量、納入先をお知らせください。",
    'Sample availability question': "無料サンプルをご希望の場合は、品名とグレード、試験目的、配送先をお知らせください。数量と配送方法は営業窓口で確認します。",
    'Product document request': "品名またはグレードと必要な書類をお知らせください。証明書のご依頼には、販売予定国・地域と使用目的もご記入ください。",
    'Application / selection question': "食品の種類、工程、求める機能をお知らせください。試験条件や希望規格が分かる場合は併せてご記入ください。"
  };
  const intentMap = { product: 'Product / quotation inquiry', sample: 'Sample availability question', documents: 'Product document request', application: 'Application / selection question', comparison: 'Application / selection question' };
  const hint = form.querySelector('[data-inquiry-hint]');
  const fields = [...form.querySelectorAll('[data-limit]')];
  const labels = { ingredient: "品名または求める機能", name: 'お名前', email: "勤務先メールアドレス", company: '会社名', market: "販売予定国・地域", application: "食品用途", goal: "求める機能", volume: "予定数量・希望時期", specification: "希望グレード・規格", documents: "必要な書類・証明書", purpose: "書類審査・サンプル試験の目的", details: "その他のご相談", context: "参照元" };
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
    form.elements.namedItem('context').value = `${reference.label} — https://www.ingredientcore.com/ja/${reference.path.slice(3)}`;
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
      if (field.required && !value) message = "この項目をご入力ください。";
      else if (value.length > Number(field.dataset.limit)) message = "入力内容が文字数の上限を超えています。";
      else if (field.name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "有効な勤務先メールアドレスをご入力ください。";
      else if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) || (field.tagName === 'INPUT' && /[\r\n\t]/.test(value))) message = "使用できない文字を入力欄から削除してください。";
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        const error = document.getElementById(`${field.id}-error`); error.textContent = message; error.hidden = false;
        first ||= field;
      }
    });
    if (first) {
      status.textContent = "表示された項目をご確認ください。";
      if (first.closest('details')) extra.open = true;
      first.focus(); return false;
    }
    return true;
  };
  const compose = () => {
    const title = type.selectedOptions[0].textContent.trim();
    const ingredient = form.elements.namedItem('ingredient').value.trim();
    const subject = `IngredientCore | ${title} | ${ingredient}`.replace(/[\r\n\t]/g, ' ');
    const lines = [`お問い合わせの種類：${title}`];
    Object.keys(labels).forEach(name => {
      const value = form.elements.namedItem(name).value.trim();
      if (value) lines.push(`${labels[name]}：${value}`);
    });
    const body = lines.join('\n\n');
    return { subject, body, text: `宛先：${form.dataset.inquiryEmail}\n件名：${subject}\n\n${body}` };
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
      showPreview(inquiry.text, "依頼内容が長いため、全文を表示しました。コピーして新規メールに貼り付け、ご自身で送信してください。");
      return;
    }
    showPreview(inquiry.text, "メールの下書きを用意しました。お使いのメールアプリで内容を確認し、ご自身で送信してください。下の本文をコピーして使うこともできます。");
    const link = document.createElement('a'); link.href = url; link.hidden = true;
    form.append(link); link.click(); link.remove();
  });
  form.querySelector('[data-copy-inquiry]').addEventListener('click', async () => {
    clearOutput(); if (!validate()) return;
    const text = compose().text;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("クリップボードを利用できません");
      await navigator.clipboard.writeText(text);
      showPreview(text, "依頼内容をコピーしました。新規メールに貼り付け、内容を確認してご自身で送信してください。");
    } catch (_) {
      showPreview(text, "自動コピーを利用できません。選択された依頼内容を手動でコピーし、新規メールに貼り付けて、ご自身で送信してください。");
    }
  });
  form.querySelectorAll('button[disabled]').forEach(button => { button.disabled = false; });
})();
