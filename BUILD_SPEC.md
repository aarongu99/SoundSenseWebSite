# SoundSense Website — Build Spec for Claude Code

**Purpose of this doc:** everything Claude Code needs to finish the SoundSense marketing site. Existing files in this repo are the ground truth — match their patterns. Do not improvise brand, voice, or structure.

**How to use:** open this folder in Claude Code, say "read BUILD_SPEC.md and build the remaining pages listed in section 8."

---

## 1. Product context

**SoundSense** is an iOS sound awareness app for deaf and hard of hearing users. It learns your specific sounds (doorbell, smoke alarm, name called), understands context (home vs. city, day vs. night), and scales alerts to urgency. 100% on-device processing — no cloud, no uploads, no audio stored.

**Built at:** Rochester Institute of Technology (RIT), home to the National Technical Institute for the Deaf (NTID).
**Founder:** Aaron Guss (grad student, RIT Saunders MIS program).
**Tagline:** *Hear what matters.*
**Positioning:** Privacy-first. Community-shaped. Free core, paid upgrades when they earn it.

---

## 2. Tech & constraints

- **Stack:** Static HTML + CSS + JS. No framework, no build step.
- **Hosting:** GitHub → Vercel (auto-deploy on push).
- **Browser support:** Evergreen + iOS Safari 16+.
- **No localStorage, no sessionStorage** — the mockup uses `onsubmit` handlers for form demos. Keep that pattern.
- **Accessibility:** WCAG 2.1 AA. This is a deaf-community product. Accessibility is the product, not a checklist.
- **Reduced-motion:** honored via media query (already in `css/main.css`).

---

## 3. File structure

```
soundsense-site/
├── index.html                    ✅ DONE
├── how-it-works.html             ✅ DONE
├── pricing.html                  ✅ DONE
├── download.html                 ✅ DONE
├── about.html                    ✅ DONE
├── faq.html                      ⬜ TO BUILD
├── contact.html                  ⬜ TO BUILD
├── press.html                    ⬜ TO BUILD
├── privacy.html                  ⬜ TO BUILD
├── terms.html                    ⬜ TO BUILD
├── accessibility.html            ⬜ TO BUILD
├── security.html                 ⬜ TO BUILD
├── 404.html                      ⬜ TO BUILD
├── thank-you.html                ⬜ TO BUILD
├── blog/
│   ├── index.html                ⬜ TO BUILD
│   ├── sound-awareness-guide.html         ⬜ TO BUILD
│   ├── on-device-vs-cloud-privacy.html    ⬜ TO BUILD
│   ├── comparing-sound-detection-apps.html ⬜ TO BUILD
│   ├── apple-sound-recognition-vs.html    ⬜ TO BUILD
│   └── battery-life-explained.html        ⬜ TO BUILD
├── for/
│   ├── deaf-adults.html                   ⬜ TO BUILD
│   ├── hard-of-hearing.html               ⬜ TO BUILD
│   ├── late-deafened-adults.html          ⬜ TO BUILD
│   ├── cochlear-implant-users.html        ⬜ TO BUILD
│   ├── parents-of-deaf-children.html      ⬜ TO BUILD
│   └── caregivers.html                    ⬜ TO BUILD
├── css/main.css                  ✅ DONE
├── js/main.js                    ✅ DONE
├── assets/                       (favicon, apple-touch-icon, og-image — placeholders, Aaron will provide)
├── robots.txt                    ⬜ TO BUILD
├── sitemap.xml                   ⬜ TO BUILD
├── vercel.json                   ⬜ TO BUILD
└── README.md                     ⬜ TO BUILD
```

**Total pages to build:** 21 HTML files + 4 config/docs files.

---

## 4. Already built — match these patterns exactly

Read these files before writing anything new. They are the canonical voice, structure, and SEO pattern.

