# Bright Sparks AI — Website Brief
## Everything Claude Code needs to build the Week 1 landing page

---

## Overview

Build a single-page landing site for brightsparks.ai. This is a bold, personality-driven launch page for a solo builder who ships AI-powered tools every week and writes about how he makes them. The site has three jobs: capture email subscribers, establish the brand, and link to products as they ship.

This is Week 1. There are zero products and zero subscribers. The site should feel alive and confident despite being new — like walking into a workshop where someone's clearly in the middle of building something interesting.

---

## Brand Identity

### Colour Palette

| Role | Colour | Hex | Usage |
|------|--------|-----|-------|
| Primary background | Deep navy | #0F1B2D | Page background, card backgrounds |
| Secondary background | Slightly lighter navy | #162236 | Cards, raised sections, hover states |
| Primary accent | Bright gold/amber | #F5A623 | CTAs, highlights, the bolt, links on hover |
| Secondary accent | Warm amber | #E8941A | Button hover states, secondary highlights |
| Tertiary accent | Electric blue | #3B82F6 | Tags, badges, subtle variety (use sparingly) |
| Body text | Warm off-white | #E8E0D4 | Primary body copy |
| Secondary text | Muted grey-cream | #9CA3AF | Supporting text, captions, meta info |
| Success/positive | Warm green | #22C55E | Form success states |

The navy and gold are drawn directly from the existing logo (yellow lightning bolt on dark navy). The palette should feel warm and energetic — not cold/corporate and not neon/hacker.

### Typography

Choose distinctive fonts. Avoid Inter, Roboto, Arial, Space Grotesk, and system defaults. Suggestions (pick what works, or find better):

- **Headings:** Something bold with character. Consider: Sora, Outfit, Satoshi, General Sans, or Clash Display. Should feel modern and slightly playful without being childish.
- **Body:** Clean and highly readable on dark backgrounds. Consider: DM Sans, Plus Jakarta Sans, or Nunito Sans.
- **Monospace (for tags/labels):** JetBrains Mono or IBM Plex Mono — used sparingly for product type tags and technical details.

### Logo

