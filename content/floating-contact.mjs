import { brand } from './brand.mjs';
const icon = body => `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
export function floatingContact() {
 const whatsapp=icon('<path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.7A8.5 8.5 0 1 1 20.5 11.7Z"/><path d="M8.1 7.5c-.8.5-.7 2.3.6 4.2s3.8 3.5 5.3 3.4c1.1-.1 1.8-.8 1.8-1.4l-2.4-1.2-.9 1c-1.4-.6-2.5-1.6-3.1-2.9l.8-.9-1-2.3Z"/>');
 const email=icon('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>');
 const top=icon('<path d="m6 12 6-6 6 6M12 6v14M5 3h14"/>');
 return `<!-- floating-contact:start --><nav class="floating-contact" aria-label="Quick contact and page navigation"><a class="floating-contact__whatsapp" href="https://wa.me/${brand.phone.replace(/\D/g,'')}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp ${brand.phone} (opens in a new tab)" title="WhatsApp: ${brand.phone}">${whatsapp}<span>WhatsApp</span></a><a class="floating-contact__email" href="mailto:${brand.email}" aria-label="Email ${brand.email}" title="${brand.email}">${email}<span>Email</span></a><a class="floating-contact__top" href="#top" aria-label="Back to top" title="Back to top">${top}<span>Top</span></a></nav><!-- floating-contact:end -->`;
}
