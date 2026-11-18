/**
 * IndexNow submission — ping Bing (and Yahoo/Yandex, which share the indexnow.org
 * feed) that these URLs changed, so they re-crawl instead of waiting for the
 * sitemap to be re-read.
 *
 * The key file must exist at the site root, named after the key:
 *   f631f30dc9c2c489e2220d7c07179b98.txt  ->  contains the key
 * Bing Webmaster Tools verifies the same way, so one file covers both.
 *
 * Run:
 *   node scripts/indexnow.mjs            submit every URL (full refresh)
 *   node scripts/indexnow.mjs --changed  submit only URLs whose page changed
 *                                        since the last submit
 *
 * --changed compares git history and the working tree against `.indexnow-stamp`,
 * which holds the commit last announced. Re-announcing unchanged URLs is noise:
 * indexnow.org dedupes them and it costs a request for nothing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PAGES } from './pages.mjs';

const KEY = 'f631f30dc9c2c489e2220d7c07179b98';
const HOST = 'clear212.mo-automation.com';
const ROOT = path.resolve(import.meta.dirname, '..');
const STAMP = path.join(ROOT, '.indexnow-stamp');

const ALL = PAGES.map(([, u]) => `https://${HOST}${u}`);

function readStamp() {
  try { return fs.readFileSync(STAMP, 'utf8').trim(); } catch { return ''; }
}

/** execFile, not exec: no shell, so paths reach git as arguments untouched */
function git(args) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  } catch {
    return '';
  }
}

/** files changed since the stamp: committed history plus anything uncommitted */
function changedFiles(stamp) {
  const out = new Set();
  const range = stamp ? `${stamp}..HEAD` : 'HEAD~1..HEAD';
  git(['diff', '--name-only', range]).split('\n').forEach((f) => f.trim() && out.add(f));
  git(['status', '--porcelain']).split('\n').forEach((line) => {
    const f = line.slice(3).trim();
    if (f) out.add(f);
  });
  return out;
}

const mode = process.argv[2] || 'all';
let urls = ALL;
let note = 'full refresh';

if (mode === '--changed') {
  const files = changedFiles(readStamp());
  const picked = PAGES.filter(([f]) => files.has(f)).map(([, u]) => `https://${HOST}${u}`);
  if (picked.length === 0) {
    console.log('nothing changed since the last submit — skipping');
    process.exit(0);
  }
  urls = picked;
  note = `changed only (${picked.length}/${PAGES.length})`;
} else if (mode !== 'all') {
  console.error(`unknown mode: ${mode}  (use "all" or "--changed")`);
  process.exit(2);
}

const endpoint = process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow';
const res = await fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, urlList: urls }),
});

const text = await res.text();
console.log(`${res.status} ${res.statusText}  ${endpoint}`);
if (text) console.log(text);
if (!res.ok) process.exit(1);

/* record what was announced, so the next --changed run knows what is new */
const head = git(['rev-parse', 'HEAD']).trim();
if (head) {
  fs.writeFileSync(STAMP, head + '\n');
  console.log(`stamp: ${head.slice(0, 7)}`);
}
console.log(`submitted ${urls.length} URL(s) — ${note}`);
