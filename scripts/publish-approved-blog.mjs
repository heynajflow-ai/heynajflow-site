import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const payload = JSON.parse(process.env.CLIENT_PAYLOAD || '{}');
const required = ['topic_id', 'slug', 'title', 'meta_description', 'article_html', 'hero_image_url', 'published_at'];
for (const field of required) {
  if (!String(payload[field] || '').trim()) throw new Error(`Missing required publish field: ${field}`);
}

const slug = String(payload.slug).trim();
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Invalid blog slug');
if (!/^https:\/\//i.test(String(payload.hero_image_url))) throw new Error('Hero image must use an HTTPS URL');

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));
const decodeHtml = (value) => String(value)
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
  .replace(/&(amp|lt|gt|quot|#39);/g, entity => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" }[entity.slice(1, -1)]));
const stripTags = (value) => decodeHtml(String(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
const conciseText = (value, limit) => {
  const text = stripTags(value);
  if (text.length <= limit) return text;
  const clipped = text.slice(0, limit + 1).replace(/\s+\S*$/, '').replace(/[,:;\s]+$/, '');
  return `${clipped}.`;
};
const firstCompleteSentence = (value, limit = 220) => {
  const text = stripTags(value);
  const sentence = text.match(/^.*?[.!?](?=\s|$)/)?.[0] || text;
  return conciseText(sentence, limit);
};
const compactTocLabel = (value, limit = 40) => {
  const text = stripTags(value).replace(/[?.!]+$/, '');
  if (text.length <= limit) return text;
  return `${text.slice(0, limit + 1).replace(/\s+\S*$/, '').replace(/[,:;\s]+$/, '')}…`;
};
const slugifyHeading = (value) => stripTags(value)
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'section';
const stripPhotoPlaceholders = (value) => {
  let html = String(value);
  let markerIndex = html.search(/PHOTO PLACEHOLDER/i);
  while (markerIndex >= 0) {
    const stack = [];
    for (const match of html.slice(0, markerIndex).matchAll(/<div\b[^>]*>|<\/div\s*>/gi)) {
      if (/^<\/div/i.test(match[0])) stack.pop();
      else stack.push(match.index);
    }
    const start = stack.length >= 2 ? stack.at(-2) : stack.at(-1);
    if (start === undefined) break;
    let depth = 0;
    let end;
    for (const match of html.slice(start).matchAll(/<div\b[^>]*>|<\/div\s*>/gi)) {
      if (/^<\/div/i.test(match[0])) depth -= 1;
      else depth += 1;
      if (depth === 0) {
        end = start + match.index + match[0].length;
        break;
      }
    }
    if (end === undefined) break;
    html = html.slice(0, start) + html.slice(end);
    markerIndex = html.search(/PHOTO PLACEHOLDER/i);
  }
  return html;
};
const sanitizeArticleHtml = (value, title) => {
  let html = stripPhotoPlaceholders(value)
  .replace(/<(script|style|iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
  .replace(/<(script|style|iframe|object|embed|form)\b[^>]*\/?>/gi, '')
  .replace(/<figure\b[^>]*>[\s\S]*?<\/figure\s*>/gi, '')
  .replace(/<img\b[^>]*\/?>/gi, '')
  .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/\s+(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, ' $1="#"')
  .replace(/\s+(style|class)\s*=\s*("[^"]*"|'[^']*')/gi, '')
  .replace(/<h1\b([^>]*)>/gi, '<h2$1>')
  .replace(/<\/h1\s*>/gi, '</h2>');

  html = html.replace(/^\s*<h2\b[^>]*>([\s\S]*?)<\/h2>\s*/i, (match, heading) => (
    stripTags(heading).toLowerCase() === String(title).trim().toLowerCase() ? '' : match
  ));

  const usedIds = new Set();
  html = html.replace(/<h([23])\b([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level, attributes, content) => {
    const existingId = attributes.match(/\bid\s*=\s*["']([^"']+)["']/i)?.[1];
    const base = existingId || slugifyHeading(content);
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) id = `${base}-${suffix++}`;
    usedIds.add(id);
    const cleanAttributes = attributes.replace(/\s+id\s*=\s*("[^"]*"|'[^']*')/i, '');
    return `<h${level}${cleanAttributes} id="${id}">${content}</h${level}>`;
  });
  return html.trim();
};

const articleHtml = sanitizeArticleHtml(payload.article_html, payload.title);
if (!/<(?:p|h[1-6]|section|ul|ol|blockquote)\b/i.test(articleHtml)) throw new Error('Approved article is not structured HTML');
if (/<(?:img|figure)\b/i.test(articleHtml) || /PHOTO PLACEHOLDER/i.test(articleHtml)) {
  throw new Error('Approved article body still contains generated media or photo placeholders');
}

const publishedAt = new Date(payload.published_at);
if (Number.isNaN(publishedAt.valueOf())) throw new Error('Invalid published_at timestamp');
const publishedDate = publishedAt.toISOString().slice(0, 10);
const plainText = articleHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const summary = String(payload.meta_description).trim();
const canonical = `https://heynajflow.com/blog/${slug}/`;
const articleType = String(payload.article_type || 'blog_post');
const typeLabel = ({
  featured_playbook: 'Featured playbook',
  cluster_guide: 'Cluster guide',
  authority_guide: 'Authority guide',
  pillar_post: 'Pillar post',
  cluster_article: 'Cluster article',
  comparison_article: 'Comparison',
  blog_post: 'Blog post',
})[articleType] || 'HeyNaj Flow guide';
const publishedDateLabel = new Intl.DateTimeFormat('en-US', {
  year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
}).format(publishedAt);
const sections = [...articleHtml.matchAll(/<h([23])\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>([\s\S]*?)(?=<h[23]\b|$)/gi)]
  .map(([, , id, heading, body]) => ({
    id,
    heading: stripTags(heading),
    answer: conciseText(body.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] || body, 320),
  }))
  .filter(section => section.heading && section.answer);
if (sections.length < 3) throw new Error('Approved article needs at least three substantive sections for takeaways and common questions');
const faqQuestion = (heading) => {
  const clean = heading.replace(/[?.!]+$/, '').trim();
  const questionPhrase = value => value.toLowerCase()
    .replace(/\bai\b/g, 'AI')
    .replace(/\bcrm\b/g, 'CRM')
    .replace(/\bapi\b/g, 'API')
    .replace(/\bnlp\b/g, 'NLP');
  const questionCase = value => {
    const [, first = '', rest = ''] = value.match(/^(\S+)(?:\s+([\s\S]*))?$/) || [];
    return `${first.charAt(0).toUpperCase()}${first.slice(1).toLowerCase()}${rest ? ` ${questionPhrase(rest)}` : ''}`;
  };
  const howStatement = clean.match(/^how (.+?) (elevate|improve|transform|build|drive|reduce|enhance|deliver|create) (.+)$/i);
  if (howStatement) return `How do ${questionPhrase(howStatement[1])} ${howStatement[2].toLowerCase()} ${questionPhrase(howStatement[3])}?`;
  if (/^(how|why|what|when|where|which|can|should|does|do|is|are)\b/i.test(clean)) return `${questionCase(clean)}?`;
  const steps = clean.match(/^key steps for (.+)$/i);
  if (steps) return `What are the key steps for ${questionPhrase(steps[1])}?`;
  const challenge = clean.match(/^overcoming (.+)$/i);
  if (challenge) return `How can businesses overcome ${questionPhrase(challenge[1])}?`;
  return `What should businesses know about ${questionPhrase(clean)}?`;
};
const takeaways = sections.slice(0, 4).map(section => firstCompleteSentence(section.answer));
const faqs = sections.slice(0, 4).map(section => ({ question: faqQuestion(section.heading), answer: section.answer }));
const earlyAnswer = conciseText(sections[0].answer, 260);
const takeawayItems = takeaways.map(item => `<li>${escapeHtml(item)}</li>`).join('');
const faqItems = faqs.map(item => `<h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p>`).join('');
const visibleSupplement = [summary, earlyAnswer, ...takeaways, ...faqs.flatMap(item => [item.question, item.answer])].join(' ');
const readTime = Math.max(1, Math.ceil(`${plainText} ${visibleSupplement}`.split(/\s+/).filter(Boolean).length / 220));
const tocLinks = [...articleHtml.matchAll(/<h([23])\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gi)]
  .map(([, , id, heading]) => {
    const fullLabel = stripTags(heading);
    return `<a class="toc-topic" href="#${escapeHtml(id)}" title="${escapeHtml(fullLabel)}">${escapeHtml(compactTocLabel(fullLabel))}</a>`;
  })
  .join('');
const sourceLinks = [...articleHtml.matchAll(/<a\b[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
  .filter(([, url]) => !url.startsWith('https://heynajflow.com'));
const uniqueSources = [...new Map(sourceLinks.map(([, url, label]) => [url, stripTags(label) || new URL(url).hostname])).entries()];
const sourceItems = uniqueSources.length
  ? uniqueSources.map(([url, label]) => `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a></li>`).join('')
  : '<li>References are linked in the article where they support a specific point.</li>';
const blogPosting = {
  '@type': 'BlogPosting',
  headline: String(payload.title),
  description: summary,
  image: [String(payload.hero_image_url)],
  datePublished: publishedAt.toISOString(),
  dateModified: publishedAt.toISOString(),
  mainEntityOfPage: canonical,
  author: { '@type': 'Organization', name: 'HeyNaj Flow' },
  publisher: { '@type': 'Organization', name: 'HeyNaj Flow' },
};
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    blogPosting,
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
  ],
};

const templatePath = path.join(site, 'templates', 'blog-article.html');
let document = fs.readFileSync(templatePath, 'utf8');
document = document.replace(/^<!--[\s\S]*?-->\s*/, '');
const replacements = {
  TITLE: escapeHtml(payload.title),
  TYPE_LABEL: escapeHtml(typeLabel),
  META_DESCRIPTION: escapeHtml(summary),
  SLUG: slug,
  HERO_IMAGE_URL: escapeHtml(payload.hero_image_url),
  HERO_IMAGE_ALT: escapeHtml(payload.hero_image_alt || payload.title),
  ARTICLE_JSON_LD: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
  PUBLISHED_DATE: publishedDate,
  PUBLISHED_DATE_LABEL: escapeHtml(publishedDateLabel),
  READ_TIME: `${readTime} min read`,
  SUMMARY: escapeHtml(summary),
  EARLY_ANSWER: escapeHtml(earlyAnswer),
  TAKEAWAY_ITEMS: takeawayItems,
  FAQ_ITEMS: faqItems,
  TOC_LINKS: tocLinks || '<a href="#article-content">Article</a>',
  SOURCE_ITEMS: sourceItems,
  ARTICLE_HTML: articleHtml,
};
for (const [key, value] of Object.entries(replacements)) document = document.replaceAll(`{{${key}}}`, value);
document = document.replace(/\s*<meta name="robots" content="noindex,nofollow,noarchive">\s*/i, '\n  <meta name="robots" content="index,follow">\n  ');
if (/{{[A-Z0-9_]+}}/.test(document)) throw new Error('Article template still contains unresolved placeholders');

const articleDir = path.join(site, 'blog', slug);
fs.mkdirSync(articleDir, { recursive: true });
fs.writeFileSync(path.join(articleDir, 'index.html'), document);

const registryPath = path.join(site, 'data', 'blog-registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8').replace(/^\uFEFF/, ''));
const entry = {
  content_id: String(payload.topic_id),
  title: String(payload.title),
  slug,
  excerpt: summary,
  article_type: articleType,
  status: 'published',
  source: 'approved n8n workflow',
  published_at: publishedDate,
  hero_image_url: String(payload.hero_image_url),
  hero_image_alt: String(payload.hero_image_alt || payload.title),
  read_time: readTime,
};
const existingIndex = registry.posts.findIndex((post) => post.slug === slug || post.content_id === entry.content_id);
if (existingIndex >= 0) registry.posts[existingIndex] = { ...registry.posts[existingIndex], ...entry };
else registry.posts.push(entry);
registry.generated_at = new Date().toISOString();
fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);

await import(`./render-blog-registry.mjs?published=${Date.now()}`);
console.log(`Prepared approved blog article: ${canonical}`);
