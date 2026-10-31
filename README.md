# Calastone indirect sales channels

A working prototype, instead of a slide deck, that shows options for winning business through indirect sales channels. Every screen is a simulation of what a client, prospect or Calastone salesperson would see. Nothing in it connects to live Calastone systems.

It must explain itself, never break, and make clear what is simulated. It works on a laptop and an iPad.

---

## 1. What the screens show

1. Calastone can create leads without adding salespeople.
2. Each channel builds on something Calastone already owns: the network, the Fund Flow Index (FFI), connections to legacy TA systems, and SS&C's reach.
3. Each channel has a cheap first test.

The screens compare options. They do not make a business case. Volumes, conversion rates and revenue are not yet known for any channel, and the front page says so.

---

## 2. Screens

The front page is the navigation. Each card opens one screen.

| # | Screen | What it simulates | Channel it proves | Build approach |
| --- | --- | --- | --- | --- |
| 0 | Front page | Pulse-style card navigation and a one-paragraph intro | n/a | Reuse the front navigation from `calastone-network-vis` |
| 1 | Calastone website with flow globe | The calastone.com homepage with an interactive globe: click any country to see fund flows in both directions, with deeper data offered through the Calastone MCP | Data as a hook; AI-led discovery | Recreate the homepage from screenshots; globe from published FFI data |
| 2 | Calastone MCP sales assistant | A chatbot branded with a fund manager's logo. Questions trigger the Calastone MCP, which answers with a Calastone solution and a contact | AI-led discovery; lead creation | Original chat UI, scripted answers (section 3) |
| 3 | Salesforce trend alert | A fund manager's Salesforce account page with a Calastone flow alert sliding in | Data product inside client CRMs | Recreate from screenshots using the Salesforce Lightning Design System |
| 4 | Sales Navigator inside Salesforce | A consultancy record with a Sales Navigator panel showing which asset managers it advises and the warm path to them | Consultant relationships | Panel inside the Salesforce recreation |
| 5 | Agent-to-agent network | Animated diagram of firms' AI agents messaging through Calastone, which verifies identity and permissions | Calastone as the trusted router for AI agents | Original animated diagram |
| 6 | Channel map | All channels on one screen with who pays and the first test | Summary | Original layout |
| 7 | Chat | A fund manager's assistant (HSBC, BlackRock or Vanguard) calls Calastone MCP tools | AI-led discovery | Vanilla port of the Chat MCP package; scripted answers in `data/chatbot/chat-scripts.json` |

Screen 1's Download MCP buttons also open screen 7 (Chat), with an optional install dialog.

### Shared elements on every screen

- **"Simulated view" tag**, visible at all times.
- **"What you're looking at" panel**, collapsible: which channel this is, what is simulated, what would need building.
- **Pulsing hotspots** on anything clickable.
- **Guided tour button** that steps through the key clicks.
- **Reset button** to replay the screen.
- **Back to front page** link.

---

## 3. Screen 2 in detail: the Calastone MCP sales assistant

### Purpose

Show what happens when a fund manager asks their AI assistant a business problem that Calastone solves. The assistant recognises the problem, calls the Calastone MCP, explains the specific Calastone solution, and directs them to Calastone.

### Layout

- Top left: the client's logo (for example a fund manager) and the label "AI assistant · Calastone MCP connected". A hidden logo switcher (keyboard shortcut) swaps between a generic firm and named clients.
- Main area: the conversation.
- Below the input: suggested questions grouped by topic.
- Right side (desktop only): a "Calastone MCP activity" panel showing each tool call as it happens, and a "Lead created" card when the user asks to be contacted. This shows what Calastone would see.

### Conversation flow for every answer

1. **User asks** a question in plain language.
2. **Topic detected** and a small card appears: "Calastone MCP: `distribution_reach` called".
3. **Problem restated** in one sentence, in the client's terms.
4. **Calastone solution**: which product solves it and how, in two to four sentences.
5. **Proof point**: one public fact, such as network size or a published FFI figure, with its source.
6. **Call to action**: "Talk to Calastone about this: clientservices@calastone.com", shown as selectable text with a copy button. Do not rely on `mailto:` links working.
7. **Lead signal** appears in the side panel: topic, firm, question, timestamp.

### Topics and triggers

Each topic maps to one simulated MCP tool. Keywords are examples; match on any.

