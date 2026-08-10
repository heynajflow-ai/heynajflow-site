import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, '..');
const workbookPath = 'C:/Users/rrata/Downloads/HeyNaj Flow - Research and Drafting Workbook (7).xlsx';
const blogRoot = path.join(site, 'blog');
const heynaj = 'https://heynajflow.com';

const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const values = name => wb.worksheets.getItem(name).getUsedRange(true).values;
const indexHeaders = row => Object.fromEntries(row[0].map((h, i) => [String(h || '').trim(), i]));
const drafts = values('Blog Drafts');
const opportunities = values('Content Opportunities');
const dh = indexHeaders(drafts);
const oh = indexHeaders(opportunities);

const byTopicId = new Map();
for (const row of opportunities.slice(1)) {
  const topicId = String(row[oh.topic_id] ?? '').trim();
  if (!topicId) continue;
  let candidates = [];
  try { candidates = JSON.parse(String(row[oh.citation_candidates_object] || '[]')); } catch { candidates = []; }
  byTopicId.set(topicId, {
    candidates,
    competitor: String(row[oh.competitor_url] ?? '').trim(),
    topic: String(row[oh.topic] ?? '').trim()
  });
}

const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const usableUrl = url => /^https?:\/\//i.test(url) && !/vertexaisearch\.cloud\.google\.com|grounding-api-redirect/i.test(url);

const fallbackTitle = url => {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return 'Further reading'; }
};

const makeItem = (name, title, url, note) => `<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(name)} - ${esc(title)}</a>${note ? `<p>${esc(note)}</p>` : ''}</li>`;

const sourceRowsFor = (slug, topicId) => {
  // This featured playbook is based on HeyNaj’s own product, setup, FAQ, and
  // lead-capture process, so its primary references are first-party pages.
  if (slug === 'after-hours-lead-capture-chatbot') {
    return [
      makeItem('HeyNaj Flow', 'Product capabilities', `${heynaj}/#capabilities`, 'First-party reference for the assistant, lead capture, and qualification capabilities described in this playbook.'),
      makeItem('HeyNaj Flow', 'Pricing and pilot details', `${heynaj}/#pricing`, 'First-party reference for the pilot and plan information.'),
      makeItem('HeyNaj Flow', 'FAQ and discovery call', `${heynaj}/book/`, 'First-party FAQ and booking page for how HeyNaj Flow is introduced, configured, and reviewed.')
    ];
  }

  const record = byTopicId.get(topicId);
  const rows = [];
  const seen = new Set();
  for (const candidate of record?.candidates || []) {
    const url = String(candidate?.source_url || '').trim();
    if (!usableUrl(url) || seen.has(url)) continue;
    seen.add(url);
    rows.push(makeItem(
      candidate.source_title ? fallbackTitle(url) : fallbackTitle(url),
      candidate.source_title || candidate.anchor_text || 'Further reading',
      url,
      candidate.claim_supported || 'Supports the topic-specific claims and context discussed in this article.'
    ));
    if (rows.length === 3) break;
  }
  if (!rows.length && usableUrl(record?.competitor)) {
    rows.push(makeItem(fallbackTitle(record.competitor), 'Research reference', record.competitor, 'Primary research reference recorded for this topic in the Content Opportunities sheet.'));
  }

  // The comparison article’s research input explicitly names these competing
  // services; keep the references aligned with that input rather than generic
  // chatbot-benefit pages.
  if (slug === 'choosing-your-ai-assistant-heynaj-vs-chatbot-com-feature-comparison') {
    const comparison = [
      ['ChatBot.com', 'Pricing', 'https://www.chatbot.com/pricing/?billing=monthly'],
      ['Crisp', 'Pricing', 'https://crisp.chat/en/pricing/'],
      ['HubSpot', 'Service Hub', 'https://www.hubspot.com/products/service']
    ];
    return comparison.map(([name, title, url]) => makeItem(name, title, url, 'Competitor reference named in the Content Research Inputs sheet.'));
  }
  return rows;
};

const sourceSection = rows => `
      <section id="sources" class="references-section mt-12 p-6 md:p-8" aria-labelledby="sources-heading">
        <p class="text-xs font-extrabold uppercase tracking-[.16em] text-slate-500">Sources</p>
        <h2 id="sources-heading" class="mt-3 text-2xl font-extrabold tracking-tight">References</h2>
        <ul class="source-list mt-4 space-y-4">${rows.join('')}</ul>
      </section>`;

const sourceRe = /\s*<section id="sources"[\s\S]*?<\/section>\s*/;
const closingGridRe = /<\/aside>\s*<\/div>\s*<\/article>/;

for (const entry of fs.readdirSync(blogRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const slug = entry.name;
  const file = path.join(blogRoot, slug, 'index.html');
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  const draft = drafts.slice(1).find(row => String(row[dh.slug] ?? '').trim() === slug);
  const topicId = draft ? String(draft[dh.topic_id] ?? '').trim() : '';
  const rows = sourceRowsFor(slug, topicId);
  if (!rows.length) continue;

  html = html.replace(sourceRe, '\n');
  const section = sourceSection(rows);
  if (!closingGridRe.test(html)) throw new Error(`Could not locate article grid closing boundary in ${slug}`);
  html = html.replace(closingGridRe, `</aside>\n      </div>${section}\n    </article>`);
  fs.writeFileSync(file, html, 'utf8');
  console.log(`Synced workbook references and moved Sources outside article grid: ${slug}`);
}
