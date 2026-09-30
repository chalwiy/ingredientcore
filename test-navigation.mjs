import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const callbacks = new Map();
const attrs = new Map([['aria-expanded', 'false']]);
const classes = new Set();
const bodyClasses = new Set();
const document = {
  activeElement: null,
  body: { classList: { add: name => bodyClasses.add(name), remove: name => bodyClasses.delete(name), toggle: (name, on) => on ? bodyClasses.add(name) : bodyClasses.delete(name) } },
  addEventListener: (name, fn) => callbacks.set(name, fn),
  querySelector: selector => selector === '[data-menu-toggle]' ? toggle : selector === '[data-menu]' ? menu : null
};
const focusable = () => { const node = { focus: () => { document.activeElement = node; } }; return node; };
const links = [focusable(), focusable(), focusable()];
const toggle = {
  setAttribute: (name, value) => attrs.set(name, value),
  getAttribute: name => attrs.get(name),
  addEventListener: (name, fn) => callbacks.set(`toggle:${name}`, fn),
  contains: target => target === toggle,
  focus: () => { document.activeElement = toggle; }
};
const menu = {
  classList: { add: name => classes.add(name), remove: name => classes.delete(name), toggle: (name, on) => on ? classes.add(name) : classes.delete(name) },
  querySelectorAll: selector => selector === 'a' ? links : [],
  contains: target => links.includes(target)
};
for (const [index, link] of links.entries()) link.addEventListener = (name, fn) => callbacks.set(`link:${index}:${name}`, fn);
const window = { innerWidth: 390, addEventListener: (name, fn) => callbacks.set(`window:${name}`, fn) };
const code = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'assets/js/site.js'), 'utf8');
vm.runInNewContext(code, { document, window, URLSearchParams, URL });

callbacks.get('toggle:click')();
assert.equal(attrs.get('aria-expanded'), 'true');
assert.equal(classes.has('is-open'), true);
assert.equal(bodyClasses.has('menu-open'), true);

toggle.focus();
// This is an ordinary expanded navigation, not a modal focus trap.
let prevented = false;
callbacks.get('keydown')({ key: 'Tab', shiftKey: false, preventDefault: () => { prevented = true; } });
assert.equal(prevented, false);
assert.equal(document.activeElement, toggle);

callbacks.get('keydown')({ key: 'Escape' });
assert.equal(attrs.get('aria-expanded'), 'false');
assert.equal(bodyClasses.has('menu-open'), false);
assert.equal(document.activeElement, toggle);

callbacks.get('toggle:click')();
window.innerWidth = 1200;
callbacks.get('window:resize')();
assert.equal(attrs.get('aria-expanded'), 'false');
assert.equal(bodyClasses.has('menu-open'), false);
console.log('Navigation checks passed: open, natural Tab order, Escape focus return and desktop resize.');
