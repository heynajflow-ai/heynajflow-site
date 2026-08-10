import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, '..');
const blogRoot = path.join(site, 'blog');

// These are topic-specific further-reading links. They are deliberately kept
// separate from the article copy so the visible Sources block stays honest and
// the right-hand article navigation can point to it.
const sources = {
  'after-hours-lead-capture-chatbot': [
    ['Zendesk', 'What is a chatbot? Benefits and use cases', 'https://www.zendesk.com/blog/ai/chatbots/what-is-a-chatbot/benefits-of-chatbots/'],
    ['IBM', 'Unlocking the power of chatbots: key benefits for businesses and customers', 'https://www.ibm.com/think/insights/unlocking-the-power-of-chatbots-key-benefits-for-businesses-and-customers']
  ],
  'advanced-chatbot-features-customer-loyalty': [
    ['Salesforce', 'AI for customer service', 'https://www.salesforce.com/service/ai/customer-service-ai/'],
    ['HubSpot', 'Service Hub', 'https://www.hubspot.com/products/service']
  ],
  'how-advanced-chatbot-features-build-unshakeable-customer-loyalty': [
    ['Salesforce', 'AI for customer service', 'https://www.salesforce.com/service/ai/customer-service-ai/'],
    ['Zendesk', 'Benefits of chatbots', 'https://www.zendesk.com/blog/ai/chatbots/what-is-a-chatbot/benefits-of-chatbots/']
  ],
  'how-chatbots-elevate-customer-experience': [
    ['IBM', 'Unlocking the power of chatbots for businesses and customers', 'https://www.ibm.com/think/insights/unlocking-the-power-of-chatbots-key-benefits-for-businesses-and-customers'],
    ['Salesforce', 'AI for customer service', 'https://www.salesforce.com/service/ai/customer-service-ai/']
  ],
  'how-chatbots-elevate-customer-experience-modern-approach': [
    ['Zendesk', 'Benefits of chatbots', 'https://www.zendesk.com/blog/ai/chatbots/what-is-a-chatbot/benefits-of-chatbots/'],
    ['HubSpot', 'Service Hub', 'https://www.hubspot.com/products/service']
  ],
  '24-7-chatbot-support-uninterrupted-customer-service': [
    ['Zendesk', 'Benefits of chatbots', 'https://www.zendesk.com/blog/ai/chatbots/what-is-a-chatbot/benefits-of-chatbots/'],
    ['IBM', 'Chatbot benefits for businesses and customers', 'https://www.ibm.com/think/insights/unlocking-the-power-of-chatbots-key-benefits-for-businesses-and-customers']
  ],
  'chatbot-cost-savings-customer-support': [
    ['Salesforce', 'AI for customer service', 'https://www.salesforce.com/service/ai/customer-service-ai/'],
    ['HubSpot', 'Service Hub', 'https://www.hubspot.com/products/service']
  ],
  'ai-chatbot-personalization-customer-experience': [
    ['Salesforce', 'AI for customer service', 'https://www.salesforce.com/service/ai/customer-service-ai/'],
    ['Shopify', 'AI chatbots for customer support', 'https://www.shopify.com/blog/ai-chatbot']
  ],
  'ultimate-guide-24-7-chatbot-support-customer-expectations': [
    ['Zendesk', 'Benefits of chatbots', 'https://www.zendesk.com/blog/ai/chatbots/what-is-a-chatbot/benefits-of-chatbots/'],
    ['IBM', 'Chatbot benefits for businesses and customers', 'https://www.ibm.com/think/insights/unlocking-the-power-of-chatbots-key-benefits-for-businesses-and-customers']
  ],
  'always-there-for-you-chatbot-customer-support-benefits': [
    ['IBM', 'Chatbot benefits for businesses and customers', 'https://www.ibm.com/think/insights/unlocking-the-power-of-chatbots-key-benefits-for-businesses-and-customers'],
    ['Zendesk', 'Benefits of chatbots', 'https://www.zendesk.com/blog/ai/chatbots/what-is-a-chatbot/benefits-of-chatbots/']
  ],
  'calculating-chatbot-roi-customer-service': [
    ['Salesforce', 'AI for customer service', 'https://www.salesforce.com/service/ai/customer-service-ai/'],
    ['HubSpot', 'Customer service software and guidance', 'https://www.hubspot.com/products/service/customer-service']
  ],
  'ai-chatbot-benefits-for-customers': [
    ['IBM', 'Chatbot benefits for businesses and customers', 'https://www.ibm.com/think/insights/unlocking-the-power-of-chatbots-key-benefits-for-businesses-and-customers'],
    ['Zendesk', 'Benefits of chatbots', 'https://www.zendesk.com/blog/ai/chatbots/what-is-a-chatbot/benefits-of-chatbots/']
  ],
  'heynaj-conversational-ux-chatbot-effectiveness': [
    ['Salesforce', 'AI for customer service', 'https://www.salesforce.com/service/ai/customer-service-ai/'],
    ['Shopify', 'AI chatbots for customer support', 'https://www.shopify.com/blog/ai-chatbot']
  ],
  'choosing-your-ai-assistant-heynaj-vs-chatbot-com-feature-comparison': [
    ['ChatBot.com', 'Pricing', 'https://www.chatbot.com/pricing/?billing=monthly'],
    ['Crisp', 'Pricing', 'https://crisp.chat/en/pricing/'],
    ['HubSpot', 'Customer service software', 'https://www.hubspot.com/products/service/customer-service']
  ]
};

const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const makeSources = slug => {
  const rows = (sources[slug] || []).map(([name, title, url]) => `<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(name)} - ${esc(title)}</a><p>Used for context and further reading related to this article.</p></li>`).join('');
  return `
          <section id="sources" class="references-section mt-10 p-6 md:p-8" aria-labelledby="sources-heading">
            <p class="text-xs font-extrabold uppercase tracking-[.16em] text-slate-500">Sources</p>
            <h2 id="sources-heading" class="mt-3 text-2xl font-extrabold tracking-tight">References</h2>
            <ul class="source-list mt-4 space-y-4">${rows}</ul>
          </section>`;
};

for (const entry of fs.readdirSync(blogRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const slug = entry.name;
  const file = path.join(blogRoot, slug, 'index.html');
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('id="sources"')) continue;

  html = html.replace(/â†/g, '&larr;').replace(/â†’/g, '&rarr;').replace(/â€™/g, "'").replace(/â€œ|â€/g, '"');
  const marker = /\n\s*<\/div>\n\s*\n\s*<aside class="toc surface p-5"/;
  if (!marker.test(html)) throw new Error(`Could not locate article column boundary in ${slug}`);
  html = html.replace(marker, `${makeSources(slug)}\n        </div>\n\n        <aside class="toc surface p-5"`);
  html = html.replace(/<a href="#faq-heading">Common questions<\/a>(\s*<\/nav>)/g, '<a href="#faq-heading">Common questions</a><a href="#sources-heading">Sources</a>$1');
  fs.writeFileSync(file, html);
  console.log(`Restored sources and TOC link: ${slug}`);
}
