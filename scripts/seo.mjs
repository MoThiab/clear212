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

/* ---------- analytics (optional) ----------
   Paste your GoatCounter endpoint here, once. The counter script is self-hosted
   from /assets/goatcounter.js, so the Content-Security-Policy never has to open
   up to a third party.

   Register free at https://www.goatcounter.com/ and you get something like
   https://clear212.goatcounter.com/count — paste that here and re-run
   `node scripts/seo.mjs`. Leave empty to ship with no analytics. */
const ANALYTICS_URL = '';

/* Language switch: one button in the top bar, on every page, pointing at the
   same path in the other language. */
const LANG_CSS = '.langbtn{display:inline-flex;align-items:center;gap:7px;min-height:38px;padding:7px 14px;border-radius:999px;border:1px solid var(--border);background:rgba(124,58,237,.14);color:var(--text);font-family:"Chakra Petch","Noto Kufi Arabic",system-ui,sans-serif;font-size:13.5px;font-weight:600;cursor:pointer;transition:background .18s ease}'
  + '.langbtn:hover{background:rgba(124,58,237,.26)}'
  + '.langbtn:focus-visible{outline:3px solid var(--cyan);outline-offset:2px}'
  + '.topbar .badge{margin-inline-start:auto}';
const LANG_BTN = '<button class="langbtn" id="langBtn" type="button"></button>';
const LANG_JS = '<script>(function(){var p=location.pathname.replace(/\\/+$/,"")||"/";var isAr=p.indexOf("/ar")===0;'
  + 'var other=isAr?(p.replace(/^\\/ar/,"")||"/"):("/ar"+(p==="/"?"/":p));'
  + 'var b=document.getElementById("langBtn");if(!b)return;'
  + 'b.textContent=isAr?"English":"العربية";'
  + 'b.addEventListener("click",function(){try{localStorage.setItem("clear212-lang",isAr?"en":"ar");}catch(e){}'
  + 'location.href=other+(location.search||"")+location.hash;});})();<\/script>';

/* Remember the choice: runs in <head> before first paint, so a visitor who picked
   Arabic is served the Arabic page instead of being handed English again. */
const LANG_REDIRECT = '<script>(function(){try{'
  + 'var p=location.pathname.replace(/\\/+$/,"")||"/";'
  + 'var cur=p.indexOf("/ar")===0?"ar":"en";'
  + 'var want=localStorage.getItem("clear212-lang");'
  + 'if(want&&want!==cur){var other=cur==="ar"?(p.replace(/^\\/ar/,"")||"/"):("/ar"+(p==="/"?"/":p));'
  + 'location.replace(other+location.search+location.hash);}'
  + '}catch(e){}})();<\/script>';

/* ---------- cookie / local-storage consent ---------- */
const CONSENT_CSS = '.consent{position:fixed;inset-inline:0;bottom:0;z-index:60;background:var(--card);border-top:1px solid var(--border);box-shadow:0 -18px 44px -26px rgba(0,0,0,.95)}'
  + '.consent-in{max-width:var(--maxw,780px);margin:0 auto;padding:14px 18px calc(14px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:11px}'
  + '.consent p{margin:0;font-size:13.5px;color:var(--muted);line-height:1.75}'
  + '.consent .acts{display:flex;gap:8px;flex-wrap:wrap;align-items:center}'
  + '.consent button{border-radius:10px;padding:10px 18px;font:inherit;font-weight:700;font-size:14px;cursor:pointer;border:1px solid transparent}'
  + '.consent .cy{background:linear-gradient(100deg,var(--pink),var(--pink-2));color:#120410}'
  + '.consent .cn{background:transparent;color:var(--text);border-color:var(--border)}'
  + '.consent .cn:hover{border-color:var(--pink)}'
  + '.consent a{color:var(--cyan);text-decoration:none;font-size:13.5px}'
  + '.consent button:focus-visible,.consent a:focus-visible{outline:3px solid var(--cyan);outline-offset:2px}';
/* runs in <head> so every later script can ask C212.canStore() */
const CONSENT_CORE = '<script>(function(){var K="clear212-consent";'
  + 'function get(){try{return localStorage.getItem(K);}catch(e){return null;}}'
  + 'function set(v){try{localStorage.setItem(K,v);}catch(e){}}'
  + 'window.C212={consentKey:K,get:get,set:set,canStore:function(){return get()==="yes";}};})();<\/script>';