| Topic | Example questions | Trigger keywords | Simulated tool | Calastone solution to describe |
| --- | --- | --- | --- | --- |
| Distribution | "How do I reach more distributors in Asia?" "Why do some platforms still send us orders by email?" | distribution, distributor, platform, reach, new market, manual orders | `distribution_reach` | Order routing on the Calastone network |
| ETFs | "Can wealth platforms trade our ETFs like mutual funds?" "How do we distribute ETFs to platforms that only deal funds?" | ETF, exchange traded, creation, redemption | `etf_distribution` | Calastone ETF solution (confirm scope with product team) |
| Tokenisation | "How can we offer a tokenised share class without rebuilding our TA?" "Can distributors deal tokenised funds?" | tokenised, tokenization, tokenisation, blockchain, digital asset, on-chain | `tokenised_distribution` | Calastone Tokenised Distribution Solution (publicly announced; confirm details) |
| Money market funds | "How can corporate treasurers deal our MMFs more easily?" | money market, MMF, cash, treasury | `mmf_dealing` | Calastone money market fund solution |
| Settlement | "Our settlement breaks are rising. What can fix this?" | settlement, settle, cash, breaks, fails | `settlement_check` | Calastone settlement service |
| Cost | "What would automating our manual orders save?" | cost, save, saving, manual, automate | `cost_calculator` | Cost calculator returning an estimated saving (inputs asked in the chat) |
| Fund availability | "Is fund LU0000000001 on the network?" | ISIN, LU0, IE0, GB00, available, connected | `isin_check` | ISIN checker; "not connected" creates a lead |
| Anything else | Any unmatched question | none | `no_match` | Polite answer that Calastone may help, plus the contact address; logged as an unanswered question |

All product descriptions must be confirmed with the relevant Calastone product owner before they are treated as final. Placeholders are marked `TODO(product)` in `data/chatbot/scripts.json`.

### Answer data format

Scripted answers live in `data/chatbot/scripts.json` so they can be edited without touching code.

```json
{
  "topics": [
    {
      "id": "tokenisation",
      "label": "Tokenisation",
      "tool": "tokenised_distribution",
      "keywords": ["tokenised", "tokenisation", "tokenization", "blockchain", "digital asset", "on-chain"],
      "suggested_questions": [
        "How can we offer a tokenised share class without rebuilding our TA?"
      ],
      "answer": {
        "problem": "You want to offer a tokenised share class but your transfer agent and distributors run on traditional systems.",
        "solution": "TODO(product): two to four sentences on the Calastone Tokenised Distribution Solution.",
        "proof": { "text": "TODO(product): one public fact.", "source": "TODO: URL" },
        "cta": "Talk to Calastone about tokenised distribution: clientservices@calastone.com"
      }
    }
  ],
  "fallback": {
    "tool": "no_match",
    "answer": "Calastone may be able to help with this. Contact clientservices@calastone.com and the team will route your question."
  }
}
```

### Matching logic

1. Lower-case the question.
2. Score each topic by the number and length of keyword matches.
3. Highest score wins. A tie or zero score uses `fallback`.
4. Show a short "Calling Calastone MCP" state (600 to 900 ms) before the answer.

### Optional live mode (later step)

A toggle can send questions to Claude through a server-side function, with a system prompt that limits answers to the topics in `scripts.json` and always ends with the contact address. If the call fails or takes longer than 8 seconds, fall back to the scripted answer. Keep scripted mode as the default.

---

## 4. Data

### Fund Flow Index (public reports only)

Published data rules are in `docs/fund-flow-index.md`. The extracted dataset is `data/ffi/extracted/ffi.json` (June to September 2026 reports); check it with `node scripts/validate-ffi.mjs`.

### Illustrative network data

The globe lets the viewer click any country and see flows in both directions (investors in a country, and funds domiciled there). The published FFI only covers UK investors, so the rest uses a synthetic dataset, `data/network/illustrative-network.json`, generated by `node scripts/generate-illustrative-network.mjs`. Every figure from it is badged Illustrative. The globe design, data levels and privacy rules are in `docs/network-flow-globe.md`.

- Put the downloaded public FFI reports in `data/ffi/raw/`.
- Extract the published figures into `data/ffi/extracted/ffi.json` (schema below).
- Every figure records the report it came from.
- Use only published figures. No internal Calastone network data anywhere in this repo.

```json
{
  "as_of": "2026-09",
  "series": [
    {
      "region": "UK",
      "period": "2026-08",
      "asset_class": "Fixed income",
      "net_flow": 1060,
      "unit": "GBP m",
      "source": { "title": "Calastone Fund Flow Index, August 2026", "url": "https://www.calastone.com/..." }
    }
  ]
}
```

### Screenshots for recreation

| Folder | What to put in it | Before capturing |
| --- | --- | --- |
| `reference/screenshots/calastone-website/` | calastone.com homepage, full page, about 1440px wide | Nothing to remove |
| `reference/screenshots/salesforce/` | A Salesforce account page and an activity timeline | Replace real client names, figures and people with fictional ones |
| `reference/screenshots/sales-navigator/` | Sales Navigator panel inside a Salesforce record, or an account page | Blur all faces and real names |

Screenshots are reference material for the build. They are not shown on the site.

---

## 5. Technology

- Static HTML, CSS and JavaScript. No build step, so Cursor edits are easy to follow.
- Hosted on Vercel, behind password protection (check whether your Vercel plan includes it).
- Globe: `globe.gl` loaded from a CDN, pinned to one exact version across the site.
- Salesforce look: Salesforce Lightning Design System CSS, pinned version.
- Calastone look: reuse the design tokens from `calastone-network-vis/pulse/design-system/tokens/`.
- Pin every CDN library to an exact version. Never use `@latest`.

