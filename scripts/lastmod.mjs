/**
 * Rewrite every <lastmod> in sitemap.xml from the page's real last change date
 * (git, falling back to the file's mtime).
 *
 * Why: Google uses <lastmod> to decide whether to re-crawl. A sitemap whose
 * lastmod never moves tells Google nothing changed, however much you edited —
 * so the field has to be truthful, not just present.
 *
 * Run:  node scripts/lastmod.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PAGES, URLS } from './pages.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const today = new Date().toISOString().slice(0, 10);

function gitDate(file) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], {
      cwd: ROOT, encoding: 'utf8',
    }).trim();
    return out || '';
  } catch {
    return '';
  }
}

function mtime(file) {
  try {
    return fs.statSync(path.join(ROOT, file)).mtime.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

let xml = fs.readFileSync(SITEMAP, 'utf8');
const dates = new Map();
let updated = 0;

for (const [file, url] of PAGES) {
  const d = gitDate(file) || mtime(file) || today;
  dates.set(url, d);
}

/* each <url> block holds one <loc>; set the <lastmod> that follows it */
xml = xml.replace(/<loc>([^<]+)<\/loc>\s*<lastmod>[^<]*<\/lastmod>/g, (m, loc) => {
  const path_ = new URL(loc).pathname.replace(/\/$/, '') || '/';
  const d = dates.get(path_);
  if (!d) return m;
  if (m.includes(`<lastmod>${d}</lastmod>`)) return m;
  updated++;
  return `<loc>${loc}</loc>\n        <lastmod>${d}</lastmod>`;
});

fs.writeFileSync(SITEMAP, xml);
console.log(`lastmod: ${updated} URL(s) updated (${today})`);
