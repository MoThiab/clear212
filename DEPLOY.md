# Deploy Clear212

Plain static files — no build step, no framework, no server. Any static host works;
the config here targets Vercel because that is where `mo-automation.com` already
lives.

Target URL: **https://clear212.mo-automation.com**

---

## Path A — Vercel CLI (recommended)

One-time setup, about two minutes:

```bash
cd "I:/AI Projs/GTA6_Rich"

# 1. Log in once. Opens the browser — pick the mo-automation team.
npx --yes vercel login

# 2. First deploy. Vercel asks whether to create a new project — say yes,
#    name it "clear212", scope = your mo-automation team.
npx --yes vercel --prod
```

After that, every update is one command:

```bash
npx --yes vercel --prod
```

## Path B — Vercel dashboard

Import the git repository (`I:/AI Projs/GTA6_Rich`) into a new Vercel project, or
drag the folder onto the Vercel deploy page. Nothing to configure — Vercel detects
a static site.

## Add the domain

Vercel dashboard → project **clear212** → Settings → Domains → add
`clear212.mo-automation.com`.

Vercel will ask for a CNAME at the DNS host. `mo-automation.com` already resolves to
Vercel's network, so verification should be quick. Until the domain is added, the
site is live on the automatic `*.vercel.app` URL.

## Notes

- `vercel.json` sets `cleanUrls`, so `/privacy` serves `privacy.html`. The
  `.html` links inside the pages still work.
- **Do not merge this with the Qabda project.** Qabda is a separate Vercel project
  (`qabda`, `outputDirectory: landing`) at `qabda.app`. Keep the two apart.
- After the first deploy, submit `https://clear212.mo-automation.com/sitemap.xml`
  to Google Search Console.

## What still needs you

| Item | Where | Status |
|---|---|---|
| Vercel login + project | your machine | needed once |
| Domain `clear212.mo-automation.com` | Vercel dashboard | not added yet (DNS does not resolve) |
| Affiliate URLs | `answers.html` → `PRODUCTS` | empty |
| Formspree endpoint for launch emails | `index.html` → `FORMSPREE_ENDPOINT` | empty — **do not reuse Qabda's form**, it would mix a GTA audience into the Qabda list |
