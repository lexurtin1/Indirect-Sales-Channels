# Fund Flow Index (Published Data)

Rules for the published Calastone Fund Flow Index (FFI) data, and how it appears on the globe. The globe itself, including the illustrative network data and every country view, is designed in `docs/network-flow-globe.md`.

Data file: `data/ffi/extracted/ffi.json`. Check script: `node scripts/validate-ffi.mjs`.

---

## 1. What the data says, and what it does not

The FFI measures **net flows from UK-based investors into UK-domiciled funds**, in GBP millions. Funds of funds are excluded and totals are scaled up for Calastone's market share.

The regions in the reports (North American, Asian, European and so on) describe **where a fund invests**, not where investors are. "North American equity funds +£227m" means UK investors put a net £227m into UK funds that invest in North America.

Every label from this data must say "UK investors" and describe regions as "funds investing in [region]".

---

## 2. What is in the dataset

Extracted from four public reports (June to September 2026).

| Block in `ffi.json` | Contents | Periods |
| --- | --- | --- |
| `asset_classes.monthly` | Equities (with active, passive, UK-focused, ESG), money market, fixed income, mixed assets, property, total | Apr to Sep 2026 |
| `asset_classes.quarterly` | Same columns | 2024 Q1 to 2026 Q2 |
| `asset_classes.annual` | Same columns | 2015 to 2025 |
| `equity_sectors` | Regional equity sectors named in each report's text | Jun to Sep 2026 |
| `fixed_income_sectors` | High yield and sovereign | Sep 2026 |
| `headlines` | One headline and four facts per month, in plain words | Jun to Sep 2026 |
| `ytd` | Year-to-date equities and fixed income, checked against the published figures | to Sep 2026 |
| `revisions`, `known_report_errors` | Where reports disagree with each other | n/a |

### Rules for the data

- **Use the latest report** for any period. Figures are restated between reports. For example, July 2026's total is −1,913 in the July report and −1,670 in the September report.
- **UK-focused and ESG are subsets of equities.** Never add them to the other columns.
- **Never recompute Total.** The published Total includes categories not shown in the table.
- **Unpublished amounts stay null.** Some reports say a sector had outflows without giving a figure. These have `"status": "outflow-unpublished"` and `"net_flow_gbp_m": null`. Show the direction, never an estimate.
- **Every figure keeps its `source`.** Tooltips and panels show which report it came from.

---

## 3. How it appears on the globe

The FFI is the **Published** layer for the United Kingdom. When it is switched on in the UK panel:

- **Arcs** run from London to each fund investment region (North America, Europe ex UK, Japan, China, Asia-Pacific). Inflows travel outward in green, outflows travel back to London in red.
  - **Width:** `0.25 + 1.75 × sqrt(abs(value) / 1000)`.
  - **Unpublished amounts:** a thin grey dashed arc.
- **UK-focused funds** are a ring at London, because that money stays in the UK.
- **Global, emerging markets and sector funds** have no single location. They sit in a strip under the globe.
- **The panel shows:**
  - the month's headline and facts
  - asset-class bars for the month
  - year to date
  - the quarterly and annual trend
  - a link to each source report

### Region anchors

| `region` value | Label | Anchor (lat, lng) |
| --- | --- | --- |
| `uk` | UK-focused funds | 51.51, −0.13 (ring, no arc) |
| `north-america` | Funds investing in North America | 42.0, −95.0 |
| `europe` | Funds investing in Europe (ex UK) | 48.5, 12.0 |
| `japan` | Funds investing in Japan | 36.2, 138.3 |
| `china` | Funds investing in China | 34.5, 104.0 |
| `asia-pacific` | Funds investing in Asia-Pacific | 5.0, 110.0 |

`asia-pacific` covers three report labels ("Asia-Pacific" in June, "Asia" in July, "Asian" in September). Confirm with the FFI team that these are the same sector.

---

## 4. Monthly update

When a new FFI report is published:

1. Save the PDF to `data/ffi/raw/` (PDFs are not committed; see `.gitignore`).
2. Add the report to `sources` with its title, publication date and calastone.com URL.
3. Add the new month to `asset_classes.monthly` from the report's table. If the table restates earlier months, update them and record the change in `revisions`.
4. Add the regional sectors named in the text to `equity_sectors`, using `outflow-unpublished` where no figure is given.
5. Write the month's headline and four facts in plain words.
6. Run `node scripts/validate-ffi.mjs`.

---

## 5. Open questions

1. The calastone.com URL for each report (currently `null` in `sources`).
2. Whether "Asia-Pacific", "Asia" and "Asian" are the same sector.
3. Whether the FFI team can supply every regional sector figure each month, which would replace the grey arcs.
4. Whether the FFI index value (the 0 to 100 reading where 50 means balanced) is available by sector.
