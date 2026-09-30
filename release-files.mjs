import { products } from './content/products.mjs';
import { articles } from './content/articles.mjs';

// The only files permitted in a GitHub Pages artifact. Keep this list explicit:
// source modules, reviews and original business records must never be copied.
export const publicFiles = [
  'index.html', '404.html', '.nojekyll',
  ...['products', 'applications', 'knowledge', 'quality', 'about', 'contact', 'privacy'].map(name => `${name}/index.html`),
  ...products.map(product => `products/${product.slug}.html`),
  ...articles.map(article => `knowledge/${article.slug}.html`),
  'assets/css/style.css', 'assets/css/pages.css', 'assets/js/site.js',
  'assets/img/logo.svg', 'assets/img/mark.svg', 'assets/img/hero-bakery.jpg', 'assets/img/seafood.jpg'
];
