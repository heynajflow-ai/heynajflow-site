import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(site, relative), 'utf8').replace(/^\uFEFF/, '');
const write = (relative, value) => fs.writeFileSync(path.join(site, relative), value);
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));
const decodeHtml = value => String(value)
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
  .replace(/&(amp|lt|gt|quot|#39);/g, entity => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" }[entity.slice(1, -1)]));
const stripTags = value => decodeHtml(String(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
const compactLabel = (value, limit = 40) => {
  const text = stripTags(value).replace(/[?.!]+$/, '');
  if (text.length <= limit) return text;
  return `${text.slice(0, limit + 1).replace(/\s+\S*$/, '').replace(/[,:;\s]+$/, '')}…`;
};
const standardStyles = `<style id="blog-article-navigation-standard">
    .article-copy h3{margin:2.2rem 0 .7rem;font-size:clamp(1.25rem,1.8vw,1.4rem);line-height:1.3;color:var(--ink);letter-spacing:-.015em;font-weight:800}.article-copy h4{margin:1.55rem 0 .45rem;font-size:1rem;line-height:1.45;color:#475569;font-weight:800}
    section[aria-labelledby="takeaways-heading"] ul{list-style:disc!important;padding-left:1.35rem!important}section[aria-labelledby="takeaways-heading"] li{padding-left:.2rem}section[aria-labelledby="takeaways-heading"] li::marker{color:var(--ink);font-size:.8em}
    .article-copy h2[id],.article-copy h3[id],.article-copy h4[id]{scroll-margin-top:7rem}.toc nav{max-height:calc(100vh - 11rem);overflow-y:auto;padding-right:.25rem;scrollbar-width:thin}.toc a{display:block;padding:.45rem 0;font-size:.8rem;font-weight:750;line-height:1.4;color:#64748b}.toc .toc-topic{margin-left:.15rem;border-left:1px solid #e2e8f0;padding:.3rem 0 .3rem .7rem;font-size:.75rem;font-weight:650;line-height:1.35}.toc a:hover,.toc a:focus-visible{color:var(--ink)}
    @media(max-width:900px){.toc nav{max-height:none;overflow:visible;padding-right:0}.toc .toc-topic{display:none}}
  </style>`;

const registry = JSON.parse(read('data/blog-registry.json'));
let updated = 0;

for (const post of registry.posts.filter(item => item.status === 'published')) {
  const relative = `blog/${post.slug}/index.html`;
  const absolute = path.join(site, relative);
  if (!fs.existsSync(absolute)) continue;
  let html = read(relative);
  const contentStart = /<div\b[^>]*class="[^"]*\barticle-copy\b[^"]*\bmt-10\b[^"]*"[^>]*>/i.exec(html)?.index ?? -1;
  const contentEnd = html.indexOf('<div class="article-divider"', contentStart);
  if (contentStart < 0 || contentEnd < 0) throw new Error(`${post.slug}: unable to locate the main article topic region`);
  const topicRegion = html.slice(contentStart, contentEnd);
  const topics = [...topicRegion.matchAll(/<h([23])\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map(([, , id, heading]) => ({ id, label: stripTags(heading) }))
    .filter(topic => topic.label && !['takeaways-heading', 'faq-heading', 'sources-heading'].includes(topic.id));
  if (!topics.length) throw new Error(`${post.slug}: no article topics found`);

  const takeawaysTarget = html.includes('id="takeaways"') ? 'takeaways' : 'takeaways-heading';
  const questionsTarget = html.includes('id="common-questions"') ? 'common-questions' : 'faq-heading';
  const sourcesTarget = html.includes('id="sources"') ? 'sources' : 'sources-heading';
  const topicLinks = topics.map(topic => (
    `<a class="toc-topic" href="#${escapeHtml(topic.id)}" title="${escapeHtml(topic.label)}">${escapeHtml(compactLabel(topic.label))}</a>`
  )).join('');
  const navigation = `<a href="#${takeawaysTarget}">Key takeaways</a>${topicLinks}<a href="#${questionsTarget}">Common questions</a><a href="#${sourcesTarget}">Sources</a>`;
  html = html.replace(
    /(<aside class="toc\b[^>]*>[\s\S]*?<nav class="mt-4">)[\s\S]*?(<\/nav>\s*<\/aside>)/i,
    `$1${navigation}$2`,
  );
  if (!html.includes(topicLinks)) throw new Error(`${post.slug}: failed to update article navigation`);

  html = html.replace(/\s*<style id="blog-article-navigation-standard">[\s\S]*?<\/style>/i, '');
  html = html.replace('</head>', `  ${standardStyles}\n</head>`);
  write(relative, html);
  updated += 1;
}

console.log(`Updated article navigation for ${updated} published pages.`);
