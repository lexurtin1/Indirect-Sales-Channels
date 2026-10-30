// Generates an ILLUSTRATIVE network flow dataset for the globe prototype.
// Every figure is synthetic. It shows the shape of data Calastone could
// display, not real Calastone volumes. Do not replace it with real network
// data without legal and client-data sign-off.
//
// Run: node scripts/generate-illustrative-network.mjs
// Output: data/network/illustrative-network.json
// The output is reproducible: the same seed always gives the same file.

import { writeFileSync, mkdirSync } from 'node:fs';

const SEED = 20261030;
const MONTHS = 24;               // Oct 2024 to Sep 2026
const LAST = { y: 2026, m: 9 };
const MIN_FIRMS = 5;             // suppression rule: hide cells built from fewer firms

// ---------- seeded random ----------
let s = SEED >>> 0;
const rand = () => { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const gauss = () => { let u = 0, v = 0; while (!u) u = rand(); while (!v) v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const round = (x, step = 1) => Number((Math.round(x / step) * step).toFixed(2));

// ---------- countries ----------
// inv: relative size as an investor market. dom: relative size as a fund domicile.
// home: share of that country's investment that goes into its own domestic funds.
const C = [
  ['GB','United Kingdom',51.5,-0.1,'Europe',100,60,0.80],
  ['LU','Luxembourg',49.6,6.1,'Europe',6,100,0.10],
  ['IE','Ireland',53.3,-6.3,'Europe',5,70,0.15],
  ['CH','Switzerland',46.9,7.4,'Europe',30,8,0.25],
  ['DE','Germany',51.2,10.4,'Europe',28,12,0.35],
  ['FR','France',46.6,2.2,'Europe',18,12,0.45],
  ['IT','Italy',42.8,12.5,'Europe',24,6,0.20],
  ['ES','Spain',40.4,-3.7,'Europe',20,8,0.40],
  ['NL','Netherlands',52.1,5.3,'Europe',10,3,0.25],
  ['BE','Belgium',50.8,4.4,'Europe',8,2,0.20],
  ['AT','Austria',47.5,14.6,'Europe',7,2,0.30],
  ['SE','Sweden',60.1,18.6,'Europe',9,4,0.50],
  ['NO','Norway',60.5,8.5,'Europe',6,2,0.40],
  ['DK','Denmark',56.0,10.0,'Europe',6,2,0.40],
  ['PL','Poland',52.1,19.4,'Europe',5,2,0.55],
  ['PT','Portugal',39.6,-8.0,'Europe',4,1,0.35],
  ['AE','United Arab Emirates',24.3,54.4,'Middle East',8,1,0.05],
  ['ZA','South Africa',-30.6,22.9,'Africa',9,4,0.50],
  ['SG','Singapore',1.35,103.8,'Asia-Pacific',22,18,0.20],
  ['HK','Hong Kong',22.3,114.2,'Asia-Pacific',26,14,0.20],
  ['TW','Taiwan',23.7,121.0,'Asia-Pacific',24,8,0.35],
  ['KR','South Korea',36.5,127.9,'Asia-Pacific',10,3,0.50],
  ['JP','Japan',36.2,138.3,'Asia-Pacific',8,3,0.70],
  ['AU','Australia',-25.3,133.8,'Asia-Pacific',16,10,0.75],
  ['NZ','New Zealand',-41.0,174.9,'Asia-Pacific',3,1,0.50],
  ['US','United States',39.8,-98.6,'Americas',12,4,0.60],
  ['CA','Canada',56.1,-106.3,'Americas',5,2,0.60],
  ['BR','Brazil',-14.2,-51.9,'Americas',6,1,0.70],
  ['CL','Chile',-35.7,-71.5,'Americas',4,1,0.30],
  ['KY','Cayman Islands',19.3,-81.3,'Americas',1,10,0.00],
].map(([iso, name, lat, lng, region, inv, dom, home]) => ({ iso, name, lat, lng, region, inv, dom, home }));
const byIso = Object.fromEntries(C.map(c => [c.iso, c]));

// Preferred cross-border domiciles by investor region (bias on top of domicile size)
const PREF = {
  'Asia-Pacific': { LU: 1.2, IE: 1.1, SG: 1.6, HK: 1.5, KY: 1.4 },
  'Europe': { LU: 1.4, IE: 1.3, CH: 1.1 },
  'Middle East': { LU: 1.3, IE: 1.3, KY: 1.6 },
  'Africa': { LU: 1.1, IE: 1.4, GB: 1.6 },
  'Americas': { LU: 1.5, IE: 1.2, KY: 1.8 },
};

const ASSETS = ['Equity', 'Fixed income', 'Money market', 'Mixed assets', 'Property', 'Alternatives'];
const BASE_MIX = { Equity: .42, 'Fixed income': .24, 'Money market': .12, 'Mixed assets': .15, Property: .03, Alternatives: .04 };
const DIST_TYPES = ['Platform', 'Private bank', 'Retail bank', 'Wealth manager', 'Insurer', 'Fund of funds'];
const EQ_REGIONS = ['Global', 'North America', 'Europe', 'UK', 'Asia-Pacific ex Japan', 'Japan', 'China', 'Emerging markets', 'Sector'];

const months = [];
for (let i = MONTHS - 1; i >= 0; i--) { const d = new Date(Date.UTC(LAST.y, LAST.m - 1 - i, 1)); months.push(d.toISOString().slice(0, 7)); }

// Market-wide sentiment per month for each asset class (shared shocks)
const sentiment = Object.fromEntries(ASSETS.map(a => [a, months.map(() => gauss() * 0.25)]));
// Shape a few stories into the data so the demo has something to find
const t = i => i / (MONTHS - 1);
months.forEach((_, i) => { sentiment['Equity'][i] -= 0.15 * t(i); sentiment['Fixed income'][i] += 0.3 * t(i); sentiment['Money market'][i] += 0.2 * t(i); });

const TOTAL_GROSS = 60000; // USD m gross monthly activity across the illustrative network
const sumInv = C.reduce((a, c) => a + c.inv, 0);

const corridors = [];
for (const inv of C) {
  if (inv.inv < 2) continue;
  const gross = TOTAL_GROSS * inv.inv / sumInv;
  // Split between domestic and cross-border domiciles
  const targets = C.filter(d => d.dom > 0 && d.iso !== inv.iso);
  // Cross-border domiciles (LU, IE, KY, GB) sell worldwide; local domiciles sell mainly in their own region
  const GLOBAL_DOMICILES = { LU: 1, IE: 1, KY: 1, GB: 0.6 };
  const reach = d => GLOBAL_DOMICILES[d.iso] ?? (d.region === inv.region ? 1 : 0.08);
  const weights = targets.map(d => d.dom * reach(d) * ((PREF[inv.region] || {})[d.iso] || 1) * (d.region === inv.region ? 1.3 : 1));
  const wSum = weights.reduce((a, b) => a + b, 0);
  const split = [];
  if (inv.home > 0 && inv.dom > 0) split.push([inv, inv.home]);
  targets.forEach((d, k) => split.push([d, (1 - (inv.dom > 0 ? inv.home : 0)) * weights[k] / wSum]));
  // Keep the largest partners only; the rest roll into "Other"
  split.sort((a, b) => b[1] - a[1]);
  const kept = split.filter(([, w]) => w > 0.015).slice(0, 10);
  // Investor markets diverge: each has its own lean, Asia-Pacific and the Gulf lean towards buying
  const countryBias = gauss() * 0.22 + (inv.region === 'Asia-Pacific' ? 0.2 : 0) + (inv.region === 'Middle East' ? 0.12 : 0) - (inv.iso === 'GB' ? 0.15 : 0);
  const mixTilt = Object.fromEntries(ASSETS.map(a => [a, Math.max(0.2, 1 + gauss() * 0.25)]));
  if (inv.region === 'Asia-Pacific') { mixTilt['Fixed income'] *= 1.25; mixTilt['Money market'] *= 1.2; }
  for (const [dom, w] of kept) {
    const cGross = gross * w;
    const firms = { distributors: Math.max(1, Math.round(Math.sqrt(cGross) * (0.6 + rand()))), fund_managers: Math.max(1, Math.round(Math.sqrt(cGross) * (0.9 + rand()))) };
    const corridorTrend = gauss() * 0.15;
    const series = months.map((mo, i) => {
      let buys = 0, sells = 0, orders = 0;
      const byAsset = {};
      for (const a of ASSETS) {
        const g = cGross * BASE_MIX[a] * mixTilt[a] * (1 + gauss() * 0.08);
        const bias = sentiment[a][i] * 0.12 + countryBias * 0.12 + corridorTrend * 0.08 * t(i) + gauss() * 0.03;
        const b = g * (0.5 + bias), sl = g * (0.5 - bias);
        byAsset[a] = round(b - sl, 0.1);
        buys += b; sells += sl;
        orders += g * (a === 'Money market' ? 9 : 22);
      }
      return { month: mo, buys: round(buys, 0.1), sells: round(sells, 0.1), net: round(buys - sells, 0.1), orders: Math.round(orders), net_by_asset_class: byAsset };
    });
    const suppressed = firms.distributors < MIN_FIRMS || firms.fund_managers < MIN_FIRMS;
    // Composition for the latest month (level 4)
    const distMix = DIST_TYPES.map(() => rand() + 0.2); const dmSum = distMix.reduce((a, b) => a + b, 0);
    const eqMix = EQ_REGIONS.map(() => rand() + 0.1); const eqSum = eqMix.reduce((a, b) => a + b, 0);
    corridors.push({
      investor_country: inv.iso,
      fund_domicile: dom.iso,
      domestic: inv.iso === dom.iso,
      firms_band: suppressed ? `fewer than ${MIN_FIRMS}` : firms.distributors < 20 ? '5 to 19' : firms.distributors < 50 ? '20 to 49' : '50 or more',
      suppressed,
      series: suppressed ? null : series,
      latest: suppressed ? null : {
        passive_share: round(0.2 + rand() * 0.5, 0.01),
        stp_rate: round(0.86 + rand() * 0.13, 0.001),
        manual_order_share: round(0.01 + rand() * 0.12, 0.001),
        distributor_type_share: Object.fromEntries(DIST_TYPES.map((d, k) => [d, round(distMix[k] / dmSum, 0.01)])),
        equity_net_by_region: Object.fromEntries(EQ_REGIONS.map((r, k) => [r, round(series.at(-1).net_by_asset_class['Equity'] * (eqMix[k] / eqSum) * (1 + gauss() * 0.6), 0.1)])),
        share_class_currency: inv.region === 'Asia-Pacific' ? { USD: .55, SGD: .15, HKD: .12, Other: .18 } : inv.region === 'Europe' ? { EUR: .5, GBP: .2, USD: .2, Other: .1 } : { USD: .7, Other: .3 },
      },
    });
  }
}

// Country summaries in both directions, built only from non-suppressed corridors
const sumSeries = list => months.map((mo, i) => {
  const r = { month: mo, buys: 0, sells: 0, net: 0, orders: 0 };
  for (const c of list) { const x = c.series[i]; r.buys += x.buys; r.sells += x.sells; r.net += x.net; r.orders += x.orders; }
  return { month: mo, buys: round(r.buys, 0.1), sells: round(r.sells, 0.1), net: round(r.net, 0.1), orders: r.orders };
});
const countries = C.map(c => {
  const asInvestor = corridors.filter(k => k.investor_country === c.iso && !k.suppressed);
  const asDomicile = corridors.filter(k => k.fund_domicile === c.iso && !k.suppressed);
  return {
    iso: c.iso, name: c.name, lat: c.lat, lng: c.lng, region: c.region,
    investor_view: asInvestor.length ? { series: sumSeries(asInvestor), partners: asInvestor.length, suppressed_partners: corridors.filter(k => k.investor_country === c.iso && k.suppressed).length } : null,
    domicile_view: asDomicile.length ? { series: sumSeries(asDomicile), partners: asDomicile.length, suppressed_partners: corridors.filter(k => k.fund_domicile === c.iso && k.suppressed).length } : null,
  };
});

const out = {
  illustrative: true,
  notice: 'ILLUSTRATIVE DATA. Synthetic figures generated to show the kind of data Calastone could display. Not Calastone network volumes.',
  generated_with: { script: 'scripts/generate-illustrative-network.mjs', seed: SEED },
  unit: 'USD m (orders as counts)',
  months,
  rules: { min_firms_per_cell: MIN_FIRMS, rounding: 'USD 0.1m in file; display rounded to USD 10m', delay: 'Website shows data one month in arrears' },
  dimensions: { asset_classes: ASSETS, distributor_types: DIST_TYPES, equity_regions: EQ_REGIONS },
  countries,
  corridors,
};
mkdirSync(new URL('../data/network/', import.meta.url), { recursive: true });
writeFileSync(new URL('../data/network/illustrative-network.json', import.meta.url), JSON.stringify(out));
const sup = corridors.filter(c => c.suppressed).length;
console.log(`countries ${countries.length}, corridors ${corridors.length} (${sup} suppressed), months ${months.length}`);
