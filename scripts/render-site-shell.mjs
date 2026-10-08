import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const navigationPartial = fs.readFileSync(path.join(site, 'shared/site-navigation.html'), 'utf8').trim();
const footerPartial = fs.readFileSync(path.join(site, 'shared/site-footer.html'), 'utf8').trim();
const styles = `<!-- SITE_SHELL_STYLES:START -->\n  <link rel="stylesheet" href="/assets/site-navigation.css?v=20261008-shell2">\n  <link rel="stylesheet" href="/assets/site-footer.css?v=20261008-shell2">\n  <script defer src="/assets/site-navigation.js"></script>\n  <!-- SITE_SHELL_STYLES:END -->`;

const shellPages = () => {
  const registry = JSON.parse(fs.readFileSync(path.join(site, 'data/blog-registry.json'), 'utf8').replace(/^\uFEFF/, ''));
  const articles = registry.posts.filter(post => post.status === 'published').map(post => `blog/${post.slug}/index.html`);
  return ['index.html', 'blog/index.html', 'get-started/index.html', 'book/index.html', 'terms-of-service.html', 'privacy-policy.html', 'data-handling-policy.html', ...articles];
};

const markerCount = (document, name) => (document.match(new RegExp(`<!-- ${name}:START -->`, 'g')) || []).length + (document.match(new RegExp(`<!-- ${name}:END -->`, 'g')) || []).length;
const assertOneRegion = (document, name) => {
  const start = document.indexOf(`<!-- ${name}:START -->`);
  const end = document.indexOf(`<!-- ${name}:END -->`);
  if (markerCount(document, name) !== 2 || start < 0 || end < start) throw new Error(`${name}: expected one ordered marker pair`);
};
const replaceRegion = (document, name, content) => {
  assertOneRegion(document, name);
  const expression = new RegExp(`<!-- ${name}:START -->[\\s\\S]*?<!-- ${name}:END -->`);
  return document.replace(expression, `<!-- ${name}:START -->\n${content}\n<!-- ${name}:END -->`);
};

const navigationFor = relative => {
  const isHome = relative === 'index.html';
  const isBlog = relative === 'blog/index.html' || relative.startsWith('blog/');
  const isGetStarted = relative === 'get-started/index.html';
  const legacySpacing = isHome || relative === 'book/index.html' ? ' site-legacy-spacing' : '';
  return navigationPartial
    .replace('class="site-sticky-header"', `class="site-sticky-header${legacySpacing}"`)
    .replaceAll('{{HOW_IT_WORKS_HREF}}', isHome ? '#how-it-works' : 'https://heynajflow.com/#how-it-works')
    .replaceAll('{{FEATURES_HREF}}', isHome ? '#features' : 'https://heynajflow.com/#features')
    .replaceAll('{{BLOG_CURRENT}}', isBlog ? ' aria-current="page"' : '')
    .replaceAll('{{GET_STARTED_CURRENT}}', isGetStarted ? ' aria-current="page"' : '');
};

const stripLegacyShellAssets = document => document
  .replace(/\s*<link\b[^>]*href=["']\/assets\/site-navigation\.css(?:\?[^"']*)?["'][^>]*>\s*/gi, '\n')
  .replace(/\s*<link\b[^>]*href=["']\/assets\/site-footer\.css(?:\?[^"']*)?["'][^>]*>\s*/gi, '\n')
  .replace(/\s*<script\b[^>]*src=["']\/assets\/site-navigation\.js["'][^>]*><\/script>\s*/gi, '\n');

const bootstrapRegion = (document, name, content, expression, placement) => {
  if (markerCount(document, name)) throw new Error(`${name}: partial marker state is incomplete`);
  const first = expression.exec(document);
  if (!first) {
    if (placement === 'after-body') {
      const body = /<body\b[^>]*>/i.exec(document);
      if (!body) throw new Error(`${name}: no body element available for canonical shell insertion`);
      const region = `<!-- ${name}:START -->\n${content}\n<!-- ${name}:END -->`;
      return `${document.slice(0, body.index + body[0].length)}\n${region}${document.slice(body.index + body[0].length)}`;
    }
    throw new Error(`${name}: missing legacy shell candidate`);
  }
  const second = new RegExp(expression.source, `${expression.flags.replace('g', '')}g`);
  const candidates = document.match(second) || [];
  if (candidates.length > 1) throw new Error(`${name}: found multiple legacy shell candidates`);
  const region = `<!-- ${name}:START -->\n${content}\n<!-- ${name}:END -->`;
  return document.replace(expression, region);
};

export function renderSiteShellDocument(source, relative, { bootstrap = false } = {}) {
  let document = stripLegacyShellAssets(source);
  if (/^(?:terms-of-service|privacy-policy|data-handling-policy)\.html$/.test(relative)) {
    document = document.replace(/\s*<div class="nav-shell">[\s\S]*?<\/div>\s*/i, '\n');
  }
  if (bootstrap) {
    const canonicalNavigation = /<header\b[^>]*class=["'][^"']*\bsite-sticky-header\b[^"']*["'][^>]*>[\s\S]*?<\/header>/i;
    document = bootstrapRegion(document, 'SITE_NAVIGATION', navigationFor(relative), canonicalNavigation, 'after-body');
    const canonicalFooter = /<footer\b[^>]*class=["'][^"']*\bsite-footer\b[^"']*["'][^>]*>[\s\S]*?<\/footer>/i;
    const genericFooter = /<footer\b[\s\S]*?<\/footer>/i;
    document = bootstrapRegion(document, 'SITE_FOOTER', footerPartial, canonicalFooter.test(document) ? canonicalFooter : genericFooter);
  } else {
    assertOneRegion(document, 'SITE_NAVIGATION');
    assertOneRegion(document, 'SITE_FOOTER');
  }

  document = replaceRegion(document, 'SITE_NAVIGATION', navigationFor(relative));
  document = replaceRegion(document, 'SITE_FOOTER', footerPartial);

  const styleMarker = 'SITE_SHELL_STYLES';
  if (markerCount(document, styleMarker)) document = replaceRegion(document, styleMarker, styles.replace(/<!--[\s\S]*?-->/g, '').trim());
  else if (/<\/head>/i.test(document)) document = document.replace(/<\/head>/i, `${styles}\n</head>`);
  else throw new Error(`${relative}: missing </head> for shared shell styles`);
  return document;
}

export function renderSiteShell({ bootstrap = false } = {}) {
  const targets = [...shellPages(), 'templates/blog-article.html'];
  for (const relative of targets) {
    const file = path.join(site, relative);
    if (!fs.existsSync(file)) throw new Error(`${relative}: public shell target is missing`);
    const next = renderSiteShellDocument(fs.readFileSync(file, 'utf8'), relative, { bootstrap });
    fs.writeFileSync(file, next);
  }
  return targets;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const targets = renderSiteShell({ bootstrap: process.argv.includes('--bootstrap') });
  console.log(`Rendered canonical public shell into ${targets.length} files.`);
}
