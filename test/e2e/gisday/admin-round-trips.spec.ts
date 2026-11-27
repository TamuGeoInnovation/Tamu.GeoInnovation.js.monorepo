import { Locator, Page, expect, test } from '@playwright/test';

import { ApiAnswer } from './admin-capture';
import { AdminPage, openAdmin, sentTo } from './admin-round-trip';

/**
 * Every admin form's save round trip (#3839), as the laptop's g49 walk did by hand on 26 November 2026: the Add form
 * sends what was entered, the Edit form opens with every field the record has, and saving an edit sends every field the
 * record had, not only the one changed. The last is the shape of #3827, which erased an event's attendance on every
 * edit and which no test caught. Signed in and with the API answered in the browser (admin-round-trip.ts, on #3806's
 * admin-capture.ts); nothing reaches Auth0 or an API. Every record is made up.
 */

const SEASON = { guid: 's-2031', year: 2031, active: true, days: [{ guid: 'd-1', date: '2031-11-19T06:00:00.000Z' }] };
const ACTIVE_SEASON: ApiAnswer = { path: '/seasons/active', json: SEASON };

/** A textbox or textarea of the form, by its control name. */
const field = (page: Page, name: string): Locator =>
  page.locator(`tamu-gisc-textbox[formcontrolname="${name}"]`).locator('input, textarea');

/** A checkbox of the form, by its label. */
const checkbox = (page: Page, label: string): Locator =>
  page.locator('tamu-gisc-checkbox').filter({ has: page.getByText(label, { exact: true }) });

/** Whether a checkbox is ticked, as it shows it: its icon (the hidden input is not bound to the value). */
const ticked = async (box: Locator) => (await box.locator('.icon-container i.material-icons').textContent())?.trim() === 'check_box';

/** A plain select of the form, by its control name. */
const select = (page: Page, name: string): Locator => page.locator(`tamu-gisc-select[formcontrolname="${name}"] select`);

async function submit(page: Page, value: 'Create' | 'Update' | 'Save') {
  await page.locator(`input[type="submit"][value="${value}"]`).click();
}

async function open(admin: AdminPage, path: string, ready: Locator) {
  await admin.page.goto(path);
  await expect(ready).toBeVisible({ timeout: 30_000 });
  // The edit forms patch the loaded record in after the first render.
  await admin.page.waitForTimeout(300);
}

for (const kind of [
  { name: 'RSVP Types', path: 'rsvp-types', label: 'Type' },
  { name: 'Submission Types', path: 'submission-types', label: 'Submission Type' }
]) {
  test.describe(`${kind.name} (#3839)`, () => {
    const record = { guid: 'ty-1', type: 'Made-up kind' };

    test('Add sends what was entered', async ({ browser, baseURL }) => {
      const admin = await openAdmin(browser, baseURL!, []);
      await open(admin, `/admin/${kind.path}/add`, field(admin.page, 'type'));

      await field(admin.page, 'type').fill('Another made-up kind');
      await submit(admin.page, 'Create');

      expect((await sentTo(admin, 'POST', new RegExp(`^/${kind.path}$`))).body).toEqual({ guid: '', type: 'Another made-up kind' });
      await admin.context.close();
    });

    test('Edit opens with the record, and saves every field of it', async ({ browser, baseURL }) => {
      const admin = await openAdmin(browser, baseURL!, [{ path: `/${kind.path}/ty-1`, json: record }]);
      await open(admin, `/admin/${kind.path}/edit/ty-1`, field(admin.page, 'type'));

      await expect(field(admin.page, 'type')).toHaveValue('Made-up kind');
      await field(admin.page, 'type').fill('Made-up kind (edited)');
      await submit(admin.page, 'Update');

      expect((await sentTo(admin, 'PATCH', new RegExp(`^/${kind.path}/ty-1$`))).body).toEqual({
        guid: 'ty-1',
        type: 'Made-up kind (edited)'
      });
      await admin.context.close();
    });
  });
}

