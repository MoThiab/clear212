/**
 * One-off: attach a primary-source URL to each answer in both answers pages.
 *
 * The QA arrays are in the same order in answers.html and ar/answers.html, so a
 * single URL list serves both. Empty string = no link for that answer.
 *
 * Run:  node scripts/sources.mjs
 */
import fs from 'node:fs';

const URLS = [
  'https://www.playstation.com/en-us/games/grand-theft-auto-vi/',
  'https://blog.playstation.com/2026/11/10/pre-load-grand-theft-auto-vi-on-ps5-starting-today/',
  'https://www.theverge.com/games/1025271/gta-vi-storage-space-rockstar-games',
  'https://www.techpowerup.com/354448/gta-6-will-need-up-to-212-gb-of-storage-pre-load-now-starts-november-10',
  'https://taketwointeractivesoftwareinc.gcs-web.com/news-releases/news-release-details/rockstar-games-announces-pre-orders-grand-theft-auto-vi/',
  'https://www.vice.com/en/article/gta-6-pre-order-bonuses-ultimate-edition/',
  'https://dotesports.com/gta/guides/gta-6-editions-pre-order-bonuses',
  'https://www.talkesport.com/gta-6/gta-6-xbox-game-pass-launch/',
  'https://timesaver.gg/blog/gta-6-crossplay-ps5-xbox',
  'https://www.theverge.com/games/997116/twitch-ceo-gta-vi-multiplayer-coming-in-2027',
  '', // PC date — Bloomberg, paywalled
  'https://news.xbox.com/en-us/2026/11/10/grand-theft-auto-6-comes-to-xbox-cloud-gaming-november-19/',
  'https://www.theverge.com/games/1030749/rockstar-gta-6-30fps-ps5-pro-pssr-ray-tracing',
  'https://screenrant.com/gta-6-map-size-comparison-official-reveal-rockstar/',
  'https://www.xbox.com/en-US/games/grand-theft-auto-vi',
  'https://www.playstation.com/en-us/games/grand-theft-auto-vi/',
  'https://news.xbox.com/en-us/2026/11/10/grand-theft-auto-6-comes-to-xbox-cloud-gaming-november-19/',
  '', // recording clips — platform UI, no single primary source
  '', // "what do I need" — this page
];

for (const file of ['answers.html', 'ar/answers.html']) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('srcUrl:')) {
    console.log(`skip (already done): ${file}`);
    continue;
  }
  let i = 0;
  html = html.replace(/^ {6}src:('[^\n]*?')( \},|,$)/gm, (m, rest, tail) => {
    const url = URLS[i++] || '';
    if (!url) return m;
    return tail === ' },'
      ? `      src:${rest}, srcUrl:'${url}' },`
      : `      src:${rest},\n      srcUrl:'${url}',`;
  });
  fs.writeFileSync(file, html);
  console.log(`${file}: matched ${i} answers, links added=${URLS.filter(Boolean).length}`);
}
