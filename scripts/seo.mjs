/**
 * One-off SEO/GEO injector for Clear212.
 *
 * Adds to every page's <head>:
 *   - robots meta, canonical, Open Graph, Twitter Card
 *   - JSON-LD (WebSite + Organization on the home page, FAQPage on the answers
 *     pages, WebPage everywhere else)
 *
 * Title and description are read from each file's own <title> and meta
 * description, so this never drifts from the page content.
 *
 * Run:  node scripts/seo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOMAIN = 'https://clear212.mo-automation.com';
const IMG = `${DOMAIN}/assets/og.png`;

/** Google Search Console verification token (public by design — it ships in the page source). */
const VERIFY = 'i3YwDaanTeyLT4FPCARVnraCQaX7D1qbjI42oHGEkWk';

/** url, type, locale, and which JSON-LD to emit */
const PAGES = {
  'index.html': { url: '/', type: 'website', locale: 'en_US', ld: 'website' },
  'answers.html': { url: '/answers', type: 'article', locale: 'en_US', ld: 'faq' },
  'ar/answers.html': { url: '/ar/answers', type: 'article', locale: 'ar_AR', ld: 'faq' },
  'ar/index.html': { url: '/ar/', type: 'website', locale: 'ar_AR', ld: 'webpage' },
  'ar/tracker.html': { url: '/ar/tracker', type: 'article', locale: 'ar_AR', ld: 'webpage' },
  'tracker.html': { url: '/tracker', type: 'article', locale: 'en_US', ld: 'webpage' },
  'privacy.html': { url: '/privacy', type: 'website', locale: 'en_US', ld: 'webpage' },
  'terms.html': { url: '/terms', type: 'website', locale: 'en_US', ld: 'webpage' },
  'refunds.html': { url: '/refunds', type: 'website', locale: 'en_US', ld: 'webpage' },
  'disclosure.html': { url: '/disclosure', type: 'website', locale: 'en_US', ld: 'webpage' },
  'contact.html': { url: '/contact', type: 'website', locale: 'en_US', ld: 'webpage' },
};

const decode = (s) => String(s)
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'");

const esc = (s) => decode(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function readMeta(html) {
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.trim() || 'Clear212';
  const desc = (html.match(/<meta name="description" content="([\s\S]*?)"\s*\/>/) || [])[1] || '';
  return { title: decode(title).replace(/\s+/g, ' '), desc: decode(desc).replace(/\s+/g, ' ') };
}

/** Pull the QA array straight out of the page's own script. */
function extractQA(html) {
  const m = html.match(/var QA = (\[[\s\S]*?\n  \]);/);
  if (!m) throw new Error('QA array not found');
  return eval(m[1]); // our own file, our own literal
}

function jsonld(kind, ctx) {
  const { page, title, desc, QA } = ctx;
  const url = DOMAIN + page.url;

  if (kind === 'website') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: 'Clear212',
          url: DOMAIN + '/',
          description: desc,
          inLanguage: ['en', 'ar'],
          publisher: { '@id': `${DOMAIN}/#organization` },
        },
        {
          '@type': 'Organization',
          '@id': `${DOMAIN}/#organization`,
          name: 'Clear212',
          url: DOMAIN + '/',
          email: 'hello@mo-automation.com',
          logo: { '@type': 'ImageObject', url: `${DOMAIN}/assets/og.png` },
          sameAs: [],
        },
      ],
    };
  }

  if (kind === 'faq') {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: QA.map((it) => ({
        '@type': 'Question',
        name: it.q,
        acceptedAnswer: { '@type': 'Answer', text: it.a },
      })),
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: desc,
    url,
    inLanguage: page.locale.startsWith('ar') ? 'ar' : 'en',
    isPartOf: { '@id': `${DOMAIN}/#website` },
  };
}

function headBlock(page, title, desc, ld) {
  const url = DOMAIN + page.url;
  const alt = page.locale.startsWith('ar')
    ? 'Clear212 — إجابات GTA VI والعداد ومتتبع التقدم'
    : 'Clear212 — GTA VI answers, countdown and progress';
  const altLocale = page.locale.startsWith('ar') ? 'en_US' : 'ar_AR';

  const lines = [
    '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">',
    `<meta name="google-site-verification" content="${VERIFY}">`,
    `<link rel="canonical" href="${url}">`,
    '<meta property="og:site_name" content="Clear212">',
    `<meta property="og:type" content="${page.type}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:locale" content="${page.locale}">`,
    `<meta property="og:locale:alternate" content="${altLocale}">`,
    `<meta property="og:image" content="${IMG}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${esc(alt)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`,
    `<meta name="twitter:image" content="${IMG}">`,
  ];
  if (ld) lines.push(`<script type="application/ld+json">${JSON.stringify(ld)}</script>`);
  return `<!-- seo:start -->\n${lines.join('\n')}\n<!-- seo:end -->`;
}

const STRIP = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->\n?/g;

let changed = 0;
for (const [file, page] of Object.entries(PAGES)) {
  const full = path.join(ROOT, file);
  let html = fs.readFileSync(full, 'utf8');

  // one-time cleanup: the first run injected an unmarked block before the marker
  const legacy = /(?<=<meta name="theme-color" content="#0b0a14" \/>)\n<meta name="robots"[\s\S]*?(?=<!-- seo:start -->)/;
  if (legacy.test(html)) html = html.replace(legacy, '');

  html = html.replace(STRIP, ''); // idempotent: drop any previous injection

  const { title, desc } = readMeta(html);
  const QA = page.ld === 'faq' ? extractQA(html) : null;
  const ld = jsonld(page.ld, { page, title, desc, QA });

  const anchor = '<meta name="theme-color" content="#0b0a14" />';
  if (!html.includes(anchor)) throw new Error(`anchor not found in ${file}`);
  html = html.replace(anchor, `${anchor}\n${headBlock(page, title, desc, ld)}`);

  fs.writeFileSync(full, html);
  console.log(`injected: ${file}  (ld=${page.ld}${QA ? `, ${QA.length} Q&A` : ''})`);
  changed++;
}
console.log(`\n${changed} page(s) updated.`);
