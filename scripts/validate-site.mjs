import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const read = relative => fs.readFileSync(path.join(site, relative), 'utf8').replace(/^\uFEFF/, '');
const count = (value, pattern) => [...value.matchAll(pattern)].length;

const registry = JSON.parse(read('data/blog-registry.json'));
const published = registry.posts.filter(post => post.status === 'published');
const genericExcerpt = 'Practical guidance for better website conversations with HeyNaj Flow.';
const sitemap = read('sitemap.xml');
const shellTargets = [
  'index.html',
  'blog/index.html',
  'get-started/index.html',
  'book/index.html',
  'terms-of-service.html',
  'privacy-policy.html',
  'data-handling-policy.html',
  'templates/blog-article.html',
  ...published.map(post => `blog/${post.slug}/index.html`),
];
const shellRegion = (html, name) => html.match(new RegExp(`<!-- ${name}:START -->[\\s\\S]*?<!-- ${name}:END -->`))?.[0] || '';

for (const relative of shellTargets) {
  check(fs.existsSync(path.join(site, relative)), `${relative}: public shell target is missing`);
  if (!fs.existsSync(path.join(site, relative))) continue;
  const html = read(relative);
  const navigation = shellRegion(html, 'SITE_NAVIGATION');
  const footer = shellRegion(html, 'SITE_FOOTER');
  const styles = shellRegion(html, 'SITE_SHELL_STYLES');
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]);
  check(navigation.length > 0 && (html.match(/<!-- SITE_NAVIGATION:START -->/g) || []).length === 1 && (html.match(/<!-- SITE_NAVIGATION:END -->/g) || []).length === 1, `${relative}: canonical Navigation markers are missing or duplicated`);
  check(footer.length > 0 && (html.match(/<!-- SITE_FOOTER:START -->/g) || []).length === 1 && (html.match(/<!-- SITE_FOOTER:END -->/g) || []).length === 1, `${relative}: canonical Footer markers are missing or duplicated`);
  check(styles.includes('/assets/site-navigation.css') && styles.includes('/assets/site-footer.css'), `${relative}: shared shell styles are missing`);
  check(navigation.includes('How It Works') && navigation.includes('Features') && navigation.includes('>Blog<') && navigation.includes('Star on GitHub') && navigation.includes('>Get Started<'), `${relative}: canonical Navigation labels are incomplete`);
  check(!/Capabilities|Command Center|Pricing|Start Free Pilot|Free Pilot/i.test(`${navigation}\n${footer}`), `${relative}: legacy public-site chrome label remains`);
  check(footer.includes('Website conversations don&rsquo;t have to stop when you sleep.') && footer.includes('>Get Started<') && footer.includes('Terms of Service') && footer.includes('Privacy Policy') && footer.includes('Data Handling Policy') && footer.includes('LinkedIn'), `${relative}: canonical Footer content is incomplete`);
  check(new Set(ids).size === ids.length, `${relative}: duplicate IDs are present`);
}

for (const post of published) {
  const relative = `blog/${post.slug}/index.html`;
  check(fs.existsSync(path.join(site, relative)), `${post.slug}: article file is missing`);
  if (!fs.existsSync(path.join(site, relative))) continue;
  const html = read(relative);
  const article = html.match(/<article\b[\s\S]*?<\/article>/i)?.[0] || '';
  check(count(html, /<h1\b/gi) === 1, `${post.slug}: expected one H1`);
  check(count(article, /<img\b/gi) === 1, `${post.slug}: generated article must contain one cover image only`);
  check(!/PHOTO PLACEHOLDER/i.test(html), `${post.slug}: photo placeholder leaked into output`);
  check(!/{{[A-Z0-9_]+}}/.test(html), `${post.slug}: unresolved template placeholder`);
  check(html.includes(`<link rel="canonical" href="https://heynajflow.com/blog/${post.slug}/">`), `${post.slug}: canonical mismatch`);
  check(sitemap.includes(`<loc>https://heynajflow.com/blog/${post.slug}/</loc>`), `${post.slug}: missing from sitemap`);
  const contentStart = /<div\b[^>]*class="[^"]*\barticle-copy\b[^"]*\bmt-10\b[^"]*"[^>]*>/i.exec(html)?.index ?? -1;
  const contentEnd = html.indexOf('<div class="article-divider"', contentStart);
  const topicRegion = contentStart >= 0 && contentEnd > contentStart ? html.slice(contentStart, contentEnd) : '';
  const topicIds = [...topicRegion.matchAll(/<h[23]\b[^>]*\bid="([^"]+)"[^>]*>/gi)].map(match => match[1]);
  const tocIds = [...html.matchAll(/<a class="toc-topic" href="#([^"]+)"/gi)].map(match => match[1]);
  check(topicIds.length > 0, `${post.slug}: article topics are missing`);
  check(JSON.stringify(tocIds) === JSON.stringify(topicIds), `${post.slug}: On This Page topics do not match the article headings`);
  check(html.includes('id="blog-article-navigation-standard"'), `${post.slug}: shared article navigation styles are missing`);
  const excerpt = String(post.excerpt || '').trim();
  check(excerpt.length > 0 && excerpt !== genericExcerpt, `${post.slug}: excerpt is missing or generic`);
  if (post.source === 'approved n8n workflow') {
    check(html.includes('id="takeaways-heading"'), `${post.slug}: generated article is missing Key Takeaways`);
    check(html.includes('id="faq-heading"'), `${post.slug}: generated article is missing Common Questions`);
    check(html.includes('"@type":"FAQPage"'), `${post.slug}: generated article is missing matching FAQ schema`);
  }
}

const datedPosts = published.filter(post => post.published_at >= '2026-07-20' && post.published_at <= '2026-08-05');
const datedExcerpts = datedPosts.map(post => String(post.excerpt || '').trim().toLowerCase());
check(new Set(datedExcerpts).size === datedExcerpts.length, 'July 20-August 5 archive excerpts must be unique');

for (const [file, canonical] of [
  ['privacy-policy.html', 'https://heynajflow.com/privacy-policy.html'],
  ['data-handling-policy.html', 'https://heynajflow.com/data-handling-policy.html'],
]) {
  const html = read(file);
  check(html.includes(`<link rel="canonical" href="${canonical}">`), `${file}: self-canonical is missing`);
  check(!/<meta[^>]+(?:noindex|nofollow)/i.test(html), `${file}: must remain indexable`);
  check(sitemap.includes(`<loc>${canonical}</loc>`), `${file}: missing from sitemap`);
}

const robots = read('robots.txt');
check(/User-agent:\s*\*/i.test(robots) && /Allow:\s*\//i.test(robots), 'robots.txt must allow crawling');
check(/Sitemap:\s*https:\/\/heynajflow\.com\/sitemap\.xml/i.test(robots), 'robots.txt must advertise the sitemap');

const redirects = read('netlify.toml');
for (const route of ['/privacy-policy', '/privacy-policy/', '/data-handling-policy', '/data-handling-policy/']) {
  const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  check(new RegExp(`from = "${escaped}"[\\s\\S]*?status = 301[\\s\\S]*?force = true`).test(redirects), `${route}: canonical 301 redirect is missing`);
}

if (failures.length) {
  console.error(`Site validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Site validation passed: ${published.length} articles, ${datedPosts.length} timeline entries, 2 policy pages.`);
