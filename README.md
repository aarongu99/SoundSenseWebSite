# SoundSense Website

Static HTML marketing site for SoundSense — the sound awareness iOS app for deaf and hard of hearing users. Built at RIT with NTID.

## Status

**Complete build.** 21 HTML pages, shared `css/main.css` and `js/main.js`, deploy configs, and the press kit placeholder. See `BUILD_SPEC.md` for the full content and SEO spec.

**Pages shipped:**

- Core: `index.html`, `how-it-works.html`, `pricing.html`, `download.html`, `about.html`
- Support & trust: `faq.html`, `contact.html`, `press.html`, `privacy.html`, `terms.html`, `accessibility.html`, `security.html`
- Utility: `404.html`, `thank-you.html`
- Blog: `blog/index.html` + 5 long-form posts (`sound-awareness-guide`, `on-device-vs-cloud-privacy`, `comparing-sound-detection-apps`, `apple-sound-recognition-vs`, `battery-life-explained`)
- Audience landing pages: `for/deaf-adults.html`, `for/hard-of-hearing.html`, `for/late-deafened-adults.html`, `for/cochlear-implant-users.html`, `for/parents-of-deaf-children.html`, `for/caregivers.html`

**Deploy configs:** `robots.txt`, `sitemap.xml`, `vercel.json`.

## Run locally

No build step. Any static server will do:

```bash
npx serve .
```

Then open `http://localhost:3000`.

## Deploy to Vercel

1. Push to GitHub.
2. Import the repo into Vercel (vercel.com → Add New → Project).
3. Framework preset: **Other**. No build command. Output directory is `/`.
4. Deploy.
5. Add the custom domain in Vercel project settings → Domains.

`vercel.json` handles clean URLs, the 404 route, security headers, and immutable caching for `/css/*` and `/js/*`.

## Folder structure

```
soundsense-site/
├── index.html                Homepage
├── how-it-works.html         Product deep dive
├── pricing.html              3-tier pricing
├── download.html             App Store landing
├── about.html                Company + founder
├── faq.html                  12 Q&As with FAQPage schema
├── contact.html              4 contact cards + form
├── press.html                Boilerplate, fact sheet, brand assets
├── privacy.html              Plain-English privacy policy
├── terms.html                Terms with safety-first statement
├── accessibility.html        Commitments, standards, limitations
├── security.html             On-device architecture, disclosure
├── 404.html                  Warm error page
├── thank-you.html            Form confirmation (noindex)
├── blog/
│   ├── index.html            Post grid + newsletter signup
│   └── [5 posts].html        Long-form essays
├── for/
│   └── [6 audiences].html    Audience landing pages
├── css/main.css              Shared styles — all tokens, components, reduced-motion
├── js/main.js                Reveal-on-scroll, nav scroll, FAQ accordion
├── assets/                   Favicon, apple-touch-icon, og-image (placeholders)
├── robots.txt                Blocks /thank-you.html, points to sitemap
├── sitemap.xml               All public pages
├── vercel.json               Security headers, clean URLs, errorPage
├── BUILD_SPEC.md             Complete build spec (authoritative)
└── README.md                 This file
```

## Adding a new page

1. Copy `about.html` as the cleanest template for the shell (head, nav, footer).
2. Update `<title>`, `<meta description>`, `<link rel="canonical">`, OG/Twitter tags, and the JSON-LD schema block.
3. If it should appear in the nav, add to every nav block (5 files at minimum: `index`, `how-it-works`, `pricing`, `about`, `faq`, `download`, + any new page).
4. Add the `aria-current="page"` attribute on the active nav link for that page.
5. Add the URL to `sitemap.xml` with appropriate priority and lastmod.
6. If it is a new top-level section, link it from the footer.

## Brand quick reference

- **Palette:** cream `#FAF7F2` bg, caramel `#C2956B` brand, warm dark `#2C2218` text, success `#5B9A4F`, critical `#D4473C`.
- **Fonts:** DM Sans (body, UI) + DM Mono (data, timestamps). No other fonts.
- **Voice:** warm, direct, honest. "You" when writing to deaf/HoH users, "deaf and hard of hearing users" when writing about them.
- **Design moves:** bad/good two-column compare, contextual scene cards, 1px warm borders (no shadows).

Full details in `BUILD_SPEC.md` sections 5 and 11.

## Pre-launch checklist

Before going live, verify:

- [ ] Real `assets/favicon.ico`, `apple-touch-icon.png`, and `og-image.png` are in place (placeholders now).
- [ ] Real `assets/soundsense-press-kit.zip` exists (referenced from `press.html`).
- [ ] Form action on `contact.html` is pointed at Formspree / Basin / Netlify Forms (currently a placeholder `onsubmit` redirect).
- [ ] App Store link in `download.html` hero points to a real App Store listing.
- [ ] `<!-- TODO -->` placeholder quotes in each `for/*.html` page are replaced with real user quotes from interviews.
- [ ] Run Lighthouse on 3 sample pages (home, blog post, audience page). Target 90+ on Performance, Accessibility, Best Practices, SEO.
- [ ] Validate the JSON-LD structured data on every page with schema.org's validator.
- [ ] Test with VoiceOver on a real iPhone.
- [ ] Test with prefers-reduced-motion enabled — animations should flatten to instant.

## Contact

aaron@soundsense.app
