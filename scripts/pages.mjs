/**
 * The one mapping from a file on disk to its public URL on the site.
 *
 * seo.mjs, indexnow.mjs and lastmod.mjs all need this; keeping it in one place
 * means adding a page is a single edit instead of three that drift apart.
 */
export const PAGES = [
  ['index.html', '/'],
  ['answers.html', '/answers'],
  ['ar/answers.html', '/ar/answers'],
  ['ar/index.html', '/ar'],
  ['tracker.html', '/tracker'],
  ['ar/tracker.html', '/ar/tracker'],
  ['privacy.html', '/privacy'],
  ['ar/privacy.html', '/ar/privacy'],
  ['terms.html', '/terms'],
  ['ar/terms.html', '/ar/terms'],
  ['refunds.html', '/refunds'],
  ['ar/refunds.html', '/ar/refunds'],
  ['disclosure.html', '/disclosure'],
  ['ar/disclosure.html', '/ar/disclosure'],
  ['contact.html', '/contact'],
  ['ar/contact.html', '/ar/contact'],
];

export const URLS = Object.fromEntries(PAGES);
