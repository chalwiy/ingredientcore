(() => {
  const search = document.querySelector('[data-catalog-search]');
  const filter = document.querySelector('[data-catalog-filter]');
  if (!search || !filter) return;
  const cards = [...document.querySelectorAll('[data-product-card]')];
  const status = document.querySelector('[data-catalog-status]');
  const empty = document.querySelector('[data-catalog-empty]');
  const reset = document.querySelector('[data-catalog-reset]');
  const normalize = value => String(value).normalize('NFKC').toLowerCase().replace(/[-‐‑–—]/g, ' ').replace(/’/g, "'").replace(/\s+/g, ' ').trim();
  const matchesFamily = card => !filter.value || card.dataset.core === filter.value || card.dataset.family === filter.value;
  function update() {
    const query = normalize(search.value);
    const tokens = query.split(' ').filter(Boolean);
    const exactMatch = query && [
      card => normalize(card.dataset.abbreviation) === query,
      card => /^[가-힣]{5,}$/.test(query) && normalize(card.dataset.search).split(' ').includes(query),
    ].find(matches => cards.some(card => matchesFamily(card) && matches(card)));
    let core = 0, guides = 0;
    cards.forEach(card => {
      const match = matchesFamily(card) && (!query || (exactMatch
        ? exactMatch(card)
        : tokens.every(token => normalize(card.dataset.search + ' ' + card.textContent).includes(token))));
      card.hidden = !match;
      if (match) card.dataset.core === 'guides' ? guides++ : core++;
    });
    document.querySelectorAll('[data-catalog-section]').forEach(section => {
      section.hidden = !section.querySelector('[data-product-card]:not([hidden])');
    });
    document.querySelectorAll('[data-catalog-count]').forEach(count => {
      const total = count.closest('[data-catalog-section]').querySelectorAll('[data-product-card]:not([hidden])').length;
      count.textContent = total + "건";
    });
    const category = filter.selectedOptions[0].textContent;
    status.textContent = [filter.value ? category : "", "총 " + (core + guides) + "건(주요 제품 " + core + "건, 선정 가이드 " + guides + "건)"].filter(Boolean).join(": ");
    empty.hidden = core + guides !== 0;
    reset.hidden = !query && !filter.value;
  }
  function clear() { search.value = ''; filter.value = ''; update(); }
  search.disabled = false;
  filter.disabled = false;
  search.addEventListener('input', update);
  filter.addEventListener('change', update);
  reset.addEventListener('click', () => { clear(); search.focus(); });
  document.querySelector('[data-catalog-empty-reset]').addEventListener('click', () => { clear(); search.focus(); });
  document.querySelectorAll('[data-catalog-jump]').forEach(link => link.addEventListener('click', () => {
    clear();
    const target = document.getElementById(link.hash.slice(1));
    if (target) target.focus({ preventScroll: true });
  }));
  update();
})();