- `index.html` — full homepage with all marketing sections (hero, problem, how it works, context, who it's for, privacy, founder, CTA)
- `how-it-works.html` — long-form feature deep dive with "pillar" sections
- `pricing.html` — 3-tier plan grid with FAQ tail
- `download.html` — dedicated landing for App Store conversion
- `about.html` — RIT/NTID story + founder note + principles
- `css/main.css` — shared styles (all design tokens, components, animations)
- `js/main.js` — reveal-on-scroll + nav scroll + FAQ accordion

**Original design mockup:** see `SoundSense-Homepage-Mockup.html` (if included in repo) for canonical voice and component library.

---

## 5. Brand system

### Colors (CSS variables in `css/main.css`)
```
--bg:         #FAF7F2    /* warm cream background */
--surface:    #FFFFFF
--brand:      #C2956B    /* caramel/tan — primary */
--brand-dark: #A87D55
--brand-light:#FFF5E6
--text:       #2C2218    /* warm dark brown */
--text-2:     #6B5B3E
--text-3:     #A89A82
--success:    #5B9A4F
--critical:   #D4473C
--border:     #EDE7D9
```

### Typography
- **Body:** DM Sans
- **Monospace:** DM Mono (used for data like "42 dB", "2:14 PM", timestamps)
- **No serif fonts.** Italic DM Sans at 400 weight is used as the `.accent` pattern for subheads — e.g. `<h2>Sound detection apps</h2><p class="accent">treat every sound the same.</p>`

### Voice
- **Warm, human, direct.** Not clinical. Not bro-techy. Not overly earnest.
- Short sentences. No em-dashes as decoration. No "unlock," "elevate," "journey," "game-changer."
- Honest about limitations. When a feature has a tradeoff, name the tradeoff (see FAQ "battery" answer).
- **The community is the audience, not the subject.** Write "you" when talking to deaf/HoH users directly. Write "deaf and hard of hearing users" when describing the product to everyone else. Never "the deaf" or "hearing-impaired."

### Design moves (per Aaron's design guidelines)
- **Distinctive move:** the two-column comparison layout (bad vs. good), the contextual scene cards ("Home · 2:00 PM · Smoke alarm → critical"), and the warm-cream + caramel palette are the identity. Use them. Don't reach for purple gradients, glass cards, centered hero-with-two-buttons clichés, or icon-circle grids.
- **Don't add** generic "trusted by" logo bars, floating gradient blobs, glassmorphism.
- **Do reuse** existing CSS classes: `.card`, `.cred`, `.how-card`, `.ex-card`, `.plan`, `.sec-head`, `.accent`, `.eyebrow`, `.reveal`.

---

## 6. Shared shell

Every page uses this exact structure. Copy from any existing page — `about.html` is the cleanest template.

### Head (replace `{{...}}` placeholders per page)
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#FAF7F2">
<title>{{TITLE}}</title>
<meta name="description" content="{{DESC}}">
<meta name="keywords" content="{{KEYWORDS}}">
<link rel="canonical" href="https://soundsense.app{{PATH}}">
<meta property="og:type" content="{{OG_TYPE}}">
<meta property="og:url" content="https://soundsense.app{{PATH}}">
<meta property="og:title" content="{{TITLE}}">
<meta property="og:description" content="{{DESC}}">
<meta property="og:image" content="https://soundsense.app/assets/og-image.png">
<meta property="og:site_name" content="SoundSense">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{TITLE}}">
<meta name="twitter:description" content="{{DESC}}">
<meta name="twitter:image" content="https://soundsense.app/assets/og-image.png">
<link rel="icon" href="/assets/favicon.ico">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400;1,9..40,500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/main.css">
{{JSON_LD}}
</head>
```

### Nav (every page — add `aria-current="page"` to active link)
Copy from `about.html`. Nav order: How it works / Pricing / About / FAQ / Download (CTA button).

### Footer (every page — identical on every page)
Copy from `about.html` footer block. Do not modify.

### Closing scripts
```html
<script src="/js/main.js" defer></script>
```

---

## 7. SEO rules for every page

Non-negotiable, every page:
- [ ] `<title>` under 60 characters, includes primary keyword
- [ ] `<meta description>` 140–160 characters, benefit-led, ends with soft CTA where natural
- [ ] Canonical URL
- [ ] Full OG + Twitter Card tags
- [ ] `<html lang="en">` and viewport meta
- [ ] Exactly one `<h1>`, keyword-relevant
- [ ] Clean heading hierarchy (h1 → h2 → h3, no skips)
- [ ] Semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`) — the shell already does this
- [ ] Images (when added) have descriptive `alt` — decorative → `alt=""`
- [ ] Internal links use descriptive anchor text, never "click here"
- [ ] JSON-LD structured data appropriate to the page type (schema noted per page below)