/* the banner itself, rendered after the page so it never blocks first paint */
const CONSENT_UI = '<script>(function(){var el=document.getElementById("consent");if(!el)return;'
  + 'var g=(window.C212&&C212.get)||function(){return null;};var v=g();'
  + 'if(v!==null){document.documentElement.setAttribute("data-consent",v);el.hidden=true;return;}'
  + 'el.hidden=false;'
  + 'function done(x){if(window.C212)C212.set(x);document.documentElement.setAttribute("data-consent",x);el.hidden=true;}'
  + 'document.getElementById("consentYes").addEventListener("click",function(){done("yes");});'
  + 'document.getElementById("consentNo").addEventListener("click",function(){done("no");});})();<\/script>';

/** the notice text, in the page's own language */
function consentHtml(isAr){
  return isAr
    ? '<div class="consent" id="consent" hidden role="region" aria-label="إشعار التخزين"><div class="consent-in">'
      + '<p>منخزّن لغتك المختارة وتقدّمك بالتخزين المحلي (local storage) على هالمتصفح. ما منستخدم كوكيز تتبع أو إعلانات. روابط المنتجات ممكن تحط كوكيز خاصة بالمحل. <a href="privacy.html">سياسة الخصوصية</a></p>'
      + '<div class="acts"><button class="cy" id="consentYes" type="button">قبول</button>'
      + '<button class="cn" id="consentNo" type="button">رفض</button></div></div></div>'
    : '<div class="consent" id="consent" hidden role="region" aria-label="Storage notice"><div class="consent-in">'
      + '<p>We store your language choice and your progress in this browser\'s local storage. We do not set tracking or advertising cookies. Product links may set the retailer\'s own cookies. <a href="privacy.html">Privacy policy</a></p>'
      + '<div class="acts"><button class="cy" id="consentYes" type="button">Accept</button>'
      + '<button class="cn" id="consentNo" type="button">Reject</button></div></div></div>';
}

/* ---------- share row ---------- */
const SHARE_CSS = '.share{margin:22px 0 8px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}'
  + '.share-label{font-size:13px;color:var(--faint)}'
  + '.share-acts{display:flex;gap:8px;flex-wrap:wrap}'
  + '.sh{display:inline-flex;align-items:center;min-height:36px;padding:7px 13px;border-radius:999px;border:1px solid var(--border);background:rgba(124,58,237,.12);color:var(--muted);font:inherit;font-size:13px;font-weight:600;text-decoration:none;cursor:pointer;transition:background .18s ease,color .18s ease}'
  + '.sh:hover{background:rgba(124,58,237,.24);color:var(--text)}'
  + '.sh:focus-visible{outline:3px solid var(--cyan);outline-offset:2px}'
  + '.sh-x{background:rgba(255,46,126,.14);border-color:rgba(255,46,126,.5);color:var(--text)}'
  + '.sh-x:hover{background:rgba(255,46,126,.28)}';
const SHARE_JS = '<script>(function(){var url=location.href,t=document.title,e=encodeURIComponent;'
  + 'var u={x:"https://twitter.com/intent/tweet?text="+e(t)+"&url="+e(url),'
  + 'wa:"https://wa.me/?text="+e(t+" "+url),'
  + 'tg:"https://t.me/share/url?url="+e(url)+"&text="+e(t),'
  + 'fb:"https://www.facebook.com/sharer/sharer.php?u="+e(url)};'
  + 'var bs=document.querySelectorAll("#share .sh");'
  + 'for(var i=0;i<bs.length;i++){(function(a){a.addEventListener("click",function(ev){'
  + 'var n=a.getAttribute("data-net");'
  + 'if(n==="copy"){ev.preventDefault();var b=a.textContent,d=a.getAttribute("data-done")||"Copied";'
  + 'try{navigator.clipboard.writeText(url).then(function(){a.textContent=d;setTimeout(function(){a.textContent=b;},1600);});}'
  + 'catch(e2){a.href=url;}return;}'
  + 'if(u[n])a.href=u[n];});})(bs[i]);}})();<\/script>';

