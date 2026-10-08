import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(site, 'blog', 'what-is-rag-how-heynaj-flow-uses-your-business-knowledge', 'index.html');
const outputPath = path.join(site, 'review-previews', 'blog-article-template', 'index.html');
const source = fs.readFileSync(sourcePath, 'utf8');

const first = (pattern, fallback = '') => source.match(pattern)?.[1]?.trim() || fallback;
const attribute = (name, fallback = '') => first(new RegExp(`<meta[^>]+name="${name}"[^>]+content="([^"]*)"`, 'i'), fallback);
const block = (start, end, fallback = '') => {
  const startIndex = source.search(start);
  if (startIndex < 0) return fallback;
  const endMatch = end.exec(source.slice(startIndex));
  return endMatch ? source.slice(startIndex, startIndex + endMatch.index) : fallback;
};
const title = first(/<h1[^>]*>([\s\S]*?)<\/h1>/i, 'What Is RAG?');
const description = attribute('description');
const marker = attribute('heynaj-publish-marker');
const type = first(/class="pill"[^>]*>[\s\S]*?<\/i>\s*([^<]+)/i, 'Blog post');
const date = first(/<time[^>]*>([\s\S]*?)<\/time>/i, 'August 29, 2026');
const publishedDate = first(/<time[^>]*datetime="([^"]+)"/i, '2026-08-29');
const readTime = first(/<time[^>]*>[\s\S]*?<\/time>\s*&middot;\s*([^<]+)/i, '3 min read');
const image = first(/<figure class="hero-media">[\s\S]*?<img[^>]+src="([^"]+)"/i);
const alt = first(/<figure class="hero-media">[\s\S]*?<img[^>]+alt="([^"]*)"/i, title);
const introduction = first(/<p id="introduction"[^>]*>([\s\S]*?)<\/p>/i, description);
const takeaways = first(/<section id="takeaways"[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
const articleHtml = block(/<div id="article-content"[^>]*>/i, /<div class="article-divider"/i).replace(/^<div id="article-content"[^>]*>/i, '');
const toc = first(/<aside[^>]*class="[^"]*\btoc\b[^"]*"[\s\S]*?<nav[^>]*>([\s\S]*?)<\/nav>/i);
const faq = first(/<section id="common-questions"[\s\S]*?<div[^>]*class="faq-copy[^>]*>([\s\S]*?)<\/div>\s*<\/section>/i);
const sources = first(/<section id="sources"[\s\S]*?<ul[^>]*class="source-list[^>]*>([\s\S]*?)<\/ul>/i);
const cta = first(/<p id="approved-cta"[^>]*>([\s\S]*?)<\/p>/i);
const jsonLd = first(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i, '{}');

if (!image || !articleHtml || !takeaways || !faq || !sources) throw new Error('The RAG fixture no longer matches the expected published article structure.');

let output = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>${title} | Template Preview</title><meta name="description" content="${description}"><meta name="heynaj-publish-marker" content="${marker}"><script type="application/ld+json">${jsonLd}</script><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet"><link rel="icon" type="image/png" href="/favicon.png?v=20260807"><link rel="stylesheet" href="/assets/site-navigation.css"><link id="blog-article-navigation-standard" rel="stylesheet" href="/assets/blog-article.css"><script defer src="/assets/site-navigation.js"></script></head>
<body class="blog-article-page"><header class="site-sticky-header"><nav class="site-navigation" aria-label="Main navigation"><a href="/" class="site-brand" aria-label="HeyNaj Flow home"><img src="https://res.cloudinary.com/dt5j91krt/image/upload/v1775798166/HeyNaj_Logo_Widget_sfb5pe.png" alt="HeyNaj Flow logo" width="36" height="36"><span>HeyNaj Flow</span></a><div class="site-navigation-links"><a href="/#how-it-works">How It Works</a><a href="/#features">Features</a><a href="/blog/" aria-current="page">Blog</a></div><div class="site-navigation-actions"><a class="site-navigation-button site-github" href="https://github.com/heynajflow-ai/heynaj-flow" target="_blank" rel="noopener noreferrer">Star on GitHub</a><a class="site-navigation-button site-get-started" href="/get-started/">Get Started</a></div><button type="button" class="site-menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="site-mobile-menu">Menu</button></nav><div id="site-mobile-menu" class="site-mobile-menu" hidden><nav aria-label="Mobile navigation"><a href="/#how-it-works">How It Works</a><a href="/#features">Features</a><a href="/blog/" aria-current="page">Blog</a><a class="site-navigation-button site-github" href="https://github.com/heynajflow-ai/heynaj-flow">Star on GitHub</a></nav></div></header>
<main class="article-main" id="main-content"><article><header class="article-hero"><a class="article-back-link" href="/blog/">&larr; HeyNaj Flow Blog</a><div class="article-hero-copy"><span class="article-eyebrow"><i></i>${type}</span><h1>${title}</h1><p class="article-deck">${description}</p><p class="article-meta"><time datetime="${publishedDate}">${date}</time><span aria-hidden="true">&middot;</span><span>${readTime}</span></p></div></header><figure class="article-cover"><img src="${image}" alt="${alt}" width="1200" height="675" loading="eager"></figure><div class="article-reading-layout"><aside class="article-toc" aria-label="Article navigation"><p>On this page</p><nav>${toc}</nav></aside><div class="article-flow"><p id="introduction" class="article-introduction">${introduction}</p><section id="takeaways" class="takeaways" aria-labelledby="takeaways-heading"><span class="article-eyebrow"><i></i>Key Takeaways</span><h2 id="takeaways-heading">What to remember</h2><ul>${takeaways}</ul></section><div id="article-content" class="article-copy mt-10">${articleHtml}</div><div class="article-divider" role="presentation" aria-hidden="true"></div><section id="common-questions" class="faq-section" aria-labelledby="faq-heading"><p class="article-section-label">Common questions</p><h2 id="faq-heading">Questions readers ask</h2><div class="faq-copy">${faq}</div></section><section id="sources" class="sources-section" aria-labelledby="sources-heading"><p class="article-section-label">Sources</p><h2 id="sources-heading">References</h2><ul class="source-list">${sources}</ul></section><section class="article-cta" aria-labelledby="article-cta-heading"><p class="article-section-label">HeyNaj Flow</p><h2 id="article-cta-heading">Keep the next conversation moving.</h2><p id="approved-cta">${cta}</p></section></div></div></article></main><footer class="site-footer"><div class="site-footer-panel"><div class="footer-grid slim"><div><div class="site-footer-brand"><img src="https://res.cloudinary.com/dt5j91krt/image/upload/v1775798166/HeyNaj_Logo_Widget_sfb5pe.png" alt="HeyNaj Flow logo" class="footer-brand-logo"><div class="site-footer-brand-name">HeyNaj Flow</div></div><p class="site-footer-description">Website conversations don&rsquo;t have to stop when you sleep.</p></div><div class="site-footer-action"><a href="/get-started/" class="site-footer-cta">Get Started</a></div></div></div><div class="site-footer-legal"><p>&copy; 2026 HeyNaj Flow. All rights reserved.</p><nav aria-label="Legal"><a href="/terms-of-service.html">Terms of Service</a><a href="/privacy-policy.html">Privacy Policy</a><a href="/data-handling-policy.html">Data Handling Policy</a><a href="https://www.linkedin.com/company/heynajflow/" target="_blank" rel="noopener noreferrer">LinkedIn</a></nav></div></footer><script async src="https://heynaj-flow-a08bd193-938.renz-heynajflow-64f.workers.dev/loader.js"></script></body></html>`;

const template = fs.readFileSync(path.join(site, 'templates', 'blog-article.html'), 'utf8');
const previewTokens = {
  TITLE: title,
  SUMMARY: description,
  META_DESCRIPTION: description,
  PUBLISH_MARKER: marker,
  SLUG: 'what-is-rag-how-heynaj-flow-uses-your-business-knowledge',
  HERO_IMAGE_URL: image,
  HERO_IMAGE_ALT: alt,
  ARTICLE_JSON_LD: jsonLd,
  TYPE_LABEL: type,
  PUBLISHED_DATE: publishedDate,
  PUBLISHED_DATE_LABEL: date,
  READ_TIME: readTime,
  EARLY_ANSWER: introduction,
  TOC_LINKS: toc.replace(/<a[^>]+href="#(?:takeaways|common-questions|sources)"[^>]*>[\s\S]*?<\/a>/gi, ''),
  TAKEAWAY_ITEMS: takeaways,
  ARTICLE_HTML: articleHtml,
  FAQ_ITEMS: faq,
  SOURCE_ITEMS: sources,
  APPROVED_CTA: cta,
};
output = template.replace(/\{\{([A-Z_]+)\}\}/g, (match, token) => previewTokens[token] ?? match);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, output);
console.log(`Built local template preview: ${path.relative(site, outputPath)}`);
