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
    'Product / quotation inquiry': "索取報價時，請提供等級或目標規格、預計數量和目的地市場。",
    'Sample availability question': "申請免費樣品時，請載明產品或等級、試驗用途和目的地。業務會確認樣品數量與寄送安排。",
    'Product document request': "請載明產品或等級及所需資料。索取證書時，請一併提供目的地市場及審查用途。",
    'Application / selection question': "請說明食品類型、製程及目標功能，並提供已知的試驗條件或規格要求。"
  };
  const intentMap = { product: 'Product / quotation inquiry', sample: 'Sample availability question', documents: 'Product document request', application: 'Application / selection question', comparison: 'Application / selection question' };
  const hint = form.querySelector('[data-inquiry-hint]');
  const fields = [...form.querySelectorAll('[data-limit]')];
  const labels = { ingredient: "產品或目標功能", name: '姓名', email: "公司電子郵件", company: '公司', market: "目的地市場", application: "食品應用", goal: "目標功能", volume: "預計採購量和所需時間", specification: "目標等級或規格", documents: "所需文件或證書", purpose: "審查文件或樣品試驗的用途", details: "其他問題", context: "參考頁" };
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
    form.elements.namedItem('context').value = `${reference.label} — https://www.ingredientcore.com/zh-tw/${reference.path.slice(3)}`;
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
      if (field.required && !value) message = "請填寫此項。";
      else if (value.length > Number(field.dataset.limit)) message = "輸入內容超過此欄位的字元上限。";
      else if (field.name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "請輸入有效的公司電子郵件信箱。";
      else if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) || (field.tagName === 'INPUT' && /[\r\n\t]/.test(value))) message = "請刪除此欄位中無法識別的字元。";
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        const error = document.getElementById(`${field.id}-error`); error.textContent = message; error.hidden = false;
        first ||= field;
      }
    });
    if (first) {
      status.textContent = "請檢查標出的欄位，再產生詢問內容。";
      if (first.closest('details')) extra.open = true;
      first.focus(); return false;
    }
    return true;
  };
  const compose = () => {
    const title = type.selectedOptions[0].textContent.trim();
    const ingredient = form.elements.namedItem('ingredient').value.trim();
    const subject = `IngredientCore | ${title} | ${ingredient}`.replace(/[\r\n\t]/g, ' ');
    const lines = [`詢問類型：${title}`];
    Object.keys(labels).forEach(name => {
      const value = form.elements.namedItem(name).value.trim();
      if (value) lines.push(`${labels[name]}：${value}`);
    });
    const body = lines.join('\n\n');
    return { subject, body, text: `收件人：${form.dataset.inquiryEmail}\n主旨：${subject}\n\n${body}` };
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
      showPreview(inquiry.text, "詢問內容較長。請複製下方完整內容，貼到自己的電子郵件，確認後寄給業務。");
      return;
    }
    showPreview(inquiry.text, "郵件草稿已準備好。請在郵件程式中確認後自行寄出，也可複製下方內容。");
    const link = document.createElement('a'); link.href = url; link.hidden = true;
    form.append(link); link.click(); link.remove();
  });
  form.querySelector('[data-copy-inquiry]').addEventListener('click', async () => {
    clearOutput(); if (!validate()) return;
    const text = compose().text;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("無法使用剪貼簿");
      await navigator.clipboard.writeText(text);
      showPreview(text, "已複製詢問內容。請貼到自己的電子郵件中，確認後寄給業務。");
    } catch (_) {
      showPreview(text, "目前無法自動複製。頁面已選取完整內容，請手動複製到自己的電子郵件，再確認並寄出。");
    }
  });
  form.querySelectorAll('button[disabled]').forEach(button => { button.disabled = false; });
})();