test.describe('Sponsors (#3839)', () => {
  const sponsor = {
    guid: 'sp-1',
    name: 'Example Mapping Co.',
    website: 'https://example.com',
    description: 'A made-up sponsor.',
    contactFirstName: 'Ana',
    contactLastName: 'Ruiz',
    contactEmail: 'ana.ruiz@example.com',
    active: true,
    sponsorshipLevel: 'polygon',
    logoSize: 'large',
    season: SEASON,
    logos: []
  };
  /** Every field the sponsor's form sends, as the API reads it from the multipart body. */
  const sent = {
    guid: 'sp-1',
    name: 'Example Mapping Co.',
    website: 'https://example.com',
    description: 'A made-up sponsor.',
    contactFirstName: 'Ana',
    contactLastName: 'Ruiz',
    contactEmail: 'ana.ruiz@example.com',
    active: 'true',
    sponsorshipLevel: 'polygon',
    logoSize: 'large',
    season: 's-2031'
  };

  test('Add sends what was entered', async ({ browser, baseURL }) => {
    const admin = await openAdmin(browser, baseURL!, [ACTIVE_SEASON]);
    await open(admin, '/admin/sponsors/add', field(admin.page, 'name'));

    await field(admin.page, 'name').fill(sponsor.name);
    await field(admin.page, 'website').fill(sponsor.website);
    await field(admin.page, 'description').fill(sponsor.description);
    await field(admin.page, 'contactFirstName').fill(sponsor.contactFirstName);
    await field(admin.page, 'contactLastName').fill(sponsor.contactLastName);
    await field(admin.page, 'contactEmail').fill(sponsor.contactEmail);
    await select(admin.page, 'sponsorshipLevel').selectOption({ label: 'Polygon' });
    await select(admin.page, 'logoSize').selectOption({ label: 'Large' });
    await submit(admin.page, 'Create');

    const { guid, ...entered } = sent;
    expect(guid).toBe('sp-1');
    expect((await sentTo(admin, 'POST', /^\/sponsors$/)).body).toEqual(entered);
    await admin.context.close();
  });

  test('Edit opens with the record, and saves every field of it', async ({ browser, baseURL }) => {
    const admin = await openAdmin(browser, baseURL!, [{ path: '/sponsors/sp-1', json: sponsor }]);
    await open(admin, '/admin/sponsors/edit/sp-1', field(admin.page, 'name'));

    for (const name of ['name', 'website', 'description', 'contactFirstName', 'contactLastName', 'contactEmail'] as const) {
      await expect(field(admin.page, name)).toHaveValue(sponsor[name]);
    }
    expect(await ticked(checkbox(admin.page, 'Active this season (shown on the Sponsors page)'))).toBe(true);

    await field(admin.page, 'description').fill('A made-up sponsor, edited.');
    await submit(admin.page, 'Update');

    expect((await sentTo(admin, 'PATCH', /^\/sponsors\/sp-1$/)).body).toEqual({ ...sent, description: 'A made-up sponsor, edited.' });
    await admin.context.close();
  });
});

/** Ticks or unticks a checkbox by its label, as a person would: its input lies over its icon and takes the click. */
async function tick(page: Page, label: string) {
  await checkbox(page, label).locator('input[type="checkbox"]').click();
}

/** Chooses `name` in a searchable select, by typing it and picking it from the list. */
async function search(page: Page, control: string, name: string) {
  const box = page.locator(`tamu-gisc-select[formcontrolname="${control}"]`);
  await box.locator('input').fill(name);
  await box.locator('.autocomplete-item[role="option"]', { hasText: name }).first().click();
}

