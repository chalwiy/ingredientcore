(() => {
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