Performance:
- [ ] Fonts load with `display=swap` (already set)
- [ ] No layout shift — use existing component sizes, don't add unreserved image slots
- [ ] Scripts use `defer`
- [ ] CSS is shared (already done)

---

## 8. Pages to build

For each page below: `PATH`, `TITLE`, `DESCRIPTION`, `KEYWORDS`, `SCHEMA`, `SECTIONS` (what to include), `COPY NOTES` (voice + content seeds).

---

### 8.1 `faq.html`

- **Path:** `/faq.html`
- **Title:** `SoundSense FAQ — Questions About Sound Awareness for Deaf Users`
- **Description:** `Common questions about SoundSense. Battery, privacy, Apple's Sound Recognition, hearing aid compatibility, Android roadmap. Honest answers.`
- **Keywords:** `SoundSense FAQ, deaf app questions, sound awareness battery, on-device privacy, Apple Sound Recognition comparison`
- **Schema:** `FAQPage` — include every Q&A in the JSON-LD `mainEntity` array.
- **Sections:**
  1. Hero: eyebrow "FAQ" / h1 "Questions" / accent "we get asked a lot." / body paragraph pointing to `mailto:support@soundsense.app`
  2. FAQ accordion (use `.faq-item` / `.faq-trigger` / `.faq-answer` from existing CSS; JS already handles the accordion)
  3. Final CTA (reuse `.final-cta` block)
- **Copy notes:** Use the exact FAQ content from the original mockup (lines 631–673 of `SoundSense-Homepage-Mockup.html`). Include at minimum these 8 questions:
  1. "Does this drain my battery?"
  2. "Will this work if my phone is in another room?"
  3. "Does this replace my hearing dog or flashing doorbell?"
  4. "What actually happens to my audio?"
  5. "How is this different from Apple's Sound Recognition?"
  6. "Does it work with my hearing aids or cochlear implant?"
  7. "When will Android be available?"
  8. "Can a family member or caregiver get alerts for me?"
  
  Add 4 more for depth: "Does it work offline?" / "What sounds can it detect by default?" / "Can I use this with my Apple Watch?" / "What languages does the interface support?"

---

### 8.2 `contact.html`

- **Path:** `/contact.html`
- **Title:** `Contact SoundSense — Support, Press, Partnerships`
- **Description:** `Get in touch with SoundSense. Support, press, security, and partnership inquiries. A real person reads every message.`
- **Keywords:** `contact SoundSense, deaf app support, accessibility partnerships, SoundSense press`
- **Schema:** `ContactPage`
- **Sections:**
  1. Hero: "Get in touch." / accent "A real person reads every message."
  2. Four contact cards (2×2 grid using `.creds-grid`): Support, Press, Security, Partnerships — each a card with an email mailto link.
  3. Optional contact form (static, POST to `/thank-you.html`) — name, email, reason dropdown (Support / Press / Security / Partnership / Other), message textarea. **Note:** Since this is static HTML, the form either needs Formspree/Basin/Netlify Forms, or can just be a mailto link. Default: render form pointed at a placeholder action URL with a comment `<!-- TODO: wire to Formspree or similar -->` for Aaron to replace.
  4. Office hours / response time note: "We reply within 2 business days. For urgent safety issues, please call your local emergency services — SoundSense is a supplement, not a replacement for life-safety equipment."
- **Copy notes:** No fake phone numbers. No fake address beyond "Rochester, NY."

---

### 8.3 `press.html`

- **Path:** `/press.html`
- **Title:** `Press & Media Kit — SoundSense`
- **Description:** `Press resources for SoundSense. Boilerplate, founder bio, brand assets, and contact. For journalists covering accessibility and deaf community tech.`
- **Keywords:** `SoundSense press kit, deaf tech press, accessibility app media, NTID RIT startup`
- **Schema:** `AboutPage`
- **Sections:**
  1. Hero: "Press kit." / "Everything you need for a story."
  2. Boilerplate copy block (2-3 sentence company description, copy-paste ready, use a `.card` with `<code>` or a text area)
  3. Fact sheet: founded 2025, based in Rochester NY, built at RIT/NTID, free on App Store, on-device processing. Use a two-column list.
  4. Founder bio (Aaron Guss — pull from `about.html`)
  5. Brand assets section: list downloadable zip (`/assets/soundsense-press-kit.zip` — placeholder link), note logo variants available
  6. Press contact: `press@soundsense.app`
