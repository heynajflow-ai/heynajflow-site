import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.tmp_heynajflow_site/blog');
const skip = 'after-hours-lead-capture-chatbot';
let changed = 0;

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name === skip) continue;
  const file = path.join(root, entry.name, 'index.html');
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  const marker = /(\s<\/div>\s*)(<aside class="toc)/;
  if (!marker.test(html)) continue;
  html = html.replace(marker, '$1        </div>\n        </div>\n        $2');
  fs.writeFileSync(file, html, 'utf8');
  changed += 1;
}

console.log(`Fixed sidebar nesting in ${changed} article pages.`);
