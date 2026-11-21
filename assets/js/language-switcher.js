(() => {
 if (window.location.protocol === 'file:') {
  const siteRoot = new URL('../../', document.currentScript.src);
  const resolveLocalLinks = () => {
   for (const link of document.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('//')) continue;

    let target = new URL(link.href);
    if (target.protocol !== 'file:') continue;
    if (href.startsWith('/') && !target.href.startsWith(siteRoot.href)) {
     target = new URL('.' + href, siteRoot);
    }
    if (!target.href.startsWith(siteRoot.href)) continue;

    if (target.pathname.endsWith('/')) target.pathname += 'index.html';
    link.href = target.href;
   }
  };

  resolveLocalLinks();
  // Other deferred scripts can populate inquiry return links after this script runs.
  document.addEventListener('DOMContentLoaded', resolveLocalLinks, { once: true });
 }

 const pickers = [...document.querySelectorAll('details.language-switcher')];
 pickers.forEach(picker => {
  const button = picker.querySelector('summary');
  picker.addEventListener('toggle', () => button.setAttribute('aria-expanded', String(picker.open)));
  picker.addEventListener('keydown', event => {
   if (event.key === 'Escape' && picker.open) { picker.open = false; button.focus(); event.preventDefault(); }
   if (event.key === 'ArrowDown' && event.target === button) { picker.open = true; picker.querySelector('a')?.focus(); event.preventDefault(); }
  });
 });
 document.addEventListener('keydown', event => { if (event.key === 'Escape') pickers.forEach(p => { if (p.open) { p.open = false; p.querySelector('summary').focus(); event.preventDefault(); } }); });
 document.addEventListener('click', event => pickers.forEach(p => { if (!p.contains(event.target)) p.open = false; }));
})();