- **Copy notes:** Keep it factual. No hype.

---

### 8.4 `privacy.html`

- **Path:** `/privacy.html`
- **Title:** `Privacy Policy — SoundSense`
- **Description:** `SoundSense privacy policy. What we collect, what we don't, how on-device processing works, your rights. Plain English.`
- **Keywords:** `SoundSense privacy, on-device sound processing, deaf app data policy, GDPR CCPA`
- **Schema:** none needed (legal page)
- **Sections:** Plain-English privacy policy with these headings (use `<h2>` / `<h3>`):
  1. "What SoundSense does with audio" → on-device only, buffers discarded, never uploaded
  2. "What we collect" → only crash reports and anonymous usage metrics, both opt-in. Email only if user submits a form.
  3. "What we do not collect" → audio, transcripts, fingerprints, location (unless user explicitly enables context mode)
  4. "Third parties" → Apple (App Store), any analytics vendor if used, and that's it
  5. "Your rights" → access, deletion, opt-out; email `privacy@soundsense.app`
  6. "Children" → app is rated 4+; no accounts means no collected data from any user
  7. "Changes to this policy" → we'll email if material
  8. "Contact" → `privacy@soundsense.app`
  9. "Effective date" → dynamic, placeholder "April 2026"
- **Copy notes:** This is legally meaningful — keep it simple and accurate. Use "we" and "you" language. No Latin legalese. Add a one-line disclaimer at top: "This is the short, honest version. If you want the long, lawyer-written version, email privacy@soundsense.app — we'll send it."

---

### 8.5 `terms.html`

