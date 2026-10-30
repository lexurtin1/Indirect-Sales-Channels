// Checks data/ffi/extracted/ffi.json before it is used by the globe.
// Run: node scripts/validate-ffi.mjs
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../data/ffi/extracted/ffi.json', import.meta.url)));
const sourceIds = new Set(data.sources.map(s => s.id));
const errors = [];
const TOLERANCE = 2; // published figures are rounded to the nearest 1m

for (const [grain, rows] of Object.entries(data.asset_classes)) {
  if (grain === 'columns') continue;
  for (const [period, row] of Object.entries(rows)) {
    if (!sourceIds.has(row.source)) errors.push(`${grain} ${period}: unknown source ${row.source}`);
    const gap = Math.abs(row.active + row.passive - row.equities);
    if (gap > TOLERANCE) errors.push(`${grain} ${period}: active + passive differs from equities by ${gap}`);
  }
}

for (const [period, list] of Object.entries(data.equity_sectors)) {
  for (const s of list) {
    if (!sourceIds.has(s.source)) errors.push(`sector ${period} ${s.region}: unknown source`);
    if (s.status === 'outflow-unpublished' && s.net_flow_gbp_m !== null) errors.push(`sector ${period} ${s.region}: unpublished amount must be null`);
    if (s.status === 'inflow' && !(s.net_flow_gbp_m > 0)) errors.push(`sector ${period} ${s.region}: inflow must be positive`);
    if (s.status === 'outflow' && !(s.net_flow_gbp_m < 0)) errors.push(`sector ${period} ${s.region}: outflow must be negative`);
  }
}

const m = data.asset_classes.monthly, q = data.asset_classes.quarterly;
const ytdEq = q['2026-Q1'].equities + q['2026-Q2'].equities + m['2026-07'].equities + m['2026-08'].equities + m['2026-09'].equities;
if (ytdEq !== data.ytd.equities) errors.push(`YTD equities ${ytdEq} does not match ${data.ytd.equities}`);

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`ffi.json OK: ${Object.keys(m).length} months, ${Object.keys(q).length} quarters, ${Object.keys(data.asset_classes.annual).length} years, ${Object.keys(data.equity_sectors).length} months of sector data`);
