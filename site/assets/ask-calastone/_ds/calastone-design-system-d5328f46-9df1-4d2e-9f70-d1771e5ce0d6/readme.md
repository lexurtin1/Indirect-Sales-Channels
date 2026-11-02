# Calastone Design System

A brand & UI design system for **Calastone** — the London-headquartered fintech
that runs the world's largest funds network. This system gives design agents the
foundations, components, assets and full-screen recreations needed to produce
on-brand interfaces, decks and marketing artifacts.

> **Namespace:** components are exposed at `window.CalastoneDesignSystem_d5328f`
> (e.g. `const { Button, Hexagon } = window.CalastoneDesignSystem_d5328f`).
> Consumers link **one** file: `styles.css` (it `@import`s every token + font).

---

## 1 · Company & product context

**Calastone** provides connectivity and processing infrastructure to the global
funds industry — *order routing*, *settlements*, *payments*, *ETF servicing*,
*transfer-agency* and data services. Its core proposition: a single connection
to Calastone reaches the **whole market** — any message type, in any format,
translated and routed automatically — removing the cost, fragility and risk of
bespoke point-to-point links between every counterparty.

The network connects six participant roles:
**Investors · Distributors · Fund Managers · Transfer Agents · Custodians**, all
orbiting the **Calastone** hub. Calastone is now **an SS&C company** (the
wordmark sometimes carries the "An SS&C Company" tagline).

**Scale (illustrative, from supplied materials):** ~273.3m orders routed in 2025,
51 countries, 321 live trading corridors, ~109.8m cross-border.

### Sources supplied
This system was built from **brand screenshots only** — no codebase or Figma was
provided. Screenshots (in `uploads/`):
- `Screenshot 2026-06-18 111320.png` — "Simplifying Trading Insights" deck slide
- `Screenshot 2026-06-19 101853.png` — "Order Routing" deck slide
- `Screenshot 2026-06-19 101915.png` — "Connectivity as Standard" deck slide
- `Screenshot 2026-06-19 161026.png` / `161147.png` — the **Calastone Network**
  interactive explorer (Before/After hexagon network + side panel)
- `Screenshot 2026-06-19 215155.png` — the **Global Network** spinning globe stat view

⚠️ Colours, type, spacing and components were reverse-engineered from these
images plus the brief (Open Sans; light + teal + black). Treat exact hex values
and component APIs as a faithful interpretation, not an extracted source of truth.

---

## 2 · Content fundamentals (voice & copy)

- **Tone:** confident, clear, infrastructural. Calastone speaks as the calm,
  trusted plumbing of the funds industry — not hype-y, not playful. Benefit-led,
  plain-English, lightly technical.
- **Person:** institutional third-person and imperative ("Connect to Calastone…",
  "One connection reaches the whole market"). Rarely "you"; never "I/we" in
  product chrome. Marketing copy may use "we" sparingly.
- **Casing:** Sentence case for body and most headlines. **WIDE letter-spaced
  UPPERCASE** for eyebrows, labels, the logo, and footer metadata
  (`GLOBAL NETWORK · 2025`, `BEFORE · POINT-TO-POINT`, `PARTICIPANTS · HOVER TO TRACE`).
  Deck headlines are often full uppercase ("ORDER ROUTING", "CONNECTIVITY AS STANDARD").
- **Structure:** problem → cause → solution is a recurring rhetorical frame.
  Bold the lead-in label (`**Problem:**`, `**Solution:**`).
- **Numbers:** big, confident, abbreviated (`273.3m`, `109.8m`, `51`, `321`).
  Units set smaller and often in teal beside the figure.
- **Emphasis:** key phrases inside sentences are **bold and tinted teal**
  ("any message type in any format").
- **Punctuation:** the middot ` · ` is the house separator for metadata and eyebrows.
- **Emoji:** none. Not part of the brand.
- **Copyright line:** `© Calastone Limited <year>`, usually with a page number,
  bottom-right; logo bottom-left.

**Examples**
> Connect to Calastone using **any message type in any format** — removing complexity, cost and risk.
> With the Calastone Network — one connection reaches the whole market.
> Seamless, automated order processing | Global fund trading made simple | Interoperable, efficient, secure

---

## 3 · Visual foundations

**Palette** — light, teal and black.
- **Ink** is a dark slate (`--ink-800 #22323d`), not pure black; the near-black
  `--ink-900 #0d1418` is reserved for the logo, the hub hexagon, and strongest text.
- **Teal** `--teal-500 #2d9a8e` is the primary brand colour. A **bright teal**
  `--accent-500 #0fb89c` carries interactivity (links, active states, focus, the
  "lit" hub). **Green** `--green-500 #35b57e` is secondary and pairs with teal in
  the signature **teal→green gradient** (`--grad-brand`, the Calastone hub fill).
- **Participant palette** (data-viz / nodes): Investors & Distributors blue
  `#3d8dbc`, Fund Managers teal `#2ea39b`, Transfer Agents deep navy `#1c4d6a`,
  Custodians green `#56a773`.
- Backgrounds are **white → very light cool blue-grey** (`#fbfdfe → #f1f6f9`).
  Decks use a light neutral grey content panel (`#ececec`). Section/hero moments
  invert to ink.

