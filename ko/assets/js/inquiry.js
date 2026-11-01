(() => {
  "사용 엄격한";
  const form = document.querySelector('[data-inquiry-form]');
  if (!form) return;
  const status = form.querySelector('[data-inquiry-status]');
  const previewBox = form.querySelector('[data-inquiry-preview-box]');
  const preview = form.querySelector('[data-inquiry-preview]');
  const extra = form.querySelector('[data-inquiry-extra]');
  const type = form.elements.namedItem('inquiry_type');
  const hints = {
    'Product / quotation inquiry': "인용을 위해, 급료 또는 표적 명세를 추가하십시오, 알려진 경우에 추정된 양 및 목적지 시장.",
    'Sample availability question': "무료 샘플은 사용할 수 있습니다. 제품 또는 등급, 시험 목적 및 목적지를 추가하십시오. 판매는 양과 선박 배열을 토론할 것입니다.",
    'Product document request': "제품 또는 등급 및 레코드를 입력하면 필요한 것입니다. 인증서의 경우, 해당 가격표 및 리뷰의 목적이 있습니다.",
    'Application / selection question': "식품, 프로세스 및 대상 기능을 설명합니다. 관련 시험 조건 또는 사양 요구 사항을 추가하십시오."
  };
  const intentMap = { product: 'Product / quotation inquiry', sample: 'Sample availability question', documents: 'Product document request', application: 'Application / selection question', comparison: 'Application / selection question' };
  const hint = form.querySelector('[data-inquiry-hint]');
  const fields = [...form.querySelectorAll('[data-limit]')];
  const labels = { ingredient: "제품 또는 대상 기능", name: 'Name', email: "기업정보", company: 'Company', market: "여행상품", application: "식품 신청", goal: "Target 기능", volume: "견적 수량 및 타이밍", specification: "대상 등급 또는 사양", documents: "문서 또는 인증서 필요", purpose: "리뷰 및 샘플 평가의 목적", details: "기타 질문", context: "관련사이트" };
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
      if (field.required && !value) message = "이 필드를 체크하십시오.";
      else if (value.length > Number(field.dataset.limit)) message = "이 값은 너무 길다.";
      else if (field.name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "name@company.com과 같은 유효한 이메일 주소를 입력하세요.";
      else if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) || (field.tagName === 'INPUT' && /[\r\n\t]/.test(value))) message = "지원되지 않은 컨트롤 문자를 제거하십시오.";
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        const error = document.getElementById(`${field.id}-error`); error.textContent = message; error.hidden = false;
        first ||= field;
      }
    });
    if (first) {
      status.textContent = "문의를 준비하기 전에 강조 된 필드를 확인하십시오.";
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
      showPreview(inquiry.text, "이 조회는 믿을 수 있는 이메일 연결을 위해 너무 길습니다. 당신의 이메일 앱으로 아래의 완전한 원본을 복사하고 그것을 직접 보내십시오.");
      return;
    }
    showPreview(inquiry.text, "이메일 초안 준비. 메일 앱이 열 수 있습니다. 리뷰 및 보내주세요. 이 웹 사이트를 통해 제출 된 것은 없습니다. 아래 텍스트를 복사 할 수도 있습니다.");
    const link = document.createElement('a'); link.href = url; link.hidden = true;
    form.append(link); link.click(); link.remove();
  });
  form.querySelector('[data-copy-inquiry]').addEventListener('click', async () => {
    clearOutput(); if (!validate()) return;
    const text = compose().text;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("클립보드 사용 불가");
      await navigator.clipboard.writeText(text);
      showPreview(text, "문의는 복사. 이메일 앱으로 붙여넣기, 검토하고 직접 보내. 이 웹 사이트를 통해 제출되지 않았습니다.");
    } catch (_) {
      showPreview(text, "자동 복사는 사용할 수 없습니다. 전체 문의는 아래에서 선택됩니다. 장치의 복사 명령을 사용하여 이메일 앱에 붙여넣고 직접 보내주세요.");
    }
  });
  form.querySelectorAll('button[disabled]').forEach(button => { button.disabled = false; });
})();
