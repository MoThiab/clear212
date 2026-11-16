# Deploy Clear212

Plain static files — no build step, no framework, no server. Any static host works;
the config here targets Vercel because that is where `mo-automation.com` already
lives.

Target URL: **https://clear212.mo-automation.com**

---

## Automatic — this is how it works now

The repository is connected to Vercel through Git, so **every push to `main`
deploys itself**. There is nothing to run locally.

```bash
cd "I:/AI Projs/GTA6_Rich"
git add -A
git commit -m "..."
git push          # that is the whole deploy
```

Production: `main` → `https://clear212.mo-automation.com`
Preview: every other branch and pull request gets its own `*.vercel.app` URL.

## Manual override (rarely needed)

```bash
npx --yes vercel --prod
```

Only if a push did not trigger a build. If that starts happening repeatedly, the
Git connection has dropped — reconnect it under **Settings → Git** on the
`clear212` project.

## Domain

Already done: `clear212.mo-automation.com` points at this project.
Vercel dashboard → project **clear212** → Settings → Domains.

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
| Affiliate URLs | `answers.html` → `PRODUCTS` | empty |
| Formspree endpoint for launch emails | `index.html` → `FORMSPREE_ENDPOINT` | empty — **do not reuse Qabda's form**, it would mix a GTA audience into the Qabda list |
