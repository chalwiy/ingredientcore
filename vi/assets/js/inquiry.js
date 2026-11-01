(() => {
  "sử dụng nghiêm ngặt";
  const form = document.querySelector('[data-inquiry-form]');
  if (!form) return;
  const status = form.querySelector('[data-inquiry-status]');
  const previewBox = form.querySelector('[data-inquiry-preview-box]');
  const preview = form.querySelector('[data-inquiry-preview]');
  const extra = form.querySelector('[data-inquiry-extra]');
  const type = form.elements.namedItem('inquiry_type');
  const hints = {
    'Product / quotation inquiry': "Để trích dẫn, hãy thêm vào chi tiết về mức độ hoặc mục tiêu, ước tính số lượng và điểm đến, nếu biết.",
    'Sample availability question': "Các mẫu tự do có sẵn.",
    'Product document request': "Hãy nêu tên sản phẩm hay điểm số và các hồ sơ cần thiết. Đối với chứng nhận, bao gồm cả thị trường đích và mục đích của việc xem xét.",
    'Application / selection question': "Mô tả thức ăn, quá trình và chức năng đích. Thêm điều kiện thử thích hợp hoặc yêu cầu cụ thể."
  };
  const intentMap = { product: 'Product / quotation inquiry', sample: 'Sample availability question', documents: 'Product document request', application: 'Application / selection question', comparison: 'Application / selection question' };
  const hint = form.querySelector('[data-inquiry-hint]');
  const fields = [...form.querySelectorAll('[data-limit]')];
  const labels = { ingredient: "Chức năng sản xuất hay nhắm mục tiêu", name: 'Name', email: "Email doanh nghiệp", company: 'Company', market: "Thị trường đích", application: "Ứng dụng thực phẩm", goal: "Chức năng đích", volume: "Tính toán số lượng và thời gian", specification: "Điểm ảnh hay đặc điểm cụ thể", documents: "Cần có tài liệu hay chứng nhận", purpose: "Mục đích của việc xem lại hay thử nghiệm mẫu", details: "Những câu hỏi khác", context: "Trang tham khảo" };
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
      if (field.required && !value) message = "Kiểm tra cánh đồng này.";
      else if (value.length > Number(field.dataset.limit)) message = "Giá trị này là quá dài.";
      else if (field.name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "Nhập địa chỉ email hợp lệ, ví dụ name@company.com.";
      else if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) || (field.tagName === 'INPUT' && /[\r\n\t]/.test(value))) message = "Gỡ bỏ ký tự điều khiển không được hỗ trợ.";
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        const error = document.getElementById(`${field.id}-error`); error.textContent = message; error.hidden = false;
        first ||= field;
      }
    });
    if (first) {
      status.textContent = "Kiểm tra các lĩnh vực được tô sáng trước khi chuẩn bị điều tra.";
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
      showPreview(inquiry.text, "Cuộc điều tra này quá dài cho một liên kết email đáng tin cậy. Sao chép đoạn văn bản bên dưới vào ứng dụng email của bạn và gửi nó cho chính bạn.");
      return;
    }
    showPreview(inquiry.text, "Bản nháp thư đã chuẩn bị. Ứng dụng thư có thể mở; xem lại và gửi nó đến đó. Không có gì được gửi qua trang Mạng này. Bạn cũng có thể sao chép văn bản bên dưới.");
    const link = document.createElement('a'); link.href = url; link.hidden = true;
    form.append(link); link.click(); link.remove();
  });
  form.querySelector('[data-copy-inquiry]').addEventListener('click', async () => {
    clearOutput(); if (!validate()) return;
    const text = compose().text;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Bảng tạm không sẵn sàng");
      await navigator.clipboard.writeText(text);
      showPreview(text, "Cần được sao chép. hãy dán nó vào ứng dụng email của bạn, xem lại và gửi nó cho chính mình.");
    } catch (_) {
      showPreview(text, "Không thể sao chép tự động. Cuộc điều tra hoàn chỉnh được chọn bên dưới. Hãy dùng lệnh sao chép của thiết bị, rồi dán vào ứng dụng email và gửi cho nó.");
    }
  });
  form.querySelectorAll('button[disabled]').forEach(button => { button.disabled = false; });
})();
