import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.tmp_heynajflow_site/blog');
const oldLayoutCss = '.article-layout{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:3rem;align-items:start}.article-layout> :first-child{min-width:0}.article-layout>.toc{grid-column:2;position:sticky;top:1.25rem;align-self:start}@media(max-width:900px){.article-layout{grid-template-columns:1fr;gap:1.5rem}.article-layout>.toc{grid-column:1;position:static}}';
const layoutCss = '.article-layout{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:2rem;align-items:start}.article-layout> :first-child{min-width:0}.article-layout>.toc{grid-column:2;position:sticky;top:1.25rem;align-self:start;margin-top:0}@media(max-width:900px){.article-layout{grid-template-columns:1fr;gap:1.5rem}.article-layout>.toc{grid-column:1;position:static;margin-top:0}}';

const dirs = fs.readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(root, entry.name));

let changed = 0;
for (const dir of dirs) {
  const file = path.join(dir, 'index.html');
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  html = html.replace(
    'class="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start"',
    'class="article-layout mt-12"',
  );

  html = html.replace(oldLayoutCss, layoutCss);

  if (!html.includes('.article-layout{display:grid;')) {
    html = html.replace('</style>', `  ${layoutCss}\n  </style>`);
  }

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    changed += 1;
  }
}

console.log(`Updated ${changed} article pages with explicit sidebar grid CSS.`);
