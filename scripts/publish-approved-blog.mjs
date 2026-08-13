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
const sanitizeArticleHtml = (value) => String(value)
  .replace(/<(script|style|iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
  .replace(/<(script|style|iframe|object|embed|form)\b[^>]*\/?>/gi, '')
  .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/\s+(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, ' $1="#"');

const articleHtml = sanitizeArticleHtml(payload.article_html);
if (!/<(?:p|h[1-6]|section|ul|ol|blockquote)\b/i.test(articleHtml)) throw new Error('Approved article is not structured HTML');

const publishedAt = new Date(payload.published_at);
if (Number.isNaN(publishedAt.valueOf())) throw new Error('Invalid published_at timestamp');
const publishedDate = publishedAt.toISOString().slice(0, 10);
const plainText = articleHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const readTime = Math.max(1, Math.ceil(plainText.split(/\s+/).filter(Boolean).length / 220));
const summary = String(payload.meta_description).trim();
const canonical = `https://heynajflow.com/blog/${slug}/`;
const jsonLd = {
  '@context': 'https://schema.org',
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

const templatePath = path.join(site, 'templates', 'blog-article.html');
let document = fs.readFileSync(templatePath, 'utf8');
document = document.replace(/^<!--[\s\S]*?-->\s*/, '');
const replacements = {
  TITLE: escapeHtml(payload.title),
  META_DESCRIPTION: escapeHtml(summary),
  SLUG: slug,
  HERO_IMAGE_URL: escapeHtml(payload.hero_image_url),
  HERO_IMAGE_ALT: escapeHtml(payload.hero_image_alt || payload.title),
  ARTICLE_JSON_LD: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
  PUBLISHED_DATE: publishedDate,
  READ_TIME: `${readTime} min read`,
  SUMMARY: escapeHtml(summary),
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
  article_type: String(payload.article_type || 'blog_post'),
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
