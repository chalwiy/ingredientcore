(() => {
  "ใช้ความเข้มงวด";
  const form = document.querySelector('[data-inquiry-form]');
  if (!form) return;
  const status = form.querySelector('[data-inquiry-status]');
  const previewBox = form.querySelector('[data-inquiry-preview-box]');
  const preview = form.querySelector('[data-inquiry-preview]');
  const extra = form.querySelector('[data-inquiry-extra]');
  const type = form.elements.namedItem('inquiry_type');
  const hints = {
    'Product / quotation inquiry': "สําหรับ ข้อ ความ ที่ เพิ่ม เติม เข้า ไป ใน ช่อง เกรด หรือ รายการ เป้า หมาย ประมาณ ปริมาณ และ ตลาด ที่ กําหนด ไว้ ถ้า รู้ กัน.",
    'Sample availability question': "มี ตัว อย่าง ที่ ไม่ มี ใด เหมือน.",
    'Product document request': "ชื่อ ผลิตภัณฑ์ หรือ คะแนน และ บันทึก ที่ คุณ ต้องการ.",
    'Application / selection question': "จง อธิบาย ถึง อาหาร, กระบวนการ, และ การ ทํา งาน ของ เป้า หมาย."
  };
  const intentMap = { product: 'Product / quotation inquiry', sample: 'Sample availability question', documents: 'Product document request', application: 'Application / selection question', comparison: 'Application / selection question' };
  const hint = form.querySelector('[data-inquiry-hint]');
  const fields = [...form.querySelectorAll('[data-limit]')];
  const labels = { ingredient: "ฟังก์ชัน Poduct หรือเป้าหมาย", name: 'Name', email: "อีเมลของธุรกิจ", company: 'Company', market: "ตลาดปลายทาง", application: "แอพพลิเคชันอาหาร", goal: "ฟังก์ชันเป้าหมาย", volume: "ปริมาณและเวลาโดยประมาณ", specification: "ระดับเป้าหมายหรือค่า", documents: "ต้องการเอกสารหรือใบรับรอง", purpose: "วัตถุประสงค์ของการทบทวนหรือทดลองตัวอย่าง", details: "คําถามอื่น ๆ", context: "หน้าอ้างอิง" };
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
      if (field.required && !value) message = "ดูสนามนี้สิ";
      else if (value.length > Number(field.dataset.limit)) message = "ค่านี้ยาวเกินไป";
      else if (field.name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "กรอกที่อยู่อีเมลที่ถูกต้อง เช่น name@company.com";
      else if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) || (field.tagName === 'INPUT' && /[\r\n\t]/.test(value))) message = "ลบอักขระที่ไม่รองรับการรองรับ";
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        const error = document.getElementById(`${field.id}-error`); error.textContent = message; error.hidden = false;
        first ||= field;
      }
    });
    if (first) {
      status.textContent = "ตรวจ ดู ที่ สนาม ซึ่ง เน้น เรื่อง นี้ ก่อน เตรียม การ สอบ ถาม.";
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
      showPreview(inquiry.text, "การสอบถามนี้ยาวเกินไปสําหรับการเชื่อมโยงอีเมลที่เชื่อถือได้ คัดลอกข้อความที่สมบูรณ์ด้านล่างนี้ไปยังโปรแกรมอีเมลของคุณ แล้วส่งมันด้วยตัวคุณเอง");
      return;
    }
    showPreview(inquiry.text, "เตรียมการรับส่งเมลแล้ว โปรแกรมรับจดหมายของคุณอาจจะเปิดได้ โปรดทบทวนและส่งมันมายังเว็บไซต์นี้โดยไม่มีอะไรได้รับมอบผ่านเว็บไซต์นี้ นอกจากนี้คุณยังคัดลอกข้อความด้านล่างนี้ได้อีกด้วย");
    const link = document.createElement('a'); link.href = url; link.hidden = true;
    form.append(link); link.click(); link.remove();
  });
  form.querySelector('[data-copy-inquiry]').addEventListener('click', async () => {
    clearOutput(); if (!validate()) return;
    const text = compose().text;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("ไม่มีคลิปบอร์ด");
      await navigator.clipboard.writeText(text);
      showPreview(text, "ทําสําเนาแบบสอบถาม วางมันลงในโปรแกรมอีเมลของคุณ ทบทวนและส่งด้วยตัวคุณเอง ไม่มีอะไรถูกส่งผ่านเว็บไซต์นี้");
    } catch (_) {
      showPreview(text, "ไม่สามารถคัดลอกได้โดยอัตโนมัติ การสอบสวนที่สมบูรณ์ ถูกเลือกด้านล่างนี้ ใช้ คํา สั่ง ที่ ได้ รับ จาก อุปกรณ์ ของ คุณ แล้ว วาง ไว้ ใน แอพ เมล์ ของ คุณ แล้ว ส่ง ไป ด้วย ตัว คุณ เอง.");
    }
  });
  form.querySelectorAll('button[disabled]').forEach(button => { button.disabled = false; });
})();
