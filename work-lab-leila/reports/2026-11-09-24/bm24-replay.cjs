// Batch 24: replay one load's basemap queries outside the browser, serially and all at once, ROUNDS times each.
// Tells whether the failures follow concurrency (the browser sends a load's 36 together) or come at a flat rate.
const fs = require('fs');
const rows = fs.readFileSync(process.argv[2], 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const ROUNDS = Number(process.env.ROUNDS || 10);
const first = rows.find((r) => r.kind === 'req' && r.url);
const urls = rows.filter((r) => r.kind === 'req' && r.url && r.run === first.run && r.load === first.load).map((r) => ({ url: r.url, layer: r.layer }));

async function ask({ url, layer }) {
  const res = await fetch(url).catch((e) => null);
  if (!res) return { layer, ok: false, why: 'network' };
  const t = (await res.text()).slice(0, 400);
  const m = t.match(/"error"\s*:\s*\{\s*"code"\s*:\s*(\d+)\s*,\s*"message"\s*:\s*"([^"]*)"/);
  return { layer, ok: res.status === 200 && !m, why: m ? `${m[1]} ${m[2]}` : res.status === 200 ? null : `http ${res.status}` };
}

(async () => {
  const out = { serial: [], parallel: [] };
  for (let r = 0; r < ROUNDS; r++) {
    for (const u of urls) out.serial.push(await ask(u));
    out.parallel.push(...(await Promise.all(urls.map(ask))));
  }
  for (const [mode, list] of Object.entries(out)) {
    const bad = list.filter((x) => !x.ok), why = {};
    for (const x of bad) why[`layer ${x.layer}: ${x.why}`] = (why[`layer ${x.layer}: ${x.why}`] || 0) + 1;
    console.log(`${mode.padEnd(8)} ${bad.length}/${list.length} failed (${(100 * bad.length / list.length).toFixed(2)}%)`, JSON.stringify(why));
  }
})();