test.describe('Organizations, the Affiliations (#3839)', () => {
  const organization = {
    guid: 'or-1',
    name: 'Example County',
    acronym: 'EC',
    website: 'https://example.org',
    text: 'A made-up affiliation.',
    contactFirstName: 'Di',
    contactLastName: 'Park',
    contactEmail: 'di.park@example.org',
    season: SEASON,
    logos: []
  };
  const texts = ['name', 'acronym', 'website', 'text', 'contactFirstName', 'contactLastName', 'contactEmail'] as const;
  const sent = { guid: 'or-1', ...Object.fromEntries(texts.map((name) => [name, organization[name]])), season: 's-2031' };

  test('Add sends what was entered', async ({ browser, baseURL }) => {
    const admin = await openAdmin(browser, baseURL!, [ACTIVE_SEASON]);
    await open(admin, '/admin/organizations/add', field(admin.page, 'name'));

    for (const name of texts) {
      await field(admin.page, name).fill(organization[name]);
    }
    await submit(admin.page, 'Create');

    const { guid, ...entered } = sent;
    expect(guid).toBe('or-1');
    expect((await sentTo(admin, 'POST', /^\/organizations$/)).body).toEqual(entered);
    await admin.context.close();
  });

  test('Edit opens with the record, and saves every field of it', async ({ browser, baseURL }) => {
    const admin = await openAdmin(browser, baseURL!, [{ path: '/organizations/or-1', json: organization }]);
    await open(admin, '/admin/organizations/edit/or-1', field(admin.page, 'name'));

    for (const name of texts) {
      await expect(field(admin.page, name)).toHaveValue(organization[name]);
    }
    await field(admin.page, 'acronym').fill('ECo');
    await submit(admin.page, 'Update');

    expect((await sentTo(admin, 'PATCH', /^\/organizations\/or-1$/)).body).toEqual({ ...sent, acronym: 'ECo' });
    await admin.context.close();
  });
});

test.describe('Places, the Organizations (#3839)', () => {
  const place = {
    guid: 'pl-1',
    name: 'Example University',
    address: '1 Example Way',
    city: 'Example City',
    state: 'TX',
    zip: '77840',
    website: 'https://example.edu',
    visibilitySettings: ['header', 'sessions-filter'],
    links: [{ guid: 'ln-1', label: 'Campus map', url: 'https://example.edu/map' }],
    season: SEASON,
    logos: []
  };
  const texts = ['name', 'address', 'city', 'state', 'zip', 'website'] as const;
  const entered = Object.fromEntries(texts.map((name) => [name, place[name]]));

  test('Add sends what was entered, its links and where it shows', async ({ browser, baseURL }) => {
    const admin = await openAdmin(browser, baseURL!, [ACTIVE_SEASON]);
    await open(admin, '/admin/places/add', field(admin.page, 'name'));

    for (const name of texts) {
      await field(admin.page, name).fill(place[name]);
    }
    await tick(admin.page, 'Header');
    await tick(admin.page, 'Sessions Filter');
    await admin.page.getByRole('button', { name: /Add link/ }).click();
    const link = admin.page.locator('tamu-gisc-place-link-form').last();
    await link.locator('tamu-gisc-textbox[placeholder="Label"]').locator('input').fill('Campus map');
    await link.locator('tamu-gisc-textbox[placeholder="URL"]').locator('input').fill('https://example.edu/map');
    await submit(admin.page, 'Create');

    const { body } = await sentTo(admin, 'POST', /^\/places$/);
    expect(body).toMatchObject({ ...entered, season: 's-2031' });
    expect(JSON.parse(body['visibilitySettings'] as string)).toEqual(['header', 'sessions-filter']);
    expect(JSON.parse(body['links'] as string)).toEqual([
      expect.objectContaining({ label: 'Campus map', url: 'https://example.edu/map' })
    ]);
    await admin.context.close();
  });

  test('Edit opens with the record, and saves every field of it', async ({ browser, baseURL }) => {
    const admin = await openAdmin(browser, baseURL!, [{ path: '/places/pl-1', json: place }]);
    await open(admin, '/admin/places/edit/pl-1', field(admin.page, 'name'));

    for (const name of texts) {
      await expect(field(admin.page, name)).toHaveValue(place[name]);
    }
    expect(await ticked(checkbox(admin.page, 'Header'))).toBe(true);
    expect(await ticked(checkbox(admin.page, 'Footer'))).toBe(false);
    await expect(admin.page.locator('tamu-gisc-textbox[placeholder="Label"]').locator('input')).toHaveValue('Campus map');

    await field(admin.page, 'city').fill('Another Example City');
    await submit(admin.page, 'Update');

    const { body } = await sentTo(admin, 'PATCH', /^\/places\/pl-1$/);
    expect(body).toMatchObject({ guid: 'pl-1', ...entered, city: 'Another Example City' });
    expect(JSON.parse(body['visibilitySettings'] as string)).toEqual(['header', 'sessions-filter']);
    expect(JSON.parse(body['links'] as string)).toEqual(place.links);
    await admin.context.close();
  });
});

