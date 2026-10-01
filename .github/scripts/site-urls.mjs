export const ORIGIN = 'https://www.ingredientcore.com/';
export const KEY = '7b987908745143be9c03ef14fe4cb3de';
export function publicPath(p) {
  return p.endsWith('.html') && !p.split('/').some(x => x.startsWith('.') || ['docs','content','internal-tools','建站过程','tests','test','tmp','node_modules'].includes(x))
    && !/(^|\/)404\.html$/i.test(p) && !/(^|\/)google[^/]*\.html$/i.test(p);
}
export function noindex(html) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)].some(([tag]) =>
    /\bname\s*=\s*["'](?:robots|googlebot|bingbot)["']/i.test(tag) && /\bcontent\s*=\s*["'][^"']*\bnoindex\b/i.test(tag));
}
export function pageURL(p) { return new URL(p, ORIGIN).href; }
