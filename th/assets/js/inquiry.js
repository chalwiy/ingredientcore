(() => {
  "use strict";
  const form = document.querySelector('[data-inquiry-form]');
  if (!form) return;
  const status = form.querySelector('[data-inquiry-status]');
  const previewBox = form.querySelector('[data-inquiry-preview-box]');
  const preview = form.querySelector('[data-inquiry-preview]');
  const extra = form.querySelector('[data-inquiry-extra]');
  const type = form.elements.namedItem('inquiry_type');
  const hints = {
    'Product / quotation inquiry': "ระบุเกรด ปริมาณ และตลาดปลายทาง หากทราบ",
    'Sample availability question': "ขอตัวอย่างฟรีและสอบถามปริมาณ เกรด และการจัดส่ง",
    'Product document request': "ระบุผลิตภัณฑ์ เกรด และเอกสารที่ต้องการ",
    'Application / selection question': "แจ้งประเภทอาหาร กระบวนการผลิต และผลที่ต้องการ"
  };
  const intentMap = { product: 'Product / quotation inquiry', sample: 'Sample availability question', documents: 'Product document request', application: 'Application / selection question', comparison: 'Application / selection question' };
  const hint = form.querySelector('[data-inquiry-hint]');
  const fields = [...form.querySelectorAll('[data-limit]')];
  const labels = { ingredient: 'ผลิตภัณฑ์หรือหน้าที่', name: 'ชื่อผู้ติดต่อ', email: 'อีเมล', company: 'บริษัท', market: 'ตลาดปลายทาง', application: 'อาหารและกระบวนการ', goal: 'หน้าที่ที่ต้องการ', volume: 'ปริมาณและวันที่ต้องการ', specification: 'เกรดหรือข้อกำหนด', documents: 'เอกสารที่ต้องการ', purpose: 'วัตถุประสงค์', details: 'ข้อมูลเพิ่มเติม', context: 'หน้าอ้างอิง' };
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
    form.elements.namedItem('context').value = `${reference.label} — https://www.ingredientcore.com/th/${reference.path.slice(3)}`;
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
      if (field.required && !value) message = "กรุณากรอกข้อมูลในช่องนี้";
      else if (value.length > Number(field.dataset.limit)) message = "กรุณาย่อข้อความในช่องนี้";
      else if (field.name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "กรุณากรอกอีเมลให้ถูกต้อง เช่น name@company.com";
      else if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) || (field.tagName === 'INPUT' && /[\r\n\t]/.test(value))) message = "กรุณาลบอักขระที่ระบบไม่รองรับ";
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        const error = document.getElementById(`${field.id}-error`); error.textContent = message; error.hidden = false;
        first ||= field;
      }
    });
    if (first) {
      status.textContent = "ตรวจช่องที่ทำเครื่องหมายไว้ก่อนเตรียมคำขอ";
      if (first.closest('details')) extra.open = true;
      first.focus(); return false;
    }
    return true;
  };
  const compose = () => {
    const title = type.selectedOptions[0].textContent.trim();
    const ingredient = form.elements.namedItem('ingredient').value.trim();
    const subject = `IngredientCore | ${title} | ${ingredient}`.replace(/[\r\n\t]/g, ' ');
    const lines = [];
    Object.keys(labels).forEach(name => {
      const fieldValue = form.elements.namedItem(name).value.trim();
      const value = name === 'context' && reference ? fieldValue.split(' — ').at(-1) : fieldValue;
      if (value) lines.push(`${labels[name]}: ${value}`);
    });
    const body = lines.join('\n\n');
    return { subject, body, text: `ถึง: ${form.dataset.inquiryEmail}\nหัวข้อ: ${subject}\n\n${body}` };
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
      showPreview(inquiry.text, "คำขอยาวเกินกว่าจะเปิดเป็นอีเมลฉบับร่างผ่านลิงก์ได้ คัดลอกข้อความจากด้านล่างไปวางในอีเมล ตรวจทานและกดส่งเอง");
      return;
    }
    showPreview(inquiry.text, "เตรียมอีเมลฉบับร่างแล้ว หากโปรแกรมอีเมลเปิดขึ้น ให้ตรวจทานและกดส่งเอง หรือคัดลอกข้อความจากด้านล่างไปส่งทางเว็บเมล");
    const link = document.createElement('a'); link.href = url; link.hidden = true;
    form.append(link); link.click(); link.remove();
  });
  form.querySelector('[data-copy-inquiry]').addEventListener('click', async () => {
    clearOutput(); if (!validate()) return;
    const text = compose().text;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("ไม่มีคลิปบอร์ด");
      await navigator.clipboard.writeText(text);
      showPreview(text, "คัดลอกคำขอแล้ว วางข้อความในอีเมล ตรวจทาน และกดส่งเอง");
    } catch (_) {
      showPreview(text, "ระบบเลือกข้อความไว้ด้านล่างแล้ว ใช้คำสั่งคัดลอกของอุปกรณ์ วางในอีเมล ตรวจทาน และกดส่งเอง");
    }
  });
  form.querySelectorAll('button[disabled]').forEach(button => { button.disabled = false; });
})();
