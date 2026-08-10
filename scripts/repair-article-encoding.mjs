import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blogRoot = path.join(site, 'blog');

const replacements = [
  ['â†', '←'],
  ['â†’', '→'],
  ['â€™', '’'],
  ['â€œ', '“'],
  ['â€�', '”'],
  ['â€“', '–'],
  ['â€”', '—'],
  ['Ã©', 'é'],
  ['Ã—', '×']
];

for (const entry of fs.readdirSync(blogRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = path.join(blogRoot, entry.name, 'index.html');
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  for (const [bad, good] of replacements) html = html.replaceAll(bad, good);
  if (html !== before) {
    fs.writeFileSync(file, html);
    console.log(`Repaired encoding: ${entry.name}`);
  }
}