test.describe('Speakers (#3839)', () => {
  const university = { guid: 'un-1', name: 'Example University' };
  const organization = { guid: 'or-1', name: 'Example County' };
  const lists: Array<ApiAnswer> = [
    { path: '/universities/season/active', json: [university] },
    { path: '/organizations/season/active', json: [organization] }
  ];
  const speaker = {
    guid: 'pe-1',
    firstName: 'Cy',
    lastName: 'Lee',
    email: 'cy.lee@example.edu',
    description: 'A made-up speaker.',
    socialMedia: 'https://example.edu/cy',
    graduationYear: '2030',
    degree: 'MS',
    program: 'Geography',
    affiliation: 'Example lab',
    isOrganizer: false,
    isActive: true,
    university,
    organization,
    images: [],
    season: SEASON
  };
  const texts = ['firstName', 'lastName', 'email', 'description', 'socialMedia', 'graduationYear', 'degree', 'program', 'affiliation'] as const;
  const entered = Object.fromEntries(texts.map((name) => [name, speaker[name]]));
  // A 1-by-1 pixel PNG.
  const photo = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

  test('Add sends what was entered, with a photo', async ({ browser, baseURL }) => {
    const admin = await openAdmin(browser, baseURL!, [ACTIVE_SEASON, ...lists]);
    await open(admin, '/admin/speakers/add', field(admin.page, 'firstName'));

    for (const name of texts) {
      await field(admin.page, name).fill(speaker[name]);
    }
    await search(admin.page, 'university', 'Example University');
    await search(admin.page, 'organization', 'Example County');
    await tick(admin.page, 'Is Active');
    await admin.page
      .locator('tamu-gisc-file input[type="file"]')
      .first()
      .setInputFiles({ name: 'made-up-photo.png', mimeType: 'image/png', buffer: photo });
    await submit(admin.page, 'Create');

    expect((await sentTo(admin, 'POST', /^\/speakers$/)).body).toMatchObject({
      ...entered,
      university: 'un-1',
      organization: 'or-1',
      isActive: 'true',
      isOrganizer: 'false',
      season: 's-2031',
      file: expect.objectContaining({ size: expect.any(Number) })
    });
    await admin.context.close();
  });

  test('Edit opens with the record, and saves every field of it', async ({ browser, baseURL }) => {
    const admin = await openAdmin(browser, baseURL!, [...lists, { path: '/speakers/pe-1', json: speaker }]);
    await open(admin, '/admin/speakers/edit/pe-1', field(admin.page, 'firstName'));

    for (const name of texts) {
      await expect(field(admin.page, name)).toHaveValue(speaker[name]);
    }
    expect(await ticked(checkbox(admin.page, 'Is Active'))).toBe(true);

    await field(admin.page, 'degree').fill('PhD');
    await submit(admin.page, 'Update');

    expect((await sentTo(admin, 'PATCH', /^\/speakers\/pe-1$/)).body).toEqual({
      guid: 'pe-1',
      ...entered,
      degree: 'PhD',
      university: 'un-1',
      organization: 'or-1',
      isOrganizer: 'false',
      isActive: 'true'
    });
    await admin.context.close();
  });
});
