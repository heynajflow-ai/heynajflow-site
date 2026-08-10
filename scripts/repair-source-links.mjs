import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const entry of fs.readdirSync(path.join(site, 'blog'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = path.join(site, 'blog', entry.name, 'index.html');
  if (!fs.existsSync(file)) continue;
  const old = fs.readFileSync(file, 'utf8');
  const next = old.replaceAll('https://www.hubspot.com/products/service/customer-service', 'https://www.hubspot.com/products/service');
  if (next !== old) fs.writeFileSync(file, next);
}
