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
    'Product / quotation inquiry': "Nếu đã biết, hãy ghi cấp hoặc thông số, khối lượng và nơi giao hàng.",
    'Sample availability question': "Mẫu thử miễn phí. Hãy nêu cấp, mục đích thử và nơi nhận để trao đổi lượng mẫu và vận chuyển.",
    'Product document request': "Ghi nguyên liệu, cấp và tài liệu cần dùng. Khi yêu cầu chứng nhận, ghi thị trường đích và phạm vi cần kiểm tra.",
    'Application / selection question': "Mô tả thực phẩm, quy trình và kết quả cần đạt. Bổ sung điều kiện thử hoặc chỉ tiêu cần đối chiếu."
  };
  const intentMap = { product: 'Product / quotation inquiry', sample: 'Sample availability question', documents: 'Product document request', application: 'Application / selection question', comparison: 'Application / selection question' };
  const hint = form.querySelector('[data-inquiry-hint]');
  const fields = [...form.querySelectorAll('[data-limit]')];
  const labels = { ingredient: 'Nguyên liệu hoặc chức năng', name: 'Họ và tên', email: 'Email', company: 'Công ty', market: 'Thị trường đích', application: 'Ứng dụng', goal: 'Chức năng cần đạt', volume: 'Khối lượng và thời điểm cần', specification: 'Cấp hoặc thông số kỹ thuật', documents: 'Tài liệu cần dùng', purpose: 'Mục đích', details: 'Thông tin khác', context: 'Trang tham chiếu' };
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
    form.elements.namedItem('context').value = `${reference.label} — https://www.ingredientcore.com/vi/${reference.path.slice(3)}`;
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
      if (field.required && !value) message = "Vui lòng điền trường này.";
      else if (value.length > Number(field.dataset.limit)) message = "Vui lòng rút gọn nội dung.";
      else if (field.name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "Nhập địa chỉ email hợp lệ.";
      else if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) || (field.tagName === 'INPUT' && /[\r\n\t]/.test(value))) message = "Xóa các ký tự không được hỗ trợ.";
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        const error = document.getElementById(`${field.id}-error`); error.textContent = message; error.hidden = false;
        first ||= field;
      }
    });
    if (first) {
      status.textContent = "Kiểm tra các trường được đánh dấu trước khi soạn yêu cầu.";
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
      const entry = form.elements.namedItem(name).value.trim();
      const value = name === 'context' && reference ? entry.split(' — ').at(-1) : entry;
      if (value) lines.push(`${labels[name]}: ${value}`);
    });
    const body = lines.join('\n\n');
    return { subject, body, text: `Người nhận: ${form.dataset.inquiryEmail}\nTiêu đề: ${subject}\n\n${body}` };
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
      showPreview(inquiry.text, "Yêu cầu quá dài để mở bằng liên kết email. Sao chép nội dung bên dưới vào email, kiểm tra và tự gửi.");
      return;
    }
    showPreview(inquiry.text, "Đã chuẩn bị bản nháp. Nếu ứng dụng email mở, hãy kiểm tra và tự gửi. Bạn cũng có thể sao chép nội dung bên dưới để gửi qua webmail.");
    const link = document.createElement('a'); link.href = url; link.hidden = true;
    form.append(link); link.click(); link.remove();
  });
  form.querySelector('[data-copy-inquiry]').addEventListener('click', async () => {
    clearOutput(); if (!validate()) return;
    const text = compose().text;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Không thể truy cập bảng tạm.");
      await navigator.clipboard.writeText(text);
      showPreview(text, "Đã sao chép. Dán vào email, kiểm tra và tự gửi yêu cầu.");
    } catch (_) {
      showPreview(text, "Văn bản bên dưới đã được chọn. Dùng lệnh sao chép của thiết bị, dán vào email, kiểm tra và tự gửi.");
    }
  });
  form.querySelectorAll('button[disabled]').forEach(button => { button.disabled = false; });
})();