### Folder structure

```
calastone-indirect-channels/
  README.md                  this file
  AGENTS.md                  rules for Cursor and other AI coding tools
  site/
    index.html               front page (screen 0)
    pages/
      website-globe.html     screen 1
      mcp-assistant.html     screen 2
      salesforce-alert.html  screen 3
      sales-navigator.html   screen 4
      agent-network.html     screen 5
      channel-map.html       screen 6
      chat.html              screen 7
    shared/
      tokens.css             Calastone design tokens
      chrome.css             simulated tag, info panel, hotspots, tour, reset
      chrome.js              shared behaviour for the above
      chat-module.css        full-screen client chat layout
      chat-module.js         brand switcher, scripted MCP chat, optional install dialog
    assets/
      brand/                 Calastone wordmark and brand assets
      brands/                client logos for the chat module (private use only)
      logos/                 client logos for the chatbot (private use only)
  data/
    ffi/raw/                 public FFI reports (PDF)
    ffi/extracted/ffi.json   extracted figures with sources
    network/illustrative-network.json  synthetic country and corridor flows
    chatbot/scripts.json     screen 2 chatbot topics and answers
    chatbot/chat-scripts.json  screen 7 brands and scenarios
  scripts/
    validate-ffi.mjs         checks ffi.json
    generate-illustrative-network.mjs  builds the illustrative network data
  reference/screenshots/     screenshots used to recreate pages
  docs/
    build-log.md             what was built at each step
    fund-flow-index.md       published FFI data rules
    network-flow-globe.md    globe design, data levels, MCP hook
  vercel.json
```

---

## 6. Build plan

Build one step at a time in Cursor. Finish each step's checks before starting the next.

| Step | Build | Done when |
| --- | --- | --- |
| 1 | Repo setup, `vercel.json`, shared tokens, shared chrome (simulated tag, info panel, hotspots, reset, back link) | A blank page shows all shared elements and deploys to Vercel behind a password |
| 2 | Front page (screen 0), reusing the Pulse front navigation | All six cards link to placeholder pages; intro paragraph states that screens are simulated |
| 3 | FFI data extraction from the public reports into `ffi.json` | Every figure has a source; totals match the reports |
| 4 | Screen 1: Calastone website recreation | Side by side with the screenshot, layout and type match closely |
| 5 | Screen 1: globe in the hero, MCP calls to action, region click shows FFI figures (sub-steps 5a to 5h in `docs/network-flow-globe.md`) | Globe loads in under 3 seconds; works on iPad |
| 6 | Screen 2: chat UI with logo, suggested questions, scripted answers from `scripts.json` | All topics in section 3 answer correctly; unmatched questions use the fallback |
| 7 | Screen 2: MCP activity panel and lead signal card | Each answer shows its tool call; contact requests create a lead card |
| 8 | Screen 3: Salesforce account page recreation and the alert | Alert slides in, "Create task" adds a task to the timeline, reset replays it |
| 9 | Screen 4: Sales Navigator panel | Warm path highlights on click; no real people shown |
| 10 | Screen 5: agent-to-agent animation | Steps play in order; checks tick; audit log fills; before/after toggle works |
| 11 | Screen 6: channel map and the asks | Each channel shows who pays and the first test |
| 12 | Guided tours for every screen | A first-time user can complete each screen without help |
| 13 | Review pass | Checklist in section 7 passes on laptop and iPad |
| 14 | Optional: live mode for the chatbot | Live answers stay on topic; fallback works when the API fails |

### Prompt pattern for Cursor at each step

> Read README.md and AGENTS.md. We are on step N: [step name]. Build only this step. Use the folder structure and data formats in README.md. When done, list the files changed and how to check the "done when" criteria.

---

## 7. Review checklist

- [ ] Repo is private.
- [ ] Vercel site is password protected.
- [ ] "Simulated view" tag is on every screen.
- [ ] No real client data, names or faces anywhere.
- [ ] Every FFI figure is from a public report and has a source.
- [ ] Every illustrative figure carries the Illustrative badge.
- [ ] Every product description is confirmed by its product owner.
- [ ] Client logos are used only on the private site.
- [ ] Contact address shows as text with a copy button.
- [ ] Every screen works on a laptop and an iPad.
- [ ] Every screen has a working reset and guided tour.
- [ ] No console errors on any page.

---

## 8. Open questions

1. Which client logos to use in the chatbot, and whether a generic firm should be the default.
2. Which product owners sign off the ETF, tokenisation, money market and settlement descriptions.
3. Whether the Sales Navigator screen stays in, depending on whether a consultant partnership is one of the asks.
4. Whether live mode for the chatbot is wanted at all.
5. Who gets the link.

---

## 9. Related work

- `calastone-network-vis`: the existing Pulse prototype. Reuse its front navigation, design tokens and globe code. Note that it is currently a public repo and contains network data that may be confidential.
- Indirect Distribution Playbook (Claude doc): the techniques behind each channel.
