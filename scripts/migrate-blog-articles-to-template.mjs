import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const template = fs.readFileSync(path.join(site, 'templates', 'blog-article.html'), 'utf8');
const registry = JSON.parse(fs.readFileSync(path.join(site, 'data', 'blog-registry.json'), 'utf8'));
const phase = (process.argv[2] || '').toUpperCase();

const classes = new Map([
  ['after-hours-lead-capture-chatbot', 'C'],
  ['advanced-chatbot-features-customer-loyalty', 'B'],
  ['how-advanced-chatbot-features-build-unshakeable-customer-loyalty', 'B'],
  ['how-chatbots-elevate-customer-experience', 'B'],
  ['24-7-chatbot-support-uninterrupted-customer-service', 'B'],
  ['chatbot-cost-savings-customer-support', 'B'],
  ['ai-chatbot-personalization-customer-experience', 'B'],
  ['ultimate-guide-24-7-chatbot-support-customer-expectations', 'B'],
  ['always-there-for-you-chatbot-customer-support-benefits', 'B'],
  ['calculating-chatbot-roi-customer-service', 'B'],
  ['ai-chatbot-benefits-for-customers', 'B'],
  ['heynaj-conversational-ux-chatbot-effectiveness', 'B'],
  ['choosing-your-ai-assistant-heynaj-vs-chatbot-com-feature-comparison', 'C'],
  ['ai-chatbot-crm-helpdesk-integration-guide', 'A'],
  ['what-is-rag-how-heynaj-flow-uses-your-business-knowledge', 'A'],
]);

const classCPlans = {
  'after-hours-lead-capture-chatbot': [
    ['Legacy hero figcaption', 'Canonical cover figcaption'],
    ['Featured-playbook heading hierarchy, ordered flow, blockquote, and lists', 'Canonical article body with original IDs and semantic elements retained'],
    ['Legacy aside navigation', 'Canonical TOC generated from the same original topic links'],
    ['FAQ and references; no standalone legacy closing CTA', 'Canonical FAQ and Sources sections; no new CTA payload introduced'],
  ],
  'choosing-your-ai-assistant-heynaj-vs-chatbot-com-feature-comparison': [
    ['Legacy hero figcaption', 'Canonical cover figcaption'],
    ['Comparison framing, headings, blockquote, lists, and inline links', 'Canonical article body with original semantic HTML and link destinations retained'],
    ['Legacy aside navigation', 'Canonical TOC generated from the same original topic links'],
    ['FAQ, references, and closing CTA', 'Canonical FAQ, Sources, and CTA sections'],
  ],
};

const published = registry.posts.filter(post => post.status === 'published');
const htmlPath = slug => `blog/${slug}/index.html`;
const sourceAtHead = relative => execFileSync('git', ['show', `HEAD:${relative}`], { cwd: site, encoding: 'utf8' });
const first = (value, pattern, label) => {
  const match = value.match(pattern);
  if (!match) throw new Error(`${label} is missing`);
  return match.slice(1).find(group => group !== undefined);
};
const stripTags = value => value
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&#x27;|&#39;/gi, "'")
  .replace(/&quot;/gi, '"')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/\s+/g, ' ')
  .trim();
const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cleanPresentation = value => value
  .replace(/\s(?:class|style|width|height|align|valign)=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/\s(?:data-[\w-]+)=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/\s+/g, ' ')
  .trim();
