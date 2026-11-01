document.documentElement?.classList.add('js');
const toggle = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');
if (toggle && menu) {
  const closeMenu = () => {
    const wasOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', "営業拠点");
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    return wasOpen;
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? "ナビゲーションを閉じる" : "営業拠点");
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (toggle.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') {
      if (closeMenu()) toggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1050) closeMenu();
  });
}

const year = document.querySelector('[data-year]');
if (year) year.textContent = String(new Date().getFullYear());

const productSearch = document.querySelector('[data-product-search]');
if (productSearch) {
  const cards = [...document.querySelectorAll('[data-product-card]')];
  const status = document.querySelector('[data-search-status]');
  const empty = document.querySelector('[data-search-empty]');
  const families = [...document.querySelectorAll('.catalog-family')];
  const clearSearch = document.querySelector('[data-search-clear]');
  const familyFilter = document.querySelector('[data-product-family]');
  if (familyFilter) familyFilter.disabled = false;
  productSearch.disabled = false;
  const normalizeSearch = value => String(value ?? '').toLowerCase().replace(/[-‐‑–—]/g,' ').replace(/[’]/g,"'").replace(/\s+/g,' ').trim();
  const updateSearch = () => {
    const query = normalizeSearch(productSearch.value);
    const family = familyFilter?.value || '';
    const tokens = query.split(' ').filter(Boolean);
    const exactFamily = query && cards.some(card => normalizeSearch(card.dataset.family) === query);
    const exactAbbreviation = query && cards.some(card => (!family || card.dataset.family === family) && normalizeSearch(card.dataset.abbreviation) === query);
    let visible = 0;
    cards.forEach(card => {
      const match = (!family || card.dataset.family === family) && (exactFamily ? normalizeSearch(card.dataset.family) === query : exactAbbreviation ? normalizeSearch(card.dataset.abbreviation) === query : tokens.every(token => normalizeSearch(card.dataset.search).includes(token)));
      card.hidden = !match;
      if (match) visible++;
    });
    families.forEach(family => {
      family.hidden = !family.querySelector('[data-product-card]:not([hidden])');
    });
    document.querySelectorAll('[data-catalog-group]').forEach(group => {
      group.hidden = !group.querySelector('[data-product-card]:not([hidden])');
    });
    if (status) status.textContent = `${visible} ingredient guide${visible === 1 ? '' : 's'} shown`;
    if (empty) empty.hidden = visible !== 0;
    if (clearSearch) clearSearch.hidden = !query && !family;
  };
  productSearch.addEventListener('input', updateSearch);
  familyFilter?.addEventListener('change', updateSearch);
  clearSearch?.addEventListener('click', () => {
    productSearch.value = '';
    if (familyFilter) familyFilter.value = '';
    updateSearch();
    productSearch.focus();
  });
  document.querySelectorAll('[data-catalog-category]').forEach(link => link.addEventListener('click', () => {
    productSearch.value = '';
    if (familyFilter) familyFilter.value = '';
    updateSearch();
  }));
  updateSearch();
}

// Carry public application context from a landing link into product inquiries.
// Public context is useful for a short URL; an abnormally large query is not.
const publicQuery = typeof window.location?.search === 'string' && window.location.search.length <= 4096 ? window.location.search : '';
const browsingParameters = new URLSearchParams(publicQuery);
for (const link of document.querySelectorAll?.('[data-context-inquiry]') || []) {
  const destination = new URL(link.getAttribute('href'), window.location.href);
  for (const key of ['application','goal']) {
    const value = browsingParameters.get(key);
    if (value && value.length <= 200 && !/[\u0000-\u001f\u007f]/.test(value) && !destination.searchParams.has(key)) destination.searchParams.set(key,value);
  }
  link.setAttribute('href',destination.pathname+destination.search+destination.hash);
}

