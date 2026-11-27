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
const ticked = async (box: Locator) =>
  (await box.locator('.icon-container i.material-icons').textContent())?.trim() === 'check_box';

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

      expect((await sentTo(admin, 'POST', new RegExp(`^/${kind.path}$`))).body).toEqual({
        guid: '',
        type: 'Another made-up kind'
      });
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

    expect((await sentTo(admin, 'PATCH', /^\/sponsors\/sp-1$/)).body).toEqual({
      ...sent,
      description: 'A made-up sponsor, edited.'
    });
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
  const texts = [
    'firstName',
    'lastName',
    'email',
    'description',
    'socialMedia',
    'graduationYear',
    'degree',
    'program',
    'affiliation'
  ] as const;
  const entered = Object.fromEntries(texts.map((name) => [name, speaker[name]]));
  // A 1-by-1 pixel PNG.
  const photo = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );

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

test.describe('Seasons and their days (#3839)', () => {
  const season = {
    guid: 's-2031',
    year: 2031,
    active: true,
    days: [
      { guid: 'd-1', date: '2031-11-18T06:00:00.000Z' },
      { guid: 'd-2', date: '2031-11-19T06:00:00.000Z' }
    ]
  };

  test('Edit opens with the season, and saves every field and day of it with a day added', async ({ browser, baseURL }) => {
    const admin = await openAdmin(browser, baseURL!, [{ path: '/seasons/s-2031', json: season }, ACTIVE_SEASON]);
    await open(admin, '/admin/seasons/edit/s-2031', field(admin.page, 'year'));

    await expect(field(admin.page, 'year')).toHaveValue('2031');
    expect(await ticked(checkbox(admin.page, 'Is active?'))).toBe(true);
    await expect(admin.page.locator('tamu-gisc-seasons-day-tile [aria-label="Remove event day"]')).toHaveCount(2);

    await admin.page.getByRole('button', { name: 'Add event day' }).click();
    await submit(admin.page, 'Update');

    const { body } = await sentTo(admin, 'PATCH', /^\/seasons\/s-2031$/);
    expect(body).toEqual({
      guid: 's-2031',
      year: 2031,
      active: true,
      days: [...season.days, { date: expect.any(String) }]
    });
    await admin.context.close();
  });
});

test.describe("The competitions designer's question types (#3839)", () => {
  const kind = {
    attribute: 'kind',
    title: 'Kind of place',
    instructions: 'Pick one.',
    type: 'select',
    enabled: true,
    isDiscriminator: true,
    options: [
      { name: 'Bench', value: 'bench' },
      { name: 'Tree', value: 'tree' }
    ]
  };
  const notes = {
    attribute: 'notes',
    title: 'Notes',
    instructions: '',
    type: 'text',
    enabled: true,
    isDiscriminator: false,
    options: []
  };
  const competition = {
    allowSubmissions: true,
    scoringOpensAt: null,
    scoringClosesAt: null,
    form: { guid: 'fm-1', source: 'https://example.test/made-up/FeatureServer/0', model: [kind, notes] }
  };

  test('Changing one question to each type saves every question as it was, with that type', async ({ browser, baseURL }) => {
    for (const [label, type] of [
      ['Checkbox', 'checkbox'],
      ['Radio', 'radio'],
      ['Dropdown', 'select'],
      ['Text', 'text']
    ] as const) {
      const admin = await openAdmin(browser, baseURL!, [{ path: '/competitions/forms/active', json: competition }]);
      const question = admin.page.locator('tamu-gisc-design-question').filter({ hasText: 'Notes' });
      await open(admin, '/admin/competitions/designer', question);

      await question.locator('tamu-gisc-accordion-header').click();
      await question.locator('tamu-gisc-select[formcontrolname="type"] select').selectOption({ label });
      await submit(admin.page, 'Save');

      expect((await sentTo(admin, 'PATCH', /^\/competitions\/forms\/fm-1$/)).body).toEqual({
        form: { source: competition.form.source, model: [kind, { ...notes, type }] },
        season: { allowSubmissions: true, scoringOpensAt: null, scoringClosesAt: null }
      });
      await admin.context.close();
    }
  });
});

