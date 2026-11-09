// Batch 28 (#2789): every bus route on each host: the stops it lists against the stops the app's own query tags with it.
const HOSTS = { development: 'gis.dev.tamu.edu', production: 'arc.ts.tamu.edu' };
const q = async (url, params) => (await fetch(`${url}/query?${new URLSearchParams({ f: 'json', ...params })}`)).json();
const out = {};
for (const [env, host] of Object.entries(HOSTS)) {
  const base = `https://${host}/arcgis/rest/services/Hosted/Bus_Routes_view/FeatureServer`;
  const info = await (await fetch(`${base}?f=json`)).json();
  const routes = await q(`${base}/1`, { where: '1=1', outFields: '*', returnGeometry: 'false' });
  const stopCount = await q(`${base}/0`, { where: '1=1', returnCountOnly: 'true' });
  if (routes.error) { console.log(env, 'ERROR', JSON.stringify(routes.error)); continue; }
  const rows = [];
  for (const f of routes.features) {
    const a = f.attributes, num = a.routenum;
    const listed = Object.keys(a).filter((k) => /^stop\d+$/.test(k) && a[k] !== null && String(a[k]).trim() !== '').length;
    const esc = String(num).replace(/'/g, "''");
    const tagged = (await q(`${base}/0`, { where: `route LIKE '%${esc}%'`, returnCountOnly: 'true' })).count;
    const geom = (await q(`${base}/1`, { where: `routenum='${esc}'`, returnCountOnly: 'true', returnGeometry: 'true' })).count;
    rows.push({ num, name: a.routename, campus: a.campus, listed, tagged, lines: geom });
  }
  out[env] = { layers: info.layers?.map((l) => `${l.id} ${l.name}`), routes: routes.features.length, stops: stopCount.count, rows };
  console.log(`${env} (${host}): layers ${JSON.stringify(out[env].layers)}, ${out[env].routes} routes, ${out[env].stops} stops`);
}
const nums = [...new Set(Object.values(out).flatMap((e) => e.rows.map((r) => r.num)))].sort((a, b) => String(a).localeCompare(String(b), 'en', { numeric: true }));
console.log('route | name | campus | dev listed/tagged | prod listed/tagged | prod verdict');
for (const n of nums) {
  const d = out.development?.rows.find((r) => r.num === n), p = out.production?.rows.find((r) => r.num === n);
  const v = !p ? 'not on prod' : p.tagged === p.listed ? 'ok' : p.tagged === 0 ? 'NO STOPS TAGGED' : p.tagged > p.listed ? `${p.tagged - p.listed} more tagged` : `${p.listed - p.tagged} fewer tagged`;
  console.log(`${n} | ${(p ?? d).name} | ${(p ?? d).campus} | ${d ? `${d.listed}/${d.tagged}` : '-'} | ${p ? `${p.listed}/${p.tagged}` : '-'} | ${v}`);
}
