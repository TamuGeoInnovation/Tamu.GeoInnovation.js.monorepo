// Batch 24: summarise bm24.cjs's JSONL. Rates with 95% Wilson intervals; by run, site, layer, error and kind of query.
const fs = require('fs');
const rows = fs.readFileSync(process.argv[2], 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const q = rows.filter((r) => r.kind === 'req' && r.op === 'query');

function wilson(k, n, z = 1.96) {
  if (!n) return [0, 0];
  const p = k / n, d = 1 + (z * z) / n, c = p + (z * z) / (2 * n), h = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [(c - h) / d, (c + h) / d];
}
const pct = (x) => (100 * x).toFixed(2) + '%';
const line = (label, list) => {
  const k = list.filter((r) => r.failed).length, n = list.length, [lo, hi] = wilson(k, n);
  return `${label.padEnd(34)} ${String(k).padStart(4)} / ${String(n).padEnd(5)} ${pct(n ? k / n : 0).padStart(7)}  [${pct(lo)} - ${pct(hi)}]`;
};
const group = (title, key) => {
  console.log(`\n== ${title}`);
  const keys = [...new Set(q.map(key))].sort((a, b) => String(a).localeCompare(String(b), 'en', { numeric: true }));
  for (const k of keys) console.log(line(String(k), q.filter((r) => key(r) === k)));
};

console.log(line('ALL queries', q));
group('by run', (r) => r.run);
group('by site', (r) => r.run.split('-').pop());
group('by layer', (r) => `layer ${r.layer}`);
group('by kind', (r) => (r.countOnly ? 'count' : r.idsOnly ? 'ids' : `features f=${r.f}${r.quantization ? ' quantized' : ''}`));

console.log('\n== errors');
const errs = {};
for (const r of q.filter((r) => r.failed)) {
  const k = `layer ${r.layer}: ${r.status} / ${r.errorCode ?? r.netError ?? r.bodyError} ${r.errorMessage ?? ''}`;
  errs[k] = (errs[k] || 0) + 1;
}
for (const [k, n] of Object.entries(errs).sort((a, b) => b[1] - a[1])) console.log(String(n).padStart(4), k);

console.log('\n== per load (failed/queries), by run');
for (const run of [...new Set(q.map((r) => r.run))]) {
  const loads = [...new Set(q.filter((r) => r.run === run).map((r) => r.load))];
  const at = rows.find((r) => r.run === run && r.kind === 'load')?.at;
  console.log(run.padEnd(10), at, loads.map((l) => { const x = q.filter((r) => r.run === run && r.load === l); return `${x.filter((r) => r.failed).length}/${x.length}`; }).join(' '));
}

const retries = rows.filter((r) => r.kind === 'retry');
const tries = retries.flatMap((r) => r.tries);
console.log(`\n== re-asked failed queries: ${retries.length} queries, ${tries.length} tries, ${tries.filter((t) => t === 'ok').length} ok; ` +
  `queries ok on the first re-ask: ${retries.filter((r) => r.tries[0] === 'ok').length}`);

const ms = (list) => { const s = list.map((r) => r.ms).sort((a, b) => a - b); return s.length ? `median ${s[s.length >> 1]} ms, p90 ${s[Math.floor(s.length * 0.9)]} ms` : '-'; };
console.log(`\n== time to answer: ok ${ms(q.filter((r) => !r.failed))}; failed ${ms(q.filter((r) => r.failed))}`);
const other = rows.filter((r) => r.kind === 'req' && r.op !== 'query');
console.log(`== non-query requests: ${other.length}, failed ${other.filter((r) => r.failed).length}`);