test.describe('Events (#3839)', () => {
  const day = { guid: 'd-1', date: '2031-11-19T06:00:00.000Z' };
  const tags = [
    { guid: 'tg-1', name: 'Workshop' },
    { guid: 'tg-2', name: 'Panel' }
  ];
  const speaker = { guid: 'pe-1', firstName: 'Cy', lastName: 'Lee', organization: { guid: 'or-1', name: 'Example County' } };
  const location = { guid: 'lo-1', building: 'Example Hall', room: '101', place: { guid: 'pl-1' } };
  const broadcast = { guid: 'br-1', name: 'Example stream', place: { guid: 'pl-1' } };
  const lists: Array<ApiAnswer> = [
    ACTIVE_SEASON,
    { path: '/tags/season/active', json: tags },
    { path: '/speakers/season/active', json: [speaker] },
    { path: '/event-broadcasts/season/active', json: [broadcast] },
    { path: '/event-locations/season/active', json: [location] }
  ];
  /**
   * The event as `GET /events/:guid` answers. Its recorded attendance is not in it: the API leaves
   * `observedAttendeeStart` and `observedAttendeeEnd` out of every read but `GET /events/:guid/attendance`.
   */
  const event = {
    guid: 'ev-1',
    name: 'Mapping with drones',
    abstract: 'A made-up session.',
    day,
    startTime: '09:00:00 GMT-0600',
    endTime: '10:30:00 GMT-0600',
    checkInMinutesBefore: 15,
    checkInMinutesAfter: 10,
    mode: 'hybrid',
    eventType: 'open',
    presentationType: 'group',
    location,
    broadcast,
    requirements: 'A laptop.',
    resources: 'https://example.edu/slides',
    active: true,
    requiresRsvp: true,
    isAcceptingRsvps: false,
    isBringYourOwnDevice: true,
    checkInAnyTime: false,
    noSlides: false,
    judgedCompetition: '',
    judgingClosed: false,
    tags: [tags[1]],
    speakers: [speaker]
  };
  const editing: Array<ApiAnswer> = [
    ...lists,
    { path: '/events/ev-1', json: event },
    { path: '/events/ev-1/judging', json: { judgedCompetition: null, judgingClosed: false, judges: [] } },
    { path: '/events/ev-1/attendance', json: { observedAttendeeStart: 12, observedAttendeeEnd: 15 } },
    { path: '/session-files/event/ev-1', json: [] }
  ];

  /** Every field the form has, as an edit that changes nothing else must send it. */
  const unchanged = {
    guid: 'ev-1',
    name: event.name,
    abstract: event.abstract,
    day: 'd-1',
    startTime: event.startTime,
    endTime: event.endTime,
    checkInMinutesBefore: 15,
    checkInMinutesAfter: 10,
    mode: 'hybrid',
    eventType: 'open',
    presentationType: 'group',
    location: 'lo-1',
    broadcast: 'br-1',
    requirements: event.requirements,
    resources: event.resources,
    active: true,
    requiresRsvp: true,
    isAcceptingRsvps: false,
    isBringYourOwnDevice: true,
    checkInAnyTime: false,
    noSlides: false,
    judgingClosed: false,
    tags: ['tg-2'],
    speakers: ['pe-1']
  };

  async function editAbstract(admin: AdminPage) {
    await open(admin, '/admin/events/edit/ev-1', field(admin.page, 'name'));
    await expect(field(admin.page, 'name')).toHaveValue(event.name);
    await field(admin.page, 'abstract').fill('A made-up session, edited.');
    await submit(admin.page, 'Update');

    return (await sentTo(admin, 'PATCH', /^\/events\/ev-1$/)).body;
  }

  test('Edit opens with every field of the event', async ({ browser, baseURL }) => {
    const admin = await openAdmin(browser, baseURL!, editing);
    await open(admin, '/admin/events/edit/ev-1', field(admin.page, 'name'));

    for (const name of ['name', 'abstract', 'requirements', 'resources'] as const) {
      await expect(field(admin.page, name)).toHaveValue(event[name]);
    }
    await expect(field(admin.page, 'checkInMinutesBefore')).toHaveValue('15');
    await expect(select(admin.page, 'mode').locator('option:checked')).toHaveText(/hybrid/i);
    await expect(select(admin.page, 'location').locator('option:checked')).toHaveText(/Example Hall/);
    await expect(select(admin.page, 'broadcast').locator('option:checked')).toHaveText('Example stream');
    expect(await ticked(checkbox(admin.page, 'Requires RSVP?'))).toBe(true);
    expect(await ticked(checkbox(admin.page, 'Is accepting RSVPs?'))).toBe(false);
    expect(await ticked(checkbox(admin.page, 'Panel'))).toBe(true);
    expect(await ticked(checkbox(admin.page, 'Workshop'))).toBe(false);
    // The chosen speakers, beside the search list (whose rows are presenter cards too).
    await expect(admin.page.locator('tamu-gisc-select-list + div tamu-gisc-presenter-card')).toHaveCount(1);
    await admin.context.close();
  });

  test('An edit of the abstract sends every other field as it was', async ({ browser, baseURL }) => {
    const admin = await openAdmin(browser, baseURL!, editing);

    expect(await editAbstract(admin)).toMatchObject({ ...unchanged, abstract: 'A made-up session, edited.' });
    await admin.context.close();
  });

  test('An edit of the abstract leaves the recorded attendance alone (#3827)', async ({ browser, baseURL }) => {
    // #3827: the form never reads the attendance, so every update sent both counts as null and erased them. Expected to
    // fail until the laptop's fix (`fix/3827-event-save-keeps-attendance`, batch g50) is in; then remove this line.
    test.fail(true, '#3827: saving an event erases its recorded attendance');
    const admin = await openAdmin(browser, baseURL!, editing);
    const body = await editAbstract(admin);

    // Either leave the counts out, so the API keeps them, or send them as recorded.
    for (const [name, recorded] of [
      ['observedAttendeeStart', 12],
      ['observedAttendeeEnd', 15]
    ] as const) {
      expect(name in body ? body[name] : recorded, name).toBe(recorded);
    }
    await admin.context.close();
  });

  test('Add sends what was entered', async ({ browser, baseURL }) => {
    const admin = await openAdmin(browser, baseURL!, lists);
    await open(admin, '/admin/events/add', field(admin.page, 'name'));

    await admin.page.locator('tamu-gisc-seasons-day-tile[role="button"]').first().click();
    // Picking the day sets both times to its midnight, which the form refuses; each is set with its picker.
    for (const [heading, time] of [
      ['Event start time', '9:00 AM'],
      ['Event end time', '10:30 AM']
    ] as const) {
      const picker = admin.page
        .getByText(heading, { exact: true })
        .locator('xpath=ancestor::div[1]')
        .locator('tamu-gisc-date-time-picker');
      await picker.locator('tamu-gisc-tooltip-trigger').click();
      // Only the open picker's input is drawn.
      const input = admin.page.locator('input.date-time-picker-time');
      await input.fill(time);
      await input.press('Enter');
      // Closed by a click outside it, as the tooltip expects: Escape on an admin page asks to leave without saving.
      await admin.page.getByText(heading, { exact: true }).click();
      await expect(input).toHaveCount(0);
    }
    await field(admin.page, 'name').fill(event.name);
    await field(admin.page, 'abstract').fill(event.abstract);
    await select(admin.page, 'mode').selectOption({ label: 'Hybrid' });
    await select(admin.page, 'eventType').selectOption({ index: 1 });
    await select(admin.page, 'presentationType').selectOption({ index: 2 });
    await select(admin.page, 'location').selectOption({ label: 'Example Hall - 101' });
    await tick(admin.page, 'Panel');
    await submit(admin.page, 'Create');

    const { body } = await sentTo(admin, 'POST', /^\/events$/);
    expect(body).toMatchObject({
      name: event.name,
      abstract: event.abstract,
      day: 'd-1',
      mode: 'hybrid',
      location: 'lo-1',
      tags: ['tg-2'],
      season: 's-2031'
    });
    expect(String(body['startTime'])).toMatch(/^09:00:00/);
    expect(String(body['endTime'])).toMatch(/^10:30:00/);
    await admin.context.close();
  });
});
