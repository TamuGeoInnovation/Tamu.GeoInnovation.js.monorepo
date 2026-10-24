// GIS Day release check, part 2: Show/Hide on schedule (PATCH events/active) both ways, and deleting the REL CHECK
// sponsors through the admin form (fails with 500 until #2205 is fixed). Same docker command as part 1.
const { chromium } = require('/w/node_modules/playwright');
const fs = require('fs');
const base = 'http://localhost:4201';
const env = Object.fromEntries(fs.readFileSync('/auth/auth0-dev.local.env', 'utf8').split(/\r?\n/).map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2]]));
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
  throw new Error('sign-in stuck');
}
(async () => {
  const b = await chromium.launch();
  const page = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  const seen = []; page.on('response', (r) => { const m = r.request().method(); if (m !== 'GET' && /ANGULAR_API_URL/.test(r.url())) seen.push(`${m} ${r.url().split('___/')[1]} ${r.status()}`); });
  page.on('dialog', (d) => d.accept());
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(3000);
  await page.getByText('Login/Signup').first().click(); await page.waitForTimeout(2000); await throughSignIn(page);
  // Show/Hide on schedule (PATCH events/active), then put it back.
  await page.goto(base + '/admin/events', { waitUntil: 'domcontentloaded' }); await throughSignIn(page); await page.waitForTimeout(5000);
  const row = page.locator('tr.selectable').last();
  await row.locator('input[type="checkbox"]').first().click(); await page.waitForTimeout(800);
  let n = seen.length; await page.getByText('Hide from schedule').click(); await page.waitForTimeout(2500);
  console.log('hide:', seen.slice(n).join('; ') || 'no request');
  await row.locator('input[type="checkbox"]').first().click(); await page.waitForTimeout(800);
  n = seen.length; await page.getByText('Show on schedule').click(); await page.waitForTimeout(2500);
  console.log('show:', seen.slice(n).join('; ') || 'no request');
  // Delete the two test sponsors through the admin form.
  for (let i = 0; i < 2; i++) {
    await page.goto(base + '/admin/sponsors', { waitUntil: 'domcontentloaded' }); await throughSignIn(page); await page.waitForTimeout(4000);
    const r = page.locator('tr.selectable, .selectable', { hasText: 'REL CHECK' }).first();
    if (!(await r.count())) { console.log('no REL CHECK sponsor left'); break; }
    await r.click(); await page.waitForTimeout(3000);
    n = seen.length; await page.getByText('Delete Sponsor').click(); await page.waitForTimeout(1500);
    const confirm = page.getByRole('button', { name: /^(Delete|Confirm|Yes)/ }).last();
    if (await confirm.count()) { await confirm.click(); await page.waitForTimeout(2500); }
    console.log('delete sponsor:', seen.slice(n).join('; ') || 'no request');
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