The logo is a gold lightning bolt. For the site:
- Extract the bolt shape as a flat SVG, filled with the gold accent (#F5A623). No shadow, no 3D effect.
- Use the bolt as favicon (on navy background, 32×32 and 16×16)
- The wordmark is "Bright Sparks AI" in the heading font, with "AI" optionally in the gold accent colour
- The bolt can sit to the left of the wordmark in the nav, or be used standalone as an icon

### Tone of Voice

**Builder-first, dry, direct, warm underneath.** This is someone who makes things every week and tells you honestly how it went. No startup jargon, no "revolutionising" anything, no "leverage AI to unlock potential." Just a person building useful (and sometimes fun) things with AI.

Copy rules:
- First person ("I build..." not "We build...")
- Short sentences. No padding.
- Specifics over vagueness ("every week" not "regularly")
- Allowed to be funny in small doses — dry observations, not jokes
- Confident but not arrogant. Enthusiastic but not breathless.
- British English spelling throughout

---

## Page Structure and Copy

### Nav Bar

Fixed/sticky. Minimal.

- **Left:** Bolt icon + "Bright Sparks AI" wordmark
- **Right:** "Builds" (scrolls to builds section) · "Newsletter" (scrolls to/links to Substack) · CTA button: "Get updates" (scrolls to email form)

On mobile: hamburger menu or just the bolt + CTA button.

---

### Section 1 — Hero

This is the most important section. 80% of visitors decide here.

**Layout:** Centred text, generous vertical padding. The bolt icon can appear large and subtle in the background (watermark/ghost style at low opacity) or as a small animated element. Keep it bold but not cluttered.

**Headline:**
```
I build AI-powered tools every week
and show you exactly how I make them.
```

**Subheadline:**
```
Apps, automations, agents, templates — and the occasional
thing that probably shouldn't work but does.
Follow the journey from build #1.
```

**Email form:**
- Placeholder text: "your@email.com"
- Button: "Follow the builds →"
- Microcopy below form: "One email per week. Unsubscribe anytime. No spam, obviously."

**Optional trust line (update as numbers grow):**
```
Newsletter #1 drops this week.
```
↓ Later becomes:
```
Joined by [X] builders and AI-curious people.
```

---

### Section 2 — What You Get

**Section heading:**
```
What to expect
```

Three cards/blocks in a row (stack on mobile):

**Card 1:**
- Icon: 🔨 or a hammer/tool icon
- Title: "A new build every week"
- Body: "Tools, apps, templates, automations — each one solving a real problem. Some for business, some for fun, all built with AI. The catalogue grows every week."

**Card 2:**
- Icon: 🔍 or a magnifying glass icon
- Title: "The honest breakdown"
- Body: "What I built, why I built it, how it actually works, and what I'd do differently. No '10x your productivity' nonsense. Just the real process."

**Card 3:**
- Icon: ⚡ or the bolt icon
- Title: "Free tools along the way"
- Body: "Not everything has a price tag. Some of the most interesting builds are free — and they're yours to use."

---

### Section 3 — Latest Builds

**Section heading:**
```
What I've been building
```

**Section subheading:**
```
New tools ship weekly. Here's what's live.
```

**Layout:** A grid that can hold 3–6 cards comfortably (2 or 3 columns on desktop, single column on mobile). For now, show one placeholder card and optionally one or two "coming soon" ghost cards.

**Placeholder card (Week 1):**
```
Title: "First build dropping this week"
Description: "Something useful. Possibly fun. Definitely built with AI.
Subscribe to find out what it is."
Tag: "COMING SOON"
```

**Future product card template (for reference — each card should show):**
- Product name
- One-line description (max ~15 words)
- Type tag: APP · TEMPLATE · AUTOMATION · AGENT · FREE TOOL
- Price or "Free"
- Link to product page or Gumroad listing

The tags should use the monospace font and be colour-coded:
- APP → electric blue
- TEMPLATE → gold
- AUTOMATION → a warm coral or orange
- AGENT → a bright green
- FREE TOOL → white/cream outline

---

### Section 4 — About (brief)

**Not a separate page — just a short section to add a human face.**

**Layout:** Text on one side, optional photo placeholder on the other (or skip the photo entirely for now).

**Copy:**
```
Built by Ian

I'm a developer in South Devon with a CS degree, a mass of mass of mass of mass side projects, and a mass of mass of mass of mass AI tools I use daily that started as "I wonder if I could..."

Bright Sparks AI is where I ship those ideas as real products — and document the entire process.
I work a 9-5. I build this on evenings and weekends. The plan is to ship something every week for a year and see what happens.
```

**Wait — don't use that placeholder copy as-is.** That's a starting point. Ian, you should rewrite this bit yourself — it's the one section that needs to actually sound like you, not like me approximating you. Two to three sentences max. Who you are, what this is, why you're doing it.

---

### Section 5 — Follow Along

**Section heading:**
```
Keep up with the builds
```

**Second email capture form** (same form as hero, repeated):
- Placeholder: "your@email.com"
- Button: "Get the weekly update →"

**Social links (icon + handle, horizontal row):**
- Substack: [your handle]
- X/Twitter: [your handle]
- LinkedIn: [your handle]
- Discord: "Coming soon" or omit until it exists

---

### Footer

Minimal. Dark background (same as page or slightly darker).

**Left side:**
```
© 2026 Bright Sparks AI
```

**Centre or right:**
```
Privacy Policy · Terms · Contact
```

**Bottom line (small, muted text):**
```
Built by Ian in South Devon with Claude ⚡
```

---

## Pages Beyond the Homepage

### Privacy Policy (/privacy)

**Required before collecting any email addresses.**

Must cover:
- What data you collect (email addresses via the signup form)
- Why (to send the weekly newsletter and occasional product updates)
- How it's stored (Kit/ConvertKit — name their data processing)
- Users' rights under UK GDPR (access, deletion, correction, portability)
- Cookie usage (if using Plausible Analytics, you can state "we use cookieless analytics that don't track individual users")
- Contact email for data requests
- ICO registration number (once registered)

Style this as a simple, readable page. Same nav and footer as homepage. Plain text, no legalese where avoidable.

Ian: Use a generator like Termly (free tier) to get the legal baseline, then clean up the language. Don't write this from scratch.

### Terms of Service (/terms)

Required before selling anything, but good to have in place now.

Must cover:
- Digital product terms (licence is personal use unless stated, no resale)
- AI disclaimer: "Products may include AI-generated content. Outputs may contain errors and should not be relied upon as professional advice."
- Limitation of liability
- Refund policy aligned with Consumer Rights Act 2015 + 14-day cooling-off period
- "This does not affect your statutory rights"
- UK law governs

Same approach: use Termly or Docular for the template, make it human-readable.

---

## Technical Specifications

### Stack
- Static site — HTML/CSS/JS, or Astro/Next.js static export if Ian prefers a framework
- Deploy to Vercel, connected to brightsparks.ai domain
- No backend needed. No database. No auth.

### Email Integration
- Connect signup forms to Kit (ConvertKit) — either via their JavaScript embed, their API, or a simple form POST to their endpoint
- This is the one integration that MUST work on launch day
- Both forms (hero + bottom section) should submit to the same Kit form/tag
- Success state: replace form with "You're in. Check your inbox. ⚡" message
- Error state: "Something went wrong. Try again or email [contact email] directly."

### Performance
- Target: < 2 second load time on mobile
- Optimise images (the bolt SVG should be tiny)
- Lazy load anything below the fold if needed
- No heavy JS frameworks unless justified by the build approach
- Preload the heading font to avoid flash of unstyled text

### Responsive Design
- Mobile-first. Most traffic will come from social media links on phones.
- Breakpoints: mobile (default), tablet (~768px), desktop (~1024px+)
- Hero should look excellent on a phone screen — headline readable without zooming, form easy to tap
- Cards stack to single column on mobile
- Nav collapses to bolt + CTA button on mobile

### SEO / Meta
- **Title tag:** "Bright Sparks AI — AI tools, apps and automations built weekly"
- **Meta description:** "I build AI-powered tools every week and show you how I make them. Apps, automations, agents, templates, and the occasional experiment. Follow the builds."
- **OG image:** Create a 1200×630 image — the bolt + "Bright Sparks AI" wordmark on navy background. Used for social link previews.
- **OG title:** Same as title tag
- **OG description:** Same as meta description
- Canonical URL: https://brightsparks.ai
- Add Google Search Console verification meta tag (Ian will need to generate this from GSC)

### Favicon
- Generate from the flat bolt SVG
- Sizes: 16×16, 32×32, apple-touch-icon 180×180
- Gold bolt on navy background (not transparent — it needs to be visible on both light and dark browser tabs)

### Analytics
- Plausible Analytics script tag — cookieless, no consent banner needed
- Ian will have the Plausible site ID / script URL

---

## What NOT to Build

Explicitly out of scope for Week 1:

- No product catalogue page (the homepage grid IS the catalogue for now)
- No separate About page
- No blog (Substack is the blog)
- No pricing page or membership info
- No testimonials section
- No animation beyond tasteful entrance transitions and hover states
- No chatbot or AI widget
- No login/auth system
- No CMS — content updates will be manual code changes for now
- No dark/light mode toggle (it's dark mode, full stop)

---

## Design Direction Notes

The site should feel like a maker's workshop, not a SaaS marketing page. Bold but not overwhelming. Some specific cues:

- The gold bolt/spark motif can appear subtly throughout — as decorative elements, section dividers, hover effects
- Consider a subtle grain or noise texture on the navy background to add depth
- Cards should feel solid and slightly raised — not flat, but not overly shadowed
- Generous whitespace between sections. Let it breathe.
- The overall impression should be: "someone interesting is building something here, and I want to see what's next"

Avoid: gradient meshes, glassmorphism, floating 3D objects, particle effects, or anything that screams "AI landing page template from 2024."
