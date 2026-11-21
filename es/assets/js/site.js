document.documentElement?.classList.add('js');
const toggle = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');
if (toggle && menu) {
  const closeMenu = () => {
    const wasOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', "Abrir el menú");
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    return wasOpen;
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? "Cerrar el menú" : "Abrir el menú");
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