- **Path:** `/terms.html`
- **Title:** `Terms of Service — SoundSense`
- **Description:** `SoundSense terms of service. Your rights, our limits, and the key thing: SoundSense supplements life-safety equipment, it does not replace it.`
- **Keywords:** `SoundSense terms, deaf app terms of service, accessibility app legal`
- **Schema:** none
- **Sections:** `<h2>` headings:
  1. **"The most important thing"** (put this first, bold): SoundSense is a supplement, not a replacement. Keep your smoke detectors, hearing dogs, flashing doorbells, and emergency notification systems.
  2. "Acceptable use"
  3. "Your content" (the sound fingerprints you train — you own them, we don't)
  4. "Free tier commitment" (free tier stays free)
  5. "Subscription terms" (for Plus when it launches — monthly, cancel anytime, no auto-charge after trial)
  6. "Disclaimer of warranties" (plain English — "we work hard, but software can fail, which is why this isn't life-safety equipment")
  7. "Limitation of liability"
  8. "Governing law" — New York, USA
  9. "Changes"
  10. "Contact"
- **Copy notes:** Section 1 is not boilerplate — it's a safety statement. Make it visually prominent (use a `.card` with critical-color border).

---

### 8.6 `accessibility.html`

- **Path:** `/accessibility.html`
- **Title:** `Accessibility — SoundSense`
- **Description:** `SoundSense is built for the deaf and hard of hearing community. Our accessibility commitments, WCAG 2.1 AA compliance, and how to report issues.`
- **Keywords:** `SoundSense accessibility, WCAG 2.1 AA deaf app, accessible iOS app, ASL support`
- **Schema:** none
- **Sections:**
  1. Hero: "Accessibility." / accent "is the product, not the checklist."
  2. "Our commitments" (3 cards): WCAG 2.1 AA conformance / VoiceOver + Dynamic Type + Reduced Motion / ASL videos for all tutorial content
  3. "Standards we follow" — WCAG 2.1 AA, Section 508, EN 301 549, ADA guidance
  4. "Known limitations" — honest list. e.g. "Not all legacy iOS versions supported" / "Not yet available in ASL interface mode beyond tutorial videos" / "Website does not yet include full ASL video translation of all marketing copy — in progress"
  5. "Report an issue" — `accessibility@soundsense.app` + a form link
  6. "Statement effective date"
- **Copy notes:** This page is credibility. Do not fake compliance. List real limitations openly — it's the point of the page.

---

### 8.7 `security.html`

- **Path:** `/security.html`
- **Title:** `Security — SoundSense | On-Device Processing & Zero-Upload`
- **Description:** `How SoundSense stays secure. On-device ML, no audio upload, end-to-end encrypted sync for settings only, responsible disclosure.`
- **Keywords:** `SoundSense security, on-device ML privacy, sound app encryption, responsible disclosure deaf app`
- **Schema:** none
- **Sections:**
  1. Hero: "Security." / accent "by architecture, not by policy."
  2. "What's on your device" (card block, reuse the list pattern from `how-it-works.html` pillar 04): classifier runs locally, audio never written to disk, model ships with app
  3. "What syncs" (optional, user-controlled): sound names and settings only — never audio, never fingerprints
  4. "Encryption" — iCloud sync uses Apple's end-to-end encrypted containers; no separate SoundSense server
  5. "Permissions we ask for" (list): Microphone (required), Notifications (required), Location (optional for context)
  6. "Responsible disclosure" — `security@soundsense.app`, commit to acknowledge within 48 hours, credit in release notes if researcher consents
  7. "Vendor security" — list any third-party SDKs used (analytics, crash reporting). Honest about what data each receives.
- **Copy notes:** Be specific. Researchers and privacy-conscious users read this page carefully.

---

### 8.8 `404.html`

- **Path:** `/404.html`
- **Title:** `Page Not Found — SoundSense`
- **Description:** `The page you're looking for doesn't exist. Here's the homepage.`
- **Schema:** none
- **Sections:**
  1. Centered message: "404." (big) / "This page doesn't exist." (accent) / short body / link grid to main pages (Home / How it works / Pricing / FAQ / Contact)
- **Copy notes:** Keep it short, a bit warm. No cute 404 stock animations.
- **Vercel config:** `vercel.json` must route unknown paths here.

---

### 8.9 `thank-you.html`

- **Path:** `/thank-you.html`
- **Title:** `Thanks — SoundSense`
- **Description:** `Thanks for reaching out. We'll reply within 2 business days.`
- **Schema:** none, add `<meta name="robots" content="noindex">` so it doesn't rank
- **Sections:**
  1. Centered confirmation message, link back to home, note about response time
- **Copy notes:** Very short page. No follow-up marketing.

---

### 8.10 `blog/index.html`

- **Path:** `/blog/`
- **Title:** `SoundSense Blog — Sound Awareness, Accessibility, and Hearing Tech`
- **Description:** `Long-form writing on sound awareness, on-device privacy, deaf tech, and how SoundSense works. From the team at RIT.`
- **Keywords:** `deaf tech blog, sound awareness writing, accessibility articles, hearing loss technology`
- **Schema:** `Blog`
- **Sections:**
  1. Hero: "Writing." / "Long reads on sound, silence, and the tech between."
  2. Post grid (3 columns, reuse `.creds-grid` or `.how-grid`). Each card: date, title, 1-2 line excerpt, "Read more" link.
  3. Newsletter signup card at bottom (email input, placeholder submit handler)
- **Copy notes:** Order posts newest first. Include all 5 blog posts listed below.

---

### 8.11–8.15 Blog posts (5 posts)

Each blog post uses this structure:
- Hero with `eyebrow` (category), `h1` title, publish date, read time
- Article body in `<article>` with `<h2>` / `<h3>` / `<p>` — keep line length comfortable (max-width ~720px)
- Author byline at bottom (Aaron Guss, founder)
- Related posts footer (link to 2 other blog posts)
- Final CTA to `/download.html`
- **Schema:** `BlogPosting` with author, datePublished, image

Posts to build:

**8.11** — `blog/sound-awareness-guide.html`
- **Title:** `A Guide to Sound Awareness for Deaf and Hard of Hearing Users`
- **Description:** `What sound awareness means, why generic detection apps fall short, and what to look for in a tool that actually works.`
- **Keywords:** `sound awareness guide, deaf sound detection, hearing loss technology guide`
- **~1500 words.** Cover: what sound awareness is, who it helps, the failure modes of first-gen apps, the three things a good tool must do (recognize specific sounds, understand context, scale urgency).

**8.12** — `blog/on-device-vs-cloud-privacy.html`
- **Title:** `On-Device vs. Cloud Sound Processing — Why It Matters`
- **Description:** `Why SoundSense runs its ML model entirely on your phone. What you trade in cloud processing, what you gain in privacy, and what Apple's silicon makes possible.`
- **Keywords:** `on-device ML vs cloud, Neural Engine sound classification, iOS privacy, no cloud audio`
- **~1200 words.** Cover: cloud latency & privacy tradeoffs, Apple Neural Engine capabilities, how SoundSense's classifier fits in under ~20MB, why this is a new option in 2026 that wasn't viable in 2020.

**8.13** — `blog/comparing-sound-detection-apps.html`
- **Title:** `Comparing Sound Detection Apps for Deaf Users — What to Look For`
- **Description:** `How to evaluate sound detection and awareness apps for deaf and hard of hearing users. Feature-by-feature comparison framework.`
- **Keywords:** `sound detection app comparison, deaf app review, hearing loss app features`
- **~1400 words.** Cover: criteria matrix (privacy / custom sounds / context awareness / battery / watch support / cost). Discuss the category generally — don't name-and-shame specific competitors.

**8.14** — `blog/apple-sound-recognition-vs.html`
- **Title:** `SoundSense vs. Apple Sound Recognition — When to Use Which`
- **Description:** `Apple's built-in Sound Recognition is a solid baseline. Here's where it's great, where SoundSense adds value, and how to use both together.`
- **Keywords:** `Apple Sound Recognition comparison, iOS accessibility sound, SoundSense vs Apple`
- **~1000 words.** Respectful comparison. Apple's feature is good for broad categories. SoundSense adds: custom sounds (your specific doorbell), context urgency, Apple Watch tight integration, full timeline. Both can run together.

**8.15** — `blog/battery-life-explained.html`
- **Title:** `Battery Life with SoundSense — What to Expect`
- **Description:** `Honest numbers on battery drain, how layered detection keeps it reasonable, and what to do if you need more runtime.`
- **Keywords:** `SoundSense battery life, always-on mic battery, iPhone background audio battery`
- **~900 words.** Specific numbers: 3-7% per hour of active listening. Compare to Spotify (5-10%), GPS nav (15-20%). Explain the layered detection model (energy monitor → full classifier only on trigger). Tips: low-power mode behavior, charge-while-sleeping usage pattern.

---

### 8.16–8.21 "For [audience]" pages (6 pages) — high-intent SEO

Each page is an audience-specific landing page targeting long-tail search. Structure:
- Hero: "For [audience]" eyebrow / h1 specific to audience / empathetic sub
- "What SoundSense does for you" (3-4 specific scenarios — make them real and specific)
- "How it fits into your life" (narrative paragraph — day in the life)
- Testimonial quote card (placeholder — mark as `<!-- TODO: real quote from user research -->`)
- "How to get started" (3-step)
- Final CTA + FAQ tail (2-3 audience-specific Qs)
- **Schema:** `WebPage`

**8.16** `for/deaf-adults.html`
- **Title:** `SoundSense for Deaf Adults — Sound Awareness That Actually Works`
- **Description:** `A sound awareness app built with the deaf community, not for it. Custom sound training, context-aware alerts, 100% on-device.`
- Scenarios: waking up on time, answering the door, kitchen safety, workplace meetings.

**8.17** `for/hard-of-hearing.html`
- **Title:** `SoundSense for Hard of Hearing Adults — Fill the Gaps in Your Hearing`
- **Description:** `For adults with partial hearing loss. Catch the sounds you're missing. Works alongside hearing aids, not instead of them.`
- Scenarios: hearing the doorbell when your aids are out, late-night safety, cafe conversations (contextual loud sounds).

**8.18** `for/late-deafened-adults.html`
- **Title:** `SoundSense for Late-Deafened Adults — Adjusting to Hearing Loss`
- **Description:** `For adults adjusting to hearing loss. Rebuild sound awareness on your terms, with a tool that respects the transition.`
- Scenarios: the first months after diagnosis, keeping routines that depended on hearing, feeling safe at home again.

**8.19** `for/cochlear-implant-users.html`
- **Title:** `SoundSense for Cochlear Implant Users — Alerts When Devices Are Off`
- **Description:** `Cochlear implant users remove devices at night and while swimming. SoundSense fills the silence. Works on iPhone alone.`
- Scenarios: sleeping without the processor, swimming / showering, device malfunction, surgery recovery.

**8.20** `for/parents-of-deaf-children.html`
- **Title:** `SoundSense for Parents of Deaf Children — Safety Without Hovering`
- **Description:** `For parents and families supporting a deaf or hard of hearing child. Give them independence with a safety net you both trust.`
- Scenarios: kid home alone for the first time, sleepovers, babysitters, family trips.
- **Note:** Pro-tier caregiver alerts are the natural upsell here — mention but don't oversell (they're not out yet).