function shareHtml(isAr){
  var copy = isAr ? 'نسخ الرابط' : 'Copy link';
  var done = isAr ? 'اتنسخ' : 'Copied';
  return '<div class="share" id="share"><span class="share-label">' + (isAr ? 'شارك هالصفحة:' : 'Share this page:') + '</span>'
    + '<div class="share-acts">'
    + '<a class="sh sh-x" href="#" data-net="x" target="_blank" rel="noopener">X</a>'
    + '<a class="sh" href="#" data-net="wa" target="_blank" rel="noopener">WhatsApp</a>'
    + '<a class="sh" href="#" data-net="tg" target="_blank" rel="noopener">Telegram</a>'
    + '<a class="sh" href="#" data-net="fb" target="_blank" rel="noopener">Facebook</a>'
    + '<button class="sh" type="button" data-net="copy" data-done="' + done + '">' + copy + '</button>'
    + '</div></div>';
}

/** url, type, locale, and which JSON-LD to emit */
const PAGES = {
  'index.html': { url: '/', type: 'website', locale: 'en_US', ld: 'website' },
  'answers.html': { url: '/answers', type: 'article', locale: 'en_US', ld: 'faq' },
  'ar/answers.html': { url: '/ar/answers', type: 'article', locale: 'ar_AR', ld: 'faq' },
  'ar/index.html': { url: '/ar', type: 'website', locale: 'ar_AR', ld: 'webpage' },
  'ar/tracker.html': { url: '/ar/tracker', type: 'article', locale: 'ar_AR', ld: 'webpage' },
  'tracker.html': { url: '/tracker', type: 'article', locale: 'en_US', ld: 'webpage' },
  'privacy.html': { url: '/privacy', type: 'website', locale: 'en_US', ld: 'webpage' },
  'terms.html': { url: '/terms', type: 'website', locale: 'en_US', ld: 'webpage' },
  'refunds.html': { url: '/refunds', type: 'website', locale: 'en_US', ld: 'webpage' },
  'disclosure.html': { url: '/disclosure', type: 'website', locale: 'en_US', ld: 'webpage' },
  'contact.html': { url: '/contact', type: 'website', locale: 'en_US', ld: 'webpage' },
  'ar/privacy.html': { url: '/ar/privacy', type: 'website', locale: 'ar_AR', ld: 'webpage' },
  'ar/terms.html': { url: '/ar/terms', type: 'website', locale: 'ar_AR', ld: 'webpage' },
  'ar/refunds.html': { url: '/ar/refunds', type: 'website', locale: 'ar_AR', ld: 'webpage' },
  'ar/disclosure.html': { url: '/ar/disclosure', type: 'website', locale: 'ar_AR', ld: 'webpage' },
  'ar/contact.html': { url: '/ar/contact', type: 'website', locale: 'ar_AR', ld: 'webpage' },
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
  lines.push(`<style>${LANG_CSS}${CONSENT_CSS}${SHARE_CSS}</style>`);
  if (ANALYTICS_URL) lines.push(`<script data-goatcounter="${ANALYTICS_URL}" async src="/assets/goatcounter.js"></script>`);
  lines.push(LANG_REDIRECT);
  lines.push(CONSENT_CORE);
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

  /* language switch button + its behaviour — always replace, so edits land */
  html = html.replace(/[ \t]*<button class="langbtn" id="langBtn" type="button"><\/button>\n?/g, '');
  html = html.replace(/<script>\(function\(\)\{var p=location\.pathname[\s\S]*?<\/script>/g, '');
  html = html.replace(/<div class="badge"/, `${LANG_BTN}\n  <div class="badge"`);
  var isAr = /<html[^>]*\blang="ar"/.test(html);
  /* drop any previous consent block so this stays idempotent — marked ones
     first, then the older unmarked copies from before the markers existed */
  html = html.replace(/<!-- consent:start -->[\s\S]*?<!-- consent:end -->\n?/g, '');
  html = html.replace(/[ \t]*<div class="consent" id="consent"[\s\S]*?<\/script>\n?/g, '');
  var consentBlock = '<!-- consent:start -->\n' + consentHtml(isAr) + '\n' + CONSENT_UI + '\n<!-- consent:end -->';
  html = html.replace('</body>', shareHtml(isAr) + '\n' + SHARE_JS + '\n' + consentBlock + '\n' + LANG_JS + '\n</body>');

  /* the button replaces the old footer text link, so drop it */
  if (file.startsWith('ar/')) {
    html = html.replace(/[ \t]*<a href="\.\.\/(index|tracker|answers)\.html">English<\/a>\n?/g, '');
  }

  fs.writeFileSync(full, html);
  console.log(`injected: ${file}  (ld=${page.ld}${QA ? `, ${QA.length} Q&A` : ''})`);
  changed++;
}
console.log(`\n${changed} page(s) updated.`);