const contactForm = document.querySelector('[data-contact-form]');
if (contactForm) {
  const inquiryEmail = contactForm.getAttribute?.('data-inquiry-email') || 'ingredientcore@bespringchem.com';
  const parameters = browsingParameters;
  for (const [name, limit] of [['ingredient',200],['application',200],['goal',200],['documents',1200],['purpose',500]]) {
    const requested = parameters.get(name);
    const field = contactForm.elements[name];
    if (field && !field.value && requested && requested.length <= limit && !/[\u0000-\u001f\u007f]/.test(requested)) field.value = requested;
  }
  const inquiryModes={product:'Product / quotation inquiry',documents:'Product document request',application:'Application / selection question',comparison:'Application / selection question',sample:'Sample availability question'};
  if (inquiryModes[parameters.get('intent')] && contactForm.elements.inquiry_type) contactForm.elements.inquiry_type.value = inquiryModes[parameters.get('intent')];
  const contextBox = document.querySelector('[data-contact-context]');
  const contextReturn = document.querySelector('[data-context-return]');
  try {
    const routes=JSON.parse(contactForm.getAttribute?.('data-return-map') || '{}');
    const key=parameters.get('from');
    if (key && Object.hasOwn(routes,key) && contactForm.elements.context && contextBox && contextReturn) {
      const route=routes[key];
      contactForm.elements.context.value=route.label;
      contextReturn.setAttribute('href',route.path);
      contextReturn.textContent='Review '+route.label+"(新しいタブ)";
      contextBox.hidden=false;
    }
  } catch { /* Generic static browsing links remain available. */ }
  const submitButton = contactForm.querySelector('[type="submit"]');
  submitButton.disabled = false;
  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.className = 'button button--copy';
  copyButton.textContent = "メールでのお問い合わせ";
  const status = document.createElement('p');
  status.className = 'contact-form__status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  const preview = document.createElement('textarea');
  preview.className = 'contact-form__preview';
  preview.setAttribute('aria-label', "手動でコピーするお問い合わせテキスト");
  preview.readOnly = true;
  preview.hidden = true;
  submitButton.insertAdjacentElement('afterend', copyButton);
  copyButton.insertAdjacentElement('afterend', status);
  status.insertAdjacentElement('afterend', preview);
  const errorNodes = new Map();
  const labels = {name:"お名前(必須)",email:"業務用メール",ingredient:"原料かターゲット機能",company:'Company',market:"目的地の市場",application:"食品用途",goal:"ターゲット機能",volume:"推定ボリュームとタイミング",specification:"ターゲット等級か指定",documents:"審査書類",purpose:"文書の要求の目的",details:"プロセス、包装または配達質問"};
  const required = new Set(['name','email','ingredient']);
  for (const [name, label] of Object.entries(labels)) {
    const field = contactForm.elements[name];
    if (!field) continue;
    const error = document.createElement('span');
    error.className = 'contact-form__error';
    error.hidden = true;
    error.id = `inquiry-${name}-error`;
    const describedBy = field.getAttribute?.('aria-describedby');
    field.setAttribute?.('aria-describedby', [describedBy,error.id].filter(Boolean).join(' '));
    field.insertAdjacentElement?.('afterend', error);
    errorNodes.set(name, error);
    field.addEventListener?.('input', () => {
      error.hidden = true;
      field.removeAttribute?.('aria-invalid');
      status.textContent = '';
      preview.hidden = true;
    });
  }
  contactForm.addEventListener('input', () => {
    status.textContent = '';
    preview.hidden = true;
  });
  const read = name => String(contactForm.elements[name]?.value ?? '').trim();
  const validate = () => {
    let firstInvalid;
    for (const [name, label] of Object.entries(labels)) {
      const field = contactForm.elements[name];
      const error = errorNodes.get(name);
      if (!field || !error) continue;
      let message = required.has(name) && !read(name) ? `Enter ${label.toLowerCase()}.` : '';
      if (name === 'email' && !message && (field.validity?.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(read(name)))) message = "name@example.com のような有効なメールアドレスを入力してください。";
      const limit = Number(field.getAttribute?.('data-limit') || 0);
      if (!message && limit && field.value.length > limit) message = `${label} is too long. Use ${limit} characters or fewer.`;
      error.textContent = message;
      error.hidden = !message;
      if (message) {
        field.setAttribute?.('aria-invalid', 'true');
        firstInvalid ||= field;
      } else field.removeAttribute?.('aria-invalid');
    }
    if (firstInvalid) {
      status.textContent = "マークされたフィールドを確認してください。エントリはここにあります。";
      firstInvalid.focus?.();
      return false;
    }
    return true;
  };
  const composeInquiry = () => {
    if (!validate()) return;
    const fields = new FormData(contactForm);
    const subjectTopic = read('ingredient').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').slice(0, 120);
    const subjectMode = (read('inquiry_type') || "製品に関するお問い合わせ").replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').slice(0, 80);
    const subject = `IngredientCore ${subjectMode}: ${subjectTopic}`;
    const entries = [
      ["問い合わせの種類",'inquiry_type'],['Name','name'],["業務用メール",'email'],
      ['Company','company'],["原料かターゲット機能",'ingredient'],
      ["食品用途",'application'],["ターゲット機能",'goal'],
      ["ターゲット等級か指定",'specification'],["推定ボリュームとタイミング",'volume'],
      ["目的地の市場",'market'],["必要書類",'documents'],
      ["文書の要求の目的",'purpose'],["その他のプロセスや出荷の詳細",'details'],
      ["参照ページ",'context']
    ];
    const body = entries.map(([label,name]) => [label, String(fields.get(name) ?? '').trim()])
      .filter(([,value]) => value).map(([label,value]) => `${label}: ${value}`).join('\r\n');
    return { subject, body };
  };
  const fullText = inquiry => `To: ${inquiryEmail}\nSubject: ${inquiry.subject}\n\n${inquiry.body}`;
  const showManual = (inquiry, message) => {
    preview.value = fullText(inquiry);
    preview.hidden = false;
    status.textContent = message;
    preview.focus();
    preview.select();
  };
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    const inquiry = composeInquiry();
    if (!inquiry) return;
    const url = `mailto:${inquiryEmail}?subject=${encodeURIComponent(inquiry.subject)}&body=${encodeURIComponent(inquiry.body)}`;
    if (url.length > 1800) {
      showManual(inquiry, "信頼できるメールリンクについては、この問い合わせはあまりにも長くなります。 下記の完全なテキストをメールやメールにコピーして、それを自分で送信してください。");
      return;
    }
    status.textContent = "フォームからメールアプリをコピーして、メールをコピーして、確認して送信してください。 何も開かない場合は、Webメールのコピー問い合わせを使用してください。";
    window.location.href = url;
  });
  copyButton.addEventListener('click', async () => {
    const inquiry = composeInquiry();
    if (!inquiry) return;
    const text = fullText(inquiry);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("クリップボードは使用できません");
      await navigator.clipboard.writeText(text);
      preview.hidden = true;
      status.textContent = `Inquiry copied. Paste it into your email or webmail and send it to ${inquiryEmail}.`;
    } catch {
      showManual(inquiry, `Copy the selected text below and send it to ${inquiryEmail}.`);
    }
  });
}
