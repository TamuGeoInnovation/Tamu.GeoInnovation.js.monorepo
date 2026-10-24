// GIS Day release check (written 23 Oct 2026 by work's GIS Day chat). Run against the LOCAL stack on the release commit,
// signed in as the dev tenant's test admin (C:/TAMU/gisday-local/auth0-dev.local.env, never printed). Covers sign-in,
// admin saves keeping every field (event, sponsor, speaker, class), sponsor uploads (25 KB accepted, 6 MB refused 413),
// and registration (needs a test admin with a completed profile). Put small.png and big.png (over 5 MiB) in <scratch>/rel/.
// Run:  MSYS_NO_PATHCONV=1 docker run --rm --network container:gisday-dev -m 4g -v "C:/TAMU/<checkout>:/w" \
//        -v <node_modules volume with playwright>:/w/node_modules -v "<scratch>:/s" -v "C:/TAMU/gisday-local:/auth:ro" \
//        mcr.microsoft.com/playwright:v1.63.0-noble node /s/gisday-release-check.cjs    (add 'rest' to skip the saves)
// It changes one text field per entity and puts it back; it creates 'REL CHECK' sponsors: delete them afterwards
// (until #2205 is fixed, by SQL: assets rows first, then sponsors).
// Pre-release checks of ee1a9e499 (sha-ee1a9e4) on the local stack, signed in as the test admin, for the security
// chat's list: admin saves keep every field (class-validator whitelist, #2128), uploads and their limit (#2125,
// #2126), sign-in and authenticated pages (jws/jsonwebtoken, #2149), registration.
const { chromium } = require('/w/node_modules/playwright');
const fs = require('fs');
const base = 'http://localhost:4201';
const env = Object.fromEntries(fs.readFileSync('/auth/auth0-dev.local.env', 'utf8').split(/\r?\n/).map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2]]));
const results = [];
const note = (name, ok, detail) => { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: ${detail}`); };
async function throughSignIn(page) {
  for (let i = 0; i < 8; i++) {
    await page.waitForLoadState('domcontentloaded'); await page.waitForTimeout(3000);
    if (new URL(page.url()).origin === base) return;
    if (await page.locator('input[name="password"]').count()) {
      await page.fill('input[name="username"], input[name="email"]', env.TEST_ADMIN_EMAIL);
      await page.fill('input[name="password"]', env.TEST_ADMIN_PASSWORD);
      await page.click('button[type="submit"][name="action"], button[type="submit"]');
    } else if (await page.getByRole('button', { name: 'Accept' }).count()) { await page.getByRole('button', { name: 'Accept' }).click(); }
    await page.waitForTimeout(2500);
  }
  throw new Error('sign-in stuck at ' + page.url().split('?')[0]);
}
const snapshot = (page) => page.evaluate(() => {
  const o = {};
  for (const el of document.querySelectorAll('form [formcontrolname]')) {
    const k = el.getAttribute('formcontrolname');
    const inp = el.matches('input,textarea,select') ? el : el.querySelector('input:not([type=file]),textarea,select');
    if (!inp) continue;
    o[k] = inp.type === 'checkbox' ? inp.checked : inp.value;
  }
  return o;
});
const writes = (page) => { const seen = []; page.on('response', (r) => { const m = r.request().method(); if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(m) && /ANGULAR_API_URL/.test(r.url())) seen.push(`${m} ${r.url().split('___/')[1]} ${r.status()}`); }); return seen; };
async function submit(page) { await page.locator('form tamu-gisc-button[type="submit"], form button[type="submit"]').last().click(); await page.waitForTimeout(3500); }

async function roundTrip(page, seen, area) {
  await page.goto(`${base}/admin/${area}`, { waitUntil: 'domcontentloaded' }); await throughSignIn(page); await page.waitForTimeout(4000);
  const row = page.locator('tr.selectable, .selectable, [routerlink*="edit"], a[href*="/edit/"]').first();
  if (!(await row.count())) return note(`save keeps every field: ${area}`, false, 'no row to open');
  await row.click(); await page.waitForTimeout(4000);
  const url = page.url();
  const before = await snapshot(page);
  const field = ['description', 'abstract', 'bio', 'title', 'name'].find((f) => typeof before[f] === 'string');
  if (!field) return note(`save keeps every field: ${area}`, false, `no text field among ${Object.keys(before).join(', ')}`);
  const marker = ' [rel-check]';
  const target = page.locator(`form [formcontrolname="${field}"]`).first();
  const box = (await target.evaluate((e) => e.matches('input,textarea'))) ? target : target.locator('input,textarea').first();
  await box.fill(before[field] + marker);
  const n = seen.length; await submit(page);
  const write = seen.slice(n).join('; ') || 'no request';
  await page.goto(url, { waitUntil: 'domcontentloaded' }); await throughSignIn(page); await page.waitForTimeout(4000);
  const after = await snapshot(page);
  const lost = Object.keys(before).filter((k) => k !== field && String(before[k]) !== String(after[k]));
  const saved = after[field] === before[field] + marker;
  note(`save keeps every field: ${area}`, saved && lost.length === 0 && /\s2\d\d$/.test(write.split('; ')[0]), `${Object.keys(before).length} fields; ${write}; changed field saved: ${saved}; fields that differ afterwards: ${lost.length ? lost.map((k) => `${k} ${JSON.stringify(before[k])} -> ${JSON.stringify(after[k])}`).join(', ') : 'none'}`);
  // Put it back.
  const box2 = (await page.locator(`form [formcontrolname="${field}"]`).first().evaluate((e) => e.matches('input,textarea'))) ? page.locator(`form [formcontrolname="${field}"]`).first() : page.locator(`form [formcontrolname="${field}"]`).first().locator('input,textarea').first();
  await box2.fill(before[field]); await submit(page);
}

async function sponsorUpload(page, seen, name, file, expectOk) {
  await page.goto(`${base}/admin/sponsors`, { waitUntil: 'domcontentloaded' }); await throughSignIn(page); await page.waitForTimeout(3000);
  await page.goto(`${base}/admin/sponsors/add`, { waitUntil: 'domcontentloaded' }); await throughSignIn(page); await page.waitForTimeout(4000);
  await page.locator('form [formcontrolname="name"] input, form input[formcontrolname="name"]').first().fill(name);
  await page.locator('form input[type="file"]').first().setInputFiles(file);
  const n = seen.length; await submit(page);
  const write = seen.slice(n).join('; ') || 'no request';
  const status = Number((write.split('; ')[0].match(/(\d{3})$/) || [])[1]);
  note(`upload ${expectOk ? 'accepted' : 'refused'}: ${name}`, expectOk ? status >= 200 && status < 300 : status === 413, write);
  return status;
}

(async () => {
  const b = await chromium.launch();
  const page = await (await b.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: 'America/Chicago' })).newPage();
  const seen = writes(page);
  // Sign-in and an authenticated admin page (#2149: jws through jsonwebtoken, on the token path).
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(3000);
  await page.getByText('Login/Signup').first().click(); await page.waitForTimeout(2000); await throughSignIn(page);
  const authed = []; page.on('response', (r) => { if (/ANGULAR_API_URL/.test(r.url()) && r.request().headers().authorization) authed.push(r.status()); });
  await page.goto(base + '/admin/events', { waitUntil: 'domcontentloaded' }); await throughSignIn(page); await page.waitForTimeout(5000);
  const rows = await page.locator('tr.selectable').count();
  note('sign-in and an authenticated admin page', rows > 0 && authed.length > 0 && authed.every((s) => s < 400), `${rows} events listed; ${authed.length} authenticated API calls, statuses ${[...new Set(authed)].join(',')}`);
  for (const area of (process.argv[2] === 'rest' ? [] : ['events', 'sponsors', 'speakers', 'classes'])) {
    try { await roundTrip(page, seen, area); } catch (e) { note(`save keeps every field: ${area}`, false, String(e).slice(0, 200)); }
  }
  try { await sponsorUpload(page, seen, 'REL CHECK small logo', '/s/rel/small.png', true); } catch (e) { note('upload accepted', false, String(e).slice(0, 200)); }
  try { await sponsorUpload(page, seen, 'REL CHECK oversized logo', '/s/rel/big.png', false); } catch (e) { note('upload refused', false, String(e).slice(0, 200)); }
  // Registration: register for the first session that offers it, then unregister.
  try {
    await page.locator('a#linkSessions, a[href="/sessions"]').first().click(); await page.waitForTimeout(6000);
    const box = page.locator('tamu-gisc-event-row tamu-gisc-checkbox, tamu-gisc-event-row input[type="checkbox"]').first();
    const n = seen.length; await box.click(); await page.waitForTimeout(3000);
    const reg = seen.slice(n).join('; ') || 'no request';
    const m = seen.length; await box.click(); await page.waitForTimeout(3000);
    const unreg = seen.slice(m).join('; ') || 'no request';
    const toast = await page.locator('tamu-gisc-notification-container, .notification, [class*=toast]').allInnerTexts().catch(() => []);
    if (reg === 'no request') console.log('toast: ' + toast.join(' | ').slice(0, 300));
    note('event registration and unregistration', /\s2\d\d$/.test(reg) && /\s2\d\d$/.test(unreg), `register: ${reg}; unregister: ${unreg}`);
  } catch (e) { note('event registration', false, String(e).slice(0, 200)); }
  fs.writeFileSync('/s/rel/results.json', JSON.stringify(results, null, 1));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
