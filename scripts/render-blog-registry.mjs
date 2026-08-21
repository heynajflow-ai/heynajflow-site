import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, '..');
const registryPath = fs.existsSync(path.join(site, 'data', 'blog-registry.json'))
  ? path.join(site, 'data', 'blog-registry.json')
  : path.join(site, 'data', 'blog-registry.seed.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8').replace(/^\uFEFF/, ''));
const genericExcerpt = 'Practical guidance for better website conversations with HeyNaj Flow.';
const published = registry.posts
  .filter(post => post.status === 'published')
  .map(post => {
    const excerpt = String(post.excerpt || '').trim();
    if (!excerpt || excerpt === genericExcerpt) {
      throw new Error(`Published post ${post.slug || post.content_id || '(unknown)'} needs a unique excerpt`);
    }
    return {
      ...post,
      published_at: post.published_at || new Date().toISOString().slice(0, 10),
      excerpt,
    };
  })
  .sort((a, b) => b.published_at.localeCompare(a.published_at));

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
const dateLabel = value => new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  .format(new Date(`${value}T12:00:00Z`));
const monthLabel = value => new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' })
  .format(new Date(`${value}-15T12:00:00Z`));
const articleUrl = post => `/blog/${post.slug}/`;
const typeLabel = post => ({ featured_playbook: 'Featured playbook', cluster_guide: 'Cluster guide', authority_guide: 'Authority guide', pillar_post: 'Pillar post', cluster_article: 'Cluster article', blog_post: 'Blog post', comparison_article: 'Comparison' }[post.article_type] || 'HeyNaj Flow guide');

function homeCard(post) {
  return `<a href="${esc(articleUrl(post))}" class="blog-preview-card glass-card overflow-hidden rounded-[1.75rem] block focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ffdc32]/45">
                        <img src="${esc(post.hero_image_url)}" alt="${esc(post.hero_image_alt)}" class="blog-preview-image w-full" loading="lazy">
                        <div class="p-5 md:p-6">
                            <div class="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400"><span>${esc(typeLabel(post))}</span><span aria-hidden="true">&bull;</span><span>${esc(post.read_time)} min read</span></div>
                            <h3 class="mt-3 text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">${esc(post.title)}</h3>
                            <p class="mt-2 text-sm md:text-base font-medium leading-relaxed text-slate-600">${esc(post.excerpt)}</p>
                            <span class="mt-4 inline-flex font-extrabold text-slate-900 underline decoration-[#ffdc32] decoration-4 underline-offset-4">Read article <span aria-hidden="true" class="ml-2">&rarr;</span></span>
                        </div>
                    </a>`;
}

function archiveCard(post) {
  return `<article data-post data-date="${esc(post.published_at)}" data-read-time="${esc(post.read_time)}" class="post-card overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white"><a href="${esc(articleUrl(post))}" class="block focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#ffdc32]/60"><img class="h-56 w-full object-cover" src="${esc(post.hero_image_url)}" alt="${esc(post.hero_image_alt)}" loading="lazy"><div class="p-6"><h4 class="text-xl font-extrabold leading-tight">${esc(post.title)}</h4><p class="mt-3 text-sm leading-6 text-slate-600">${esc(post.excerpt)}</p><div class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"><span class="font-extrabold text-slate-900 underline decoration-[#ffdc32] decoration-4 underline-offset-4">Read blog &rarr;</span><span class="italic text-slate-500">${esc(dateLabel(post.published_at))}</span><span class="text-slate-500">${esc(post.read_time)} min read</span></div></div></a></article>`;
}

function renderArchive() {
  const groups = new Map();
  for (const post of published) {
    const key = post.published_at.slice(0, 7);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(post);
  }
  return [...groups].map(([month, posts]) => `<section><div class="month-rule"><h3 class="text-2xl font-extrabold">${esc(monthLabel(month))}</h3></div><div class="mt-6 grid gap-6 md:grid-cols-2">${posts.map(archiveCard).join('')}</div></section>`).join('\n      ');
}

function replaceBetween(html, start, end, replacement) {
  const startIndex = html.indexOf(start);
  const endIndex = html.indexOf(end);
  if (startIndex < 0 || endIndex < 0 || endIndex < startIndex) throw new Error(`Missing registry markers: ${start}`);
  return html.slice(0, startIndex + start.length) + '\n' + replacement + '\n                ' + html.slice(endIndex);
}

const homePath = path.join(site, 'index.html');
const blogPath = path.join(site, 'blog', 'index.html');
let home = fs.readFileSync(homePath, 'utf8');
let blog = fs.readFileSync(blogPath, 'utf8');
const featured = published.find(post => post.article_type === 'featured_playbook') || published[0];
const secondary = published.find(post => post.content_id !== featured?.content_id) || featured;
home = replaceBetween(home, '<!-- BLOG_REGISTRY:HOME_START -->', '<!-- BLOG_REGISTRY:HOME_END -->', `<div class="mt-7 grid gap-5 md:grid-cols-2">\n                    ${homeCard(featured)}\n\n                    ${homeCard(secondary)}\n                </div>`);
blog = replaceBetween(blog, '<!-- BLOG_REGISTRY:ARCHIVE_START -->', '<!-- BLOG_REGISTRY:ARCHIVE_END -->', `<div class="mt-10 space-y-14">\n      ${renderArchive()}\n    </div>`);
fs.writeFileSync(homePath, home);
fs.writeFileSync(blogPath, blog);
fs.writeFileSync(path.join(site, 'data', 'blog-published.json'), JSON.stringify({ schema_version: 1, generated_at: new Date().toISOString(), posts: published }, null, 2) + '\n');
const sitemapPath = path.join(site, 'sitemap.xml');
const existingSitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '';
const nonBlogUrls = [...existingSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]).filter(url => !url.includes('/blog/'));
const sitemapUrls = [...new Set([...nonBlogUrls, 'https://heynajflow.com/blog/', ...published.map(post => `https://heynajflow.com${articleUrl(post)}`)])];
fs.writeFileSync(sitemapPath, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map(url => `  <url><loc>${esc(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`Rendered ${published.length} published posts from ${path.basename(registryPath)}.`);