**8.21** `for/caregivers.html`
- **Title:** `SoundSense for Caregivers — Peace of Mind, Not Surveillance`
- **Description:** `Supporting a deaf or hard of hearing family member? SoundSense runs on their phone, respects their privacy, and (with Pro) can alert you to emergencies.`
- Scenarios: elderly parent with late-onset hearing loss, adult sibling living independently, shared household awareness.
- **Tone:** respect the user's autonomy. The person wearing the phone is the user, the caregiver is a secondary audience. Don't write like it's a surveillance tool.

---

## 9. Deploy config files

### 9.1 `robots.txt`
```
User-agent: *
Allow: /
Disallow: /thank-you.html

Sitemap: https://soundsense.app/sitemap.xml
```

### 9.2 `sitemap.xml`
Generate one `<url>` entry per page. Include `<lastmod>` with today's date and `<changefreq>` + `<priority>`:
- Homepage: priority 1.0, weekly
- how-it-works, pricing, download: 0.9, monthly
- for/*, blog/*: 0.8, monthly
- about, faq, contact, press: 0.7, monthly
- legal pages: 0.3, yearly
- 404, thank-you: exclude from sitemap

### 9.3 `vercel.json`
```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "redirects": [
    { "source": "/index", "destination": "/", "permanent": true }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/css/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/js/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ],
  "errorPage": "/404.html"
}
```

### 9.4 `README.md`
Include:
- What this is (1 paragraph)
- How to run locally (`npx serve .` or similar)
- How to deploy (push to GitHub, connect Vercel, done)
- Folder structure
- How to add a new page (copy existing, update title/meta/content, add to sitemap.xml, link from nav if needed)
- Brand colors/fonts reference
- Contact for questions: aaron@soundsense.app

---

## 10. Post-build checklist

Before Aaron pushes to GitHub, verify:

- [ ] Every page has unique `<title>` and `<meta description>`
- [ ] Canonical URLs are correct on every page
- [ ] Nav is identical across all pages (except `aria-current="page"` on the active link)
- [ ] Footer is identical across all pages
- [ ] All internal links resolve (no 404s to your own pages)
- [ ] `sitemap.xml` includes every public page
- [ ] `robots.txt` points to sitemap
- [ ] No `localStorage` or `sessionStorage` in any page
- [ ] All `<img>` tags have `alt` attributes
- [ ] JSON-LD structured data validates against schema.org
- [ ] Run Lighthouse: aim for 90+ on Performance, Accessibility, Best Practices, SEO
- [ ] Test in iOS Safari (real device if possible)
- [ ] Test with VoiceOver — the community this is for will
- [ ] Reduced-motion preference doesn't break any animations

---

## 11. Things to push back on

If Claude Code is asked to do any of these, flag them as off-brand:

- Purple-to-pink gradients
- Glassmorphism / frosted blur cards
- Centered hero with "Build [thing] faster than ever" + two buttons
- Three-column feature grid with lucide icons in colored circles
- Generic "trusted by" logo bars with fake logos
- Floating gradient blobs
- Inter font
- Em-dashes as visual decoration
- "Unlock," "elevate," "journey," "game-changer" in copy
- Fake testimonials (mark placeholder quotes clearly with `<!-- TODO -->`)
- Fake enterprise logos
- Any feature the product doesn't actually have

---

**End of spec.** Questions: `aaron@soundsense.app`.
