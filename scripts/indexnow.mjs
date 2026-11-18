/**
 * IndexNow submission — ping Bing (and Yahoo/Yandex, which share the indexnow.org
 * feed) that these URLs changed, so they re-crawl instead of waiting for the
 * sitemap to be re-read.
 *
 * The key file must exist at the site root, named after the key:
 *   f631f30dc9c2c489e2220d7c07179b98.txt  ->  contains the key
 * Bing Webmaster Tools verifies the same way, so one file covers both.
 *
 * Run:  node scripts/indexnow.mjs
 */
const KEY = 'f631f30dc9c2c489e2220d7c07179b98';
const HOST = 'clear212.mo-automation.com';

const URLS = [
  `https://${HOST}/`,
  `https://${HOST}/ar`,
  `https://${HOST}/answers`,
  `https://${HOST}/ar/answers`,
  `https://${HOST}/tracker`,
  `https://${HOST}/ar/tracker`,
  `https://${HOST}/privacy`,
  `https://${HOST}/ar/privacy`,
  `https://${HOST}/terms`,
  `https://${HOST}/ar/terms`,
  `https://${HOST}/refunds`,
  `https://${HOST}/ar/refunds`,
  `https://${HOST}/disclosure`,
  `https://${HOST}/ar/disclosure`,
  `https://${HOST}/contact`,
  `https://${HOST}/ar/contact`,
];

const endpoint = process.argv[2] || 'https://api.indexnow.org/indexnow';

const res = await fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, urlList: URLS }),
});

const text = await res.text();
console.log(`${res.status} ${res.statusText}  ${endpoint}`);
if (text) console.log(text);
if (!res.ok) process.exit(1);
console.log(`submitted ${URLS.length} URLs`);