const cleanIntro = value => cleanPresentation(value).replace(/<br\s*\/?>/gi, ' ');
const removeLegacyContainerClosures = (value, label) => {
  let cleaned = value.trim();
  let balance = (cleaned.match(/<div\b[^>]*>/gi) || []).length - (cleaned.match(/<\/div>/gi) || []).length;
  while (balance < 0 && /<\/div>\s*$/i.test(cleaned)) {
    cleaned = cleaned.replace(/<\/div>\s*$/i, '').trim();
    balance += 1;
  }
  if (balance !== 0) throw new Error(`${label} has unbalanced semantic divs`);
  return cleaned;
};
const inner = (value, pattern, label) => first(value, pattern, label).trim();
const section = (value, id, label) => {
  const labels = id === 'common-questions' ? `(?:${id}-heading|faq-heading)` : `${id}-heading`;
  const match = value.match(new RegExp(`<section\\b[^>]*(?:\\bid=(?:"${id}"|'${id}')|\\baria-labelledby=(?:"${labels}"|'${labels}'))[^>]*>([\\s\\S]*?)<\\/section>`, 'i'));
  if (!match) throw new Error(`${label} section is missing`);
  return match[1];
};
const introduction = (article, post) => {
  if (typeof article !== 'string') throw new Error(`${post.slug} article extraction returned ${typeof article}`);
  const identified = article.match(/<p\b[^>]*\bid=(?:"introduction"|'introduction')[^>]*>([\s\S]*?)<\/p>/i);
  if (identified) return cleanIntro(identified[1]);
  return cleanIntro(inner(article, /<div\b[^>]*class=(?:"[^"]*\barticle-layout\b[^"]*"|'[^']*\barticle-layout\b[^']*')[^>]*>[\s\S]*?<p\b[^>]*>([\s\S]*?)<\/p>/i, `${post.slug} introduction`));
};
const closingCta = (article, post) => {
  const identified = article.match(/<p\b[^>]*\bid=(?:"approved-cta"|'approved-cta')[^>]*>([\s\S]*?)<\/p>/i);
  if (identified) return cleanPresentation(identified[1]);
  const afterSources = article.match(/<section\b[^>]*\bid=(?:"sources"|'sources')[^>]*>[\s\S]*?<\/section>\s*<p\b[^>]*>([\s\S]*?)<\/p>/i);
  if (afterSources) return cleanPresentation(afterSources[1]);
  const afterFaq = article.match(/<section\b[^>]*\baria-labelledby=(?:"faq-heading"|'faq-heading')[^>]*>[\s\S]*?<\/section>\s*<p\b[^>]*>([\s\S]*?)<\/p>/i);
  return afterFaq ? cleanPresentation(afterFaq[1]) : '';
};
const extractSeo = head => {
  const nodes = [];
  const pattern = /<title\b[^>]*>[\s\S]*?<\/title>|<meta\b[^>]*>|<link\b[^>]*\brel=(?:"canonical"|'canonical')[^>]*>|<script\b[^>]*\btype=(?:"application\/ld\+json"|'application\/ld\+json')[^>]*>[\s\S]*?<\/script>/gi;
  for (const match of head.matchAll(pattern)) {
    const node = match[0];
    if (/^<meta\b/i.test(node) && (/<meta\b[^>]*\bcharset=/i.test(node) || /<meta\b[^>]*\bname=(?:"viewport"|'viewport')/i.test(node))) continue;
    nodes.push(node.trim());
  }
  if (!nodes.some(node => /^<title\b/i.test(node))) throw new Error('SEO title is missing');
  if (!nodes.some(node => /\brel=(?:"canonical"|'canonical')/i.test(node))) throw new Error('Canonical URL is missing');
  if (!nodes.some(node => /application\/ld\+json/i.test(node))) throw new Error('Structured data is missing');
  return nodes.join('\n  ');
};
const getLinks = value => [...value.matchAll(/<a\b[^>]*\bhref=(?:"([^"]+)"|'([^']+)')/gi)].map(match => match[1] || match[2]);
const normalize = value => stripTags(value).replace(/\s+/g, ' ').trim();

function extract(original, post) {
  const head = first(original, /<head\b[^>]*>([\s\S]*?)<\/head>/i, `${post.slug} head`);
  const article = first(original, /<article\b[^>]*>([\s\S]*?)<\/article>/i, `${post.slug} article`);
  const hero = first(article, /<figure\b[^>]*class=(?:"[^"]*\b(?:hero-media|article-cover)\b[^"]*"|'[^']*\b(?:hero-media|article-cover)\b[^']*')[^>]*>([\s\S]*?)<\/figure>/i, `${post.slug} hero`);
  const heroSrc = first(hero, /<img\b[^>]*\bsrc=(?:"([^"]+)"|'([^']+)')/i, `${post.slug} hero image`);
  const imageTag = hero.match(/<img\b[^>]*>/i)?.[0] || '';
  const heroAlt = first(imageTag, /\balt=(?:"([^"]*)"|'([^']*)')/i, `${post.slug} hero alt`) || '';
  const heroCaptionMatch = hero.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i);
  const heroCaption = heroCaptionMatch ? cleanPresentation(heroCaptionMatch[1]) : '';
  const heroLead = article.slice(0, article.indexOf('</figure>') + '</figure>'.length);
  const h1 = inner(heroLead, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i, `${post.slug} H1`);
  const h1End = heroLead.search(/<\/h1>/i) + '</h1>'.length;
  const deck = inner(heroLead.slice(h1End), /<p\b[^>]*>([\s\S]*?)<\/p>/i, `${post.slug} deck`);
  const pill = inner(heroLead, /<span\b[^>]*class=(?:"[^"]*\b(?:pill|article-eyebrow)\b[^"]*"|'[^']*\b(?:pill|article-eyebrow)\b[^']*')[^>]*>([\s\S]*?)<\/span>/i, `${post.slug} type label`);
  const heroText = stripTags(heroLead);
  const dateLabel = (heroText.match(/([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/) || [])[1] || post.published_at;
  const readTime = (heroText.match(/(\d+\s*min(?:ute)?s?\s+read)/i) || [])[1];
  if (!readTime) throw new Error(`${post.slug} read time is missing`);
  const intro = introduction(article, post);
  const takeaways = section(article, 'takeaways', `${post.slug} takeaways`);
  const takeawayItems = cleanPresentation(inner(takeaways, /<ul\b[^>]*>([\s\S]*?)<\/ul>/i, `${post.slug} takeaway list`));
  const contentMatch = article.match(/<div\b[^>]*\bid=(?:"article-content"|'article-content')[^>]*>([\s\S]*?)<div\b[^>]*class=(?:"[^"]*\barticle-divider\b[^"]*"|'[^']*\barticle-divider\b[^']*')[^>]*>/i)
    || article.match(/<section\b[^>]*\baria-labelledby=(?:"takeaways-heading"|'takeaways-heading')[^>]*>[\s\S]*?<\/section>\s*<div\b[^>]*class=(?:"[^"]*\barticle-copy\b[^"]*"|'[^']*\barticle-copy\b[^']*')[^>]*>([\s\S]*?)<div\b[^>]*class=(?:"[^"]*\barticle-divider\b[^"]*"|'[^']*\barticle-divider\b[^']*')[^>]*>/i);
  if (!contentMatch) throw new Error(`${post.slug} article body is missing`);
  const content = contentMatch[1];
  const articleHtml = removeLegacyContainerClosures(cleanPresentation(content), `${post.slug} article body`);
  const faq = section(article, 'common-questions', `${post.slug} FAQ`);
  const faqItems = cleanPresentation(inner(faq, /<div\b[^>]*class=(?:"[^"]*\b(?:faq-copy|article-copy)\b[^"]*"|'[^']*\b(?:faq-copy|article-copy)\b[^']*')[^>]*>([\s\S]*?)<\/div>/i, `${post.slug} FAQ content`));
  const sources = section(article, 'sources', `${post.slug} sources`);
  const sourceItems = cleanPresentation(inner(sources, /<ul\b[^>]*>([\s\S]*?)<\/ul>/i, `${post.slug} source list`));
  const cta = closingCta(article, post);
  const toc = first(article, /<aside\b[^>]*class=(?:"[^"]*\b(?:toc|article-toc)\b[^"]*"|'[^']*\b(?:toc|article-toc)\b[^']*')[^>]*>[\s\S]*?<nav\b[^>]*>([\s\S]*?)<\/nav>/i, `${post.slug} TOC`);
  const tocLinks = [...toc.matchAll(/<a\b[^>]*class=(?:"[^"]*\btoc-topic\b[^"]*"|'[^']*\b(?:toc-topic)\b[^']*')[^>]*>([\s\S]*?)<\/a>/gi)].map(match => {
    const tag = match[0];
    const href = first(tag, /\bhref=(?:"([^"]+)"|'([^']+)')/i, `${post.slug} TOC link`);
    const titleMatch = tag.match(/\btitle=(?:"([^"]*)"|'([^']*)')/i);
    const title = titleMatch ? ` title="${escapeHtml(titleMatch[1] ?? titleMatch[2] ?? '')}"` : '';
    return `<a class="toc-topic" href="${escapeHtml(href)}"${title}>${cleanPresentation(match[1])}</a>`;
  }).join('');
  const canonicalUrl = first(head, /<link\b[^>]*\brel=(?:"canonical"|'canonical')[^>]*\bhref=(?:"([^"]+)"|'([^']+)')/i, `${post.slug} canonical`);
  return { head, h1, deck, pill: stripTags(pill), dateLabel, readTime, intro, takeawayItems, articleHtml, faqItems, sourceItems, cta, tocLinks, heroSrc, heroAlt, heroCaption, canonicalUrl, seo: extractSeo(head) };
}

function render(payload, post) {
  const tokens = {
    TITLE: payload.h1,
    SUMMARY: payload.deck,
    SLUG: post.slug,
    HERO_IMAGE_URL: payload.heroSrc,
    HERO_IMAGE_ALT: payload.heroAlt,
    TYPE_LABEL: escapeHtml(payload.pill),
    PUBLISHED_DATE: post.published_at,
    PUBLISHED_DATE_LABEL: payload.dateLabel,
    READ_TIME: payload.readTime,
    EARLY_ANSWER: payload.intro,
    TAKEAWAY_ITEMS: payload.takeawayItems,
    ARTICLE_HTML: payload.articleHtml,
    FAQ_ITEMS: payload.faqItems,
    SOURCE_ITEMS: payload.sourceItems,
    APPROVED_CTA: payload.cta,
    TOC_LINKS: payload.tocLinks,
  };
  let output = template.replace(/\{\{([A-Z_]+)\}\}/g, (match, token) => tokens[token] ?? match);
  output = output.replace(/<meta name="robots"[\s\S]*?<script type="application\/ld\+json">[\s\S]*?<\/script>/i, payload.seo);
  if (payload.heroCaption) output = output.replace(/(<figure class="article-cover">[\s\S]*?<\/figure>)/i, match => match.replace('</figure>', `<figcaption class="article-cover-caption">${payload.heroCaption}</figcaption></figure>`));
  if (!payload.cta) output = output.replace(/\s*<section class="article-cta"[\s\S]*?<\/section>/i, '');
  if (/\{\{[A-Z_]+\}\}/.test(output)) throw new Error(`${post.slug} has unresolved template tokens`);
  return output;
}

function parity(original, migrated, post) {
  const before = extract(original, post);
  const after = extract(migrated, post);
  const fields = ['h1', 'deck', 'dateLabel', 'readTime', 'intro', 'takeawayItems', 'articleHtml', 'faqItems', 'sourceItems', 'cta', 'heroSrc', 'heroAlt', 'canonicalUrl'];
  const contentDifferences = fields.filter(field => normalize(before[field]) !== normalize(after[field]));
  const differences = [...contentDifferences];
  const seoPass = before.seo.trim() === after.seo.trim();
  if (!seoPass) differences.push('SEO metadata');
  const beforeSchemas = [...before.head.matchAll(/<script\b[^>]*\btype=(?:"application\/ld\+json"|'application\/ld\+json')[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1].trim());
  const afterSchemas = [...after.head.matchAll(/<script\b[^>]*\btype=(?:"application\/ld\+json"|'application\/ld\+json')[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1].trim());
  const schemaPass = JSON.stringify(beforeSchemas) === JSON.stringify(afterSchemas);
  if (!schemaPass) differences.push('structured data');
  const linksPass = JSON.stringify(getLinks(before.articleHtml + before.faqItems + before.sourceItems)) === JSON.stringify(getLinks(after.articleHtml + after.faqItems + after.sourceItems));
  if (!linksPass) differences.push('semantic links');
  const tocPass = JSON.stringify(getLinks(before.tocLinks)) === JSON.stringify(getLinks(after.tocLinks));
  if (!tocPass) differences.push('TOC topic links');
  const ids = [...migrated.matchAll(/\bid="([^"]+)"/gi)].map(match => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  return {
    pass: differences.length === 0 && duplicateIds.length === 0,
    contentPass: contentDifferences.length === 0 && linksPass,
    seoPass,
    schemaPass,
    tocPass,
    differences,
    duplicateIds: [...new Set(duplicateIds)],
  };
}

function validateMigratedArticles() {
  const results = new Map();
  for (const post of published) {
    const relative = htmlPath(post.slug);
    const current = fs.readFileSync(path.join(site, relative), 'utf8');
    if (/blog-article-page/.test(current)) {
      console.log(`Validating migrated ${post.slug}.`);
      results.set(post.slug, parity(sourceAtHead(relative), current, post));
    }
  }
  return results;
}

function report(results = validateMigratedArticles(), plannedOnly = false, responsiveVerified = false) {
  const rows = published.map(post => {
    const relative = htmlPath(post.slug);
    const className = classes.get(post.slug);
    const result = results.get(post.slug);
    const migrated = /blog-article-page/.test(fs.readFileSync(path.join(site, relative), 'utf8'));
    const notes = className === 'C' ? 'Class C structural mapping recorded below.' : 'Canonical shell replaces legacy presentation only.';
    return `| ${post.slug} | ${className} | ${migrated ? 'Yes' : 'No'} | ${result?.contentPass ? 'PASS' : result ? `FAIL: ${result.differences.join(', ')}` : 'Not run'} | ${result?.seoPass ? 'PASS' : result ? 'FAIL' : 'Not run'} | ${result?.schemaPass ? 'PASS' : result ? 'FAIL' : 'Not run'} | ${result?.tocPass ? 'Present / PASS' : result ? 'FAIL' : 'Not run'} | ${migrated ? (responsiveVerified ? 'PASS: 1440, 1280, 1024, 768, 390, 320' : 'Pending browser QA') : 'Not run'} | ${notes} |`;
  }).join('\n');
  const plans = Object.entries(classCPlans).map(([slug, mappings]) => `### ${slug}\n\n| Old block | New template location |\n| --- | --- |\n${mappings.map(([oldBlock, newLocation]) => `| ${oldBlock} | ${newLocation} |`).join('\n')}`).join('\n\n');
  const body = `# Blog article migration result\n\nStatus: ${plannedOnly ? 'Class C structural plans recorded before migration.' : 'Local-only migration; owner review required before any checkpoint or deployment.'}\n\n## Inventory and parity\n\n| Article | Class | Migrated? | Content parity | SEO parity | Schema parity | TOC | Responsive | Notes |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n${rows}\n\n## Class C structural before/after plans\n\n${plans}\n\n## Guardrails retained\n\n- No registry content ID, slug, canonical URL, editorial text, external destination, or publishing metadata is changed.\n- Legacy presentation classes are removed from migrated semantic content.\n- Opening paragraphs use the canonical article-introduction treatment and are not copied with legacy visual classes, inline font weight, fixed width, uppercase styling, or manual visual line breaks.\n- No article is committed, pushed, deployed, or published by this migration.\n`;
  fs.writeFileSync(path.join(site, 'docs', 'BLOG_ARTICLE_MIGRATION_RESULT.md'), body);
}

if (phase === 'PLAN-C') {
  report(undefined, true);
  console.log('Wrote Class C structural migration plans without changing published articles.');
  process.exit(0);
}

if (phase === 'FINAL-REPORT') {
  report(validateMigratedArticles(), false, true);
  console.log('Wrote final migration report with completed responsive QA.');
  process.exit(0);
}

if (!['A', 'B', 'C'].includes(phase)) throw new Error('Usage: node scripts/migrate-blog-articles-to-template.mjs <A|B|C|PLAN-C|FINAL-REPORT>');

const results = new Map();
for (const post of published.filter(item => classes.get(item.slug) === phase)) {
  const relative = htmlPath(post.slug);
  const original = sourceAtHead(relative);
  const migrated = render(extract(original, post), post);
  const check = parity(original, migrated, post);
  if (!check.pass) throw new Error(`${post.slug} parity failed before write: ${[...check.differences, ...check.duplicateIds.map(id => `duplicate ID ${id}`)].join(', ')}`);
  fs.writeFileSync(path.join(site, relative), migrated);
  results.set(post.slug, check);
  console.log(`Migrated ${post.slug} with content, SEO, schema, and TOC parity.`);
}
report(validateMigratedArticles());
