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
    'Product / quotation inquiry': "견적 문의 시 희망 등급 또는 규격, 예상 수량과 납품 목적지를 알려 주세요.",
    'Sample availability question': "무료 샘플을 요청하실 때는 품목과 등급, 시험 목적과 배송지를 알려 주세요. 수량과 배송 조건은 영업팀이 확인합니다.",
    'Product document request': "품목 또는 등급과 필요한 자료를 알려 주세요. 인증서를 요청하실 때는 판매 예정 국가·지역과 사용 목적도 기재해 주세요.",
    'Application / selection question': "식품 유형, 공정과 목표 기능을 알려 주세요. 정해진 시험 조건이나 희망 규격이 있다면 함께 기재해 주세요."
  };
  const intentMap = { product: 'Product / quotation inquiry', sample: 'Sample availability question', documents: 'Product document request', application: 'Application / selection question', comparison: 'Application / selection question' };
  const hint = form.querySelector('[data-inquiry-hint]');
  const fields = [...form.querySelectorAll('[data-limit]')];
  const labels = { ingredient: '품목명 또는 목표 기능', name: '이름', email: '회사 이메일', company: '회사명', market: '판매 예정 국가·지역', application: '식품 용도', goal: '목표 기능', volume: '예상 수량 및 희망 시점', specification: '희망 등급 또는 규격', documents: '필요한 문서 또는 인증서', purpose: '자료 심사 또는 샘플 시험 목적', details: '기타 문의', context: '참조 페이지' };
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
    form.elements.namedItem('context').value = `${reference.label} — https://www.ingredientcore.com/ko/${reference.path.slice(3)}`;
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
      if (field.required && !value) message = "이 항목을 입력해 주세요.";
      else if (value.length > Number(field.dataset.limit)) message = "입력 내용이 글자 수 제한을 초과했습니다.";
      else if (field.name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "유효한 회사 이메일 주소를 입력해 주세요.";
      else if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) || (field.tagName === 'INPUT' && /[\r\n\t]/.test(value))) message = "입력란에서 사용할 수 없는 문자를 삭제해 주세요.";
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        const error = document.getElementById(`${field.id}-error`); error.textContent = message; error.hidden = false;
        first ||= field;
      }
    });
    if (first) {
      status.textContent = "표시된 입력 항목을 확인해 주세요.";
      if (first.closest('details')) extra.open = true;
      first.focus(); return false;
    }
    return true;
  };
  const compose = () => {
    const title = type.selectedOptions[0].textContent.trim();
    const ingredient = form.elements.namedItem('ingredient').value.trim();
    const subject = `IngredientCore | ${title} | ${ingredient}`.replace(/[\r\n\t]/g, ' ');
    const lines = [`문의 유형: ${title}`];
    Object.keys(labels).forEach(name => {
      const value = form.elements.namedItem(name).value.trim();
      if (value) lines.push(`${labels[name]}: ${value}`);
    });
    const body = lines.join('\n\n');
    return { subject, body, text: `받는 사람: ${form.dataset.inquiryEmail}\n제목: ${subject}\n\n${body}` };
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
      showPreview(inquiry.text, "문의가 길어 전문을 표시했습니다. 복사한 내용을 새 메일에 붙여 넣고 직접 보내 주세요.");
      return;
    }
    showPreview(inquiry.text, "이메일 초안을 준비했습니다. 메일 앱에서 내용을 확인한 뒤 직접 보내 주세요. 아래 문의 내용을 복사해 보내실 수도 있습니다.");
    const link = document.createElement('a'); link.href = url; link.hidden = true;
    form.append(link); link.click(); link.remove();
  });
  form.querySelector('[data-copy-inquiry]').addEventListener('click', async () => {
    clearOutput(); if (!validate()) return;
    const text = compose().text;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("클립보드를 이용할 수 없습니다");
      await navigator.clipboard.writeText(text);
      showPreview(text, "문의 내용을 복사했습니다. 새 메일에 붙여 넣고 내용을 확인한 뒤 직접 보내 주세요.");
    } catch (_) {
      showPreview(text, "자동 복사를 이용할 수 없습니다. 아래에 선택된 문의 내용을 수동으로 복사해 새 메일에 붙여 넣고 직접 보내 주세요.");
    }
  });
  form.querySelectorAll('button[disabled]').forEach(button => { button.disabled = false; });
})();
