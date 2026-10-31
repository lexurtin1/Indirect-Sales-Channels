# Rules for AI coding tools (Cursor, Claude, others)

Read README.md before every task. It is the source of truth for screens, data formats and the build plan.

## Scope

- Build only the step you are asked for. Do not start the next step.
- After each step, add a short entry to `docs/build-log.md`: date, step, files changed, anything left open.

## Content

- Every screen is a simulation. Do not add a floating "Simulated view" tag; it covers interactive UI.
- Never add real client data, real people's names or faces, or internal Calastone network data.
- Fund Flow Index figures come only from `data/ffi/extracted/ffi.json`, and each one keeps its source.
- Product descriptions come only from `data/chatbot/scripts.json`. Do not invent product capabilities. Leave `TODO(product)` markers in place until a product owner supplies the text.
- Show the contact address clientservices@calastone.com as selectable text with a copy button.

## Writing style

- No em dashes anywhere, in code comments, copy or docs.
- Plain, specific wording. No marketing language, no vague claims.
- UK English spelling.

## Code

- Static HTML, CSS and JavaScript. No framework, no build step.
- Pin every CDN library to an exact version. Never use `@latest`.
- Use the design tokens in `site/shared/tokens.css`. No hard-coded colours in page styles.
- Every page must work at iPad width and laptop width, with no horizontal scrolling.
- Respect `prefers-reduced-motion`.
- No API keys in any file. Any server-side key goes in Vercel environment variables only.
