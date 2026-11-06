// Tallies run.cjs's JSONL: per delay bucket, outcomes; and the same split by whether the click came before or after
// the probe said ready and drawing had stopped.
const fs = require('fs');
for (const file of process.argv.slice(2)) {
  const rows = fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const med = (xs) => { const s = xs.filter((x) => typeof x === 'number').sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : '-'; };
  console.log(`\n== ${file}: ${rows.length} loads`);
  const buckets = [...new Set(rows.map((r) => r.delay))];
  const kinds = [...new Set(rows.map((r) => r.result))].sort();
  console.log(['bucket', ...kinds, 'click ms', 'answer ms (median)'].join(' | '));
  for (const b of buckets) {
    const rs = rows.filter((r) => r.delay === b);
    console.log([b, ...kinds.map((k) => rs.filter((r) => r.result === k).length), med(rs.map((r) => r.clickAt)), med(rs.map((r) => r.answeredAfter))].join(' | '));
  }
  const phase = (r) => (r.clickAt == null ? 'not clicked' : r.ready == null || r.clickAt < r.ready ? 'before ready' : r.drawn == null || r.clickAt < r.drawn ? 'ready, still drawing' : 'after drawing');
  console.log('\nby phase at the click:');
  for (const p of ['before ready', 'ready, still drawing', 'after drawing', 'not clicked']) {
    const rs = rows.filter((r) => phase(r) === p);
    if (rs.length) console.log(`  ${p}: ${rs.length} | ` + kinds.map((k) => `${k} ${rs.filter((r) => r.result === k).length}`).filter((x) => !/ 0$/.test(x)).join(', '));
  }
  console.log(`\nmedians (ms from navigation): load ${med(rows.map((r) => r.load))}, view ${med(rows.map((r) => r.view))}, ready ${med(rows.map((r) => r.ready))}, drawn ${med(rows.map((r) => r.drawn))}; drawn never seen in ${rows.filter((r) => r.clickAt != null && r.drawn == null).length}`);
  const wrong = rows.filter((r) => /wrong|other/.test(r.result));
  for (const r of wrong) console.log(`  wrong: ${r.delay} ${r.target} -> ${(r.popup || r.box || '').slice(0, 90)}`);
  const errs = rows.filter((r) => /error|unusable/.test(r.result));
  for (const r of errs) console.log(`  ${r.result}: ${r.delay} ${r.why}`);
}