**Type** — **Open Sans** throughout (the genuine brand font; companion mono is
IBM Plex Mono for figures/IDs). Headlines are large and range from semibold to
**extrabold** with tight tracking; body is regular. The signature typographic
move is wide letter-spaced uppercase (`.18em` eyebrows, `.32em` logo lockup).

**Geometry & motifs**
- The **hexagon** is the defining shape — pointy-top — used for every network
  node, the hub, and as faint ghost/decorative geometry.
- **Diagonal accents** at 45° in slide corners: a thin teal line top-right and a
  teal→green gradient wedge bottom-right.
- The **network** (hub-and-spoke vs tangled mesh) is the core conceptual diagram.

**Backgrounds:** flat light fills and very soft vertical cool gradients; no photos,
no textures, no busy patterns. Decorative ghost hexagons at very low contrast.
The product hero is the only place a rich visual appears (a pale blue D3 globe).

**Shadows / elevation:** soft, **cool blue-grey** shadows (never pure black),
layered subtly. Brand elements can "light up" with a teal **glow**
(`--glow-brand`). Cards are white, **hairline-bordered** (`1px var(--ink-100/200)`),
gently rounded.

**Corner radii:** controls 6px, cards 14px; **pills (999px)** for toggles, tabs,
badges and the segmented control.

**Borders:** 1px hairlines in cool greys; dividers in `--ink-100/200`.

**Motion:** calm and professional — ease-out, 120–360ms, simple fades and
position tweens. **No bounce / overshoot.** The Before↔After toggle cross-fades;
spokes trace on hover. Reserve looping motion for the globe only.

**Interaction states:**
- *Hover* — buttons darken (`brightness 0.93`); cards lift 2px + deepen shadow;
  legend rows get a faint tint; the hovered participant's spoke brightens to accent
  teal while others dim.
- *Press* — buttons nudge down 1px.
- *Focus* — 3px bright-teal ring (`--focus-ring`).
- *Active* (toggles/tabs) — white pill with a small shadow / bright-teal underline.

**Transparency & blur:** glassy blurred panels (`--blur-panel`) are used sparingly
for overlays floating above the globe/network; UI surfaces are otherwise solid white.

---

## 4 · Iconography

No proprietary icon font was found in the supplied materials. Calastone's own
visual language leans on **geometry over pictograms** — hexagons, directional
**arrows** (for message/order flow), middots and simple chevrons (`→`). UI affordance
glyphs in the screenshots are minimal and lightweight.

**Guidance for this system:** use **Lucide** (https://lucide.dev, CDN-available) as
the substitute icon set — its 1.5–2px stroke weight, rounded joins and restrained
style match Calastone's clean, light aesthetic. ⚠️ *This is a substitution* — if
Calastone has an official icon set, please supply it and we'll swap it in.

Load Lucide from CDN when a kit needs icons:
```html
<script src="https://unpkg.com/lucide@latest"></script>
<i data-lucide="arrow-right"></i>
<script>lucide.createIcons()</script>
```
- **Emoji:** never.
- **Unicode** arrows/middots (`→ · |`) are acceptable inline, as in the brand decks.
- Brand assets (logo) live in `assets/logos/` as transparent PNGs — see below.

---

## 5 · Repository index / manifest

**Root**
- `styles.css` — the single entry point (imports only). Consumers link this.
- `readme.md` — this guide.
- `SKILL.md` — Agent-Skill front-matter for use in Claude Code.

**`tokens/`** — design tokens (each `@import`ed by `styles.css`)
- `fonts.css` · `colors.css` · `typography.css` · `spacing.css` · `effects.css` · `base.css`

**`assets/logos/`**
- `calastone-wordmark-black.png` · `calastone-wordmark-white.png` (real wordmark,
  cropped from brand decks, transparent)

**`components/core/`** — primitives
- `Button`, `IconButton`, `Input`, `Badge`, `SegmentedControl`, `Switch`, `Tabs`
- demo: `core.card.html`

**`components/brand/`** — brand-specific primitives
- `Hexagon`, `ParticipantNode`, `StatCallout`, `Logo`
- demo: `brand.card.html`

**`guidelines/`** — foundation specimen cards (Design System tab):
colours (teal, accent/green, neutrals, participants, gradient/status), type
(headings, body, eyebrow/mono), spacing (scale, radii/shadow), brand (logo, motifs).

**`ui_kits/network/`** — the **Calastone Network** explorer recreation
(`index.html`, `NetworkDiagram.jsx`, `OrderRouting.jsx`).

**`ui_kits/slides/`** — sample on-brand slides
(`slide-title`, `slide-concept`, `slide-connectivity`, `slide-stat`).

> Generated automatically — do not edit: `_ds_bundle.js`, `_ds_manifest.json`,
> `_adherence.oxlintrc.json`.

---

## 6 · Caveats
- Built from **screenshots + brief only** (no codebase / Figma). Component APIs and
  exact tokens are an interpretation.
- **Open Sans** is served via Google Fonts `@import` (the genuine brand font; no
  local binaries were available to self-host, so no `@font-face` ships in the bundle).
- **Icons** default to **Lucide** (substitute) — pending an official set.
- The product's **spinning D3 globe** was not recreated (data-heavy); the network
  hexagon explorer and order-routing flow are recreated in full.
