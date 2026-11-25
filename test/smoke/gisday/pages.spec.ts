import { APIRequestContext, expect, Page, test } from '@playwright/test';

import { gisdaySite, siteHas } from '../../../libs/gisday/common/src/lib/sites';

/** Nx prefix for this workspace is `tamu-gisc`, so the root element is not the CLI default `app-root`. */
const APP_ROOT = 'tamu-gisc-root';

/**
 * Every public page of a GIS Day site, each checked for what it exists to show (#3638).
 *
 * `smoke.spec.ts` beside this one says only "serving, not empty", for a handful of pages. This opens every page a visitor
 * reaches without signing in, for the current season and the most recent past one, and checks the part that page is for:
 * the sessions list has sessions, a session's page has its title and time, the presenters page has cards, the sponsors
 * page has logos. The route table is `libs/gisday/platform/ngx/core/src/lib/pages/wrapper/wrapper.routes.ts`; a page
 * added there and not here is a page nothing checks.
 *
 * The same rules as `smoke.spec.ts`, for the same reasons:
 *
 * - **Read only.** Nothing is clicked that writes: no RSVP, registration, check-in, contact form or emailed link. The
 *   only clicks open a session or a presenter from a list, which navigates.
 * - **Only auto-retrying `expect()` assertions,** on content inside `tamu-gisc-root`: the app is client-rendered, so a
 *   one-shot read races it.
 * - **No page errors.** Each test collects them from before the page loads and checks after its content has rendered, so
 *   an app that never started fails as an empty page rather than as an incidental error.
 *
 * What a page should hold is asked of the API first, so a site with no sessions yet is checked for saying so rather than
 * failed. Pages a site leaves out (`off` in `libs/gisday/common/src/lib/sites.ts`) are skipped with the feature named:
 * the site is the one the address names, or `SMOKE_SITE` (a key such as `ucgis`) for an address that names none, such as
 * localhost. Runs against the local stack and a deployed site alike, through `SMOKE_BASE_URL`.
 */

const site = (baseURL: string | undefined) =>
  gisdaySite(process.env['SMOKE_SITE'], new URL(baseURL ?? 'https://txgisday.org').hostname);

const api = (baseURL: string | undefined) => new URL('/api/', baseURL ?? 'https://txgisday.org').toString();

async function getJson<T>(request: APIRequestContext, url: string): Promise<T> {
  const response = await request.get(url);

  expect(response.status(), url).toBe(200);

  return (await response.json()) as T;
}

/** Opens a page and starts collecting its errors; `noErrors` checks them once the page's content is asserted. */
async function open(page: Page, path: string) {
  const errors: Array<string> = [];
  page.on('pageerror', (error) => errors.push(error.message));

  const response = await page.goto(path);

  expect(response?.status(), `${path} answered ${response?.status()}`).toBeLessThan(400);
  await expect(page.locator(APP_ROOT)).not.toBeEmpty();

  return {
    root: page.locator(APP_ROOT),
    noErrors: () => expect(errors, `${path} threw: ${errors.join('; ')}`).toEqual([])
  };
}

interface Season {
  guid: string;
  year: number;
  active: boolean;
}

/** The most recent season before the active one, or undefined on a site that has none. */
async function pastSeason(request: APIRequestContext, baseURL: string | undefined): Promise<Season | undefined> {
  const seasons = await getJson<Array<Season>>(request, `${api(baseURL)}seasons`);
  const current = seasons.find((season) => season.active)?.year ?? Infinity;

  return seasons.filter((season) => season.year < current).sort((a, b) => b.year - a.year)[0];
}

interface Named {
  guid: string;
  name: string;
}

interface Speaker {
  guid: string;
  firstName: string;
  lastName: string;
}

test.describe('the current season', () => {
  test('the home page shows the site and leads to its sessions', async ({ page, baseURL }) => {
    const { root, noErrors } = await open(page, '/');

    await expect(root.locator('#landing h1.site-logo')).toContainText(site(baseURL).name);
    await expect(root.locator('a[href="/sessions"]').first()).toBeVisible();
    noErrors();
  });

  test('the sessions page lists the sessions', async ({ page, request, baseURL }) => {
    const sessions = await getJson<Array<Named>>(request, `${api(baseURL)}events/season/active`);
    const { root, noErrors } = await open(page, '/sessions');

    await expect(root.getByRole('heading', { name: 'Event Sessions', level: 1 })).toBeVisible();

    if (sessions.length) {
      // Attached, not visible: on the current year a day that has passed starts collapsed, its rows hidden by CSS.
      await expect(root.locator('tamu-gisc-event-row').first()).toBeAttached();
    } else {
      await expect(root.getByText('No sessions have been announced yet.')).toBeVisible();
    }

    noErrors();
  });

  test("a session in the list opens that session's page", async ({ page, request, baseURL }) => {
    const sessions = await getJson<Array<Named>>(request, `${api(baseURL)}events/season/active`);

    test.skip(!sessions.length, 'The current season has no sessions yet');

    const { root, noErrors } = await open(page, '/sessions');

    // The first day with sessions, opened as a visitor opens it: on the current year a day that has passed starts closed.
    const day = root.locator('tamu-gisc-accordion.card', { has: page.locator('tamu-gisc-event-row') }).first();

    await expect(day).toBeAttached();

    if (await day.evaluate((card) => card.classList.contains('collapsed'))) {
      await day.locator('tamu-gisc-accordion-header').click();
    }

    // A row opens its session by script, with no link to follow; its name, not its RSVP box, is what a visitor clicks.
    const row = day.locator('tamu-gisc-event-row').first();

    await expect(row).toBeVisible();
    const name = (await row.locator('.event-name p.name').innerText()).trim();

    await row.locator('.event-name').click();

    await expect(page).toHaveURL(/\/sessions\/details\//);
    await expect(root.locator('h1.session-title')).toHaveText(name);
    noErrors();
  });

  test("a session's page shows its title, time and place", async ({ page, request, baseURL }) => {
    const sessions = await getJson<Array<Named>>(request, `${api(baseURL)}events/season/active`);

    test.skip(!sessions.length, 'The current season has no sessions yet');

    const { root, noErrors } = await open(page, `/sessions/details/${sessions[0].guid}`);

    await expect(root.locator('h1.session-title')).toHaveText(sessions[0].name.trim());
    await expect(root.locator('#timeAndPlace')).toBeVisible();
    await expect(root.getByRole('heading', { name: 'Session Description' })).toBeVisible();
    noErrors();
  });

  test("a session's check-in link with no code says so, and checks nobody in", async ({ page, request, baseURL }) => {
    const sessions = await getJson<Array<Named>>(request, `${api(baseURL)}events/season/active`);

    test.skip(!sessions.length, 'The current season has no sessions yet');

    // Without `?code=` the page only explains; with one it would check a signed-in visitor in, so none is ever given.
    const { root, noErrors } = await open(page, `/sessions/checkin/${sessions[0].guid}`);

    // The heading starts with its icon's ligature ("error"), which is no part of what it says.
    await expect(root.locator('.checkin-status h1')).toContainText('You are not checked in');
    await expect(root.getByText('This link has no check-in code.')).toBeVisible();
    noErrors();
  });

  test('the presenters page shows a card for each presenter', async ({ page, request, baseURL }) => {
    const speakers = await getJson<Array<Speaker>>(request, `${api(baseURL)}speakers/participating`);
    const { root, noErrors } = await open(page, '/presenters');

    await expect(root.getByRole('heading', { name: 'Presenters', level: 1 })).toBeVisible();

    if (speakers.length) {
      await expect(root.locator('tamu-gisc-speaker-card')).toHaveCount(speakers.length);
    } else {
      await expect(root.getByText("We're putting together an amazing lineup")).toBeVisible();
    }

    noErrors();
  });

  test("a presenter's card opens their page, with their name", async ({ page, request, baseURL }) => {
    const speakers = await getJson<Array<Speaker>>(request, `${api(baseURL)}speakers/participating`);

    test.skip(!speakers.length, 'The current season has no presenters yet');

    const { root, noErrors } = await open(page, '/presenters');
    const card = root.locator('tamu-gisc-speaker-card .profile').first();
    const name = (await card.locator('.name').innerText()).trim();

    await card.click();

    await expect(page).toHaveURL(/\/presenters\/details\//);
    await expect(root.locator('.presenter-details-item p.name')).toContainText(name);
    noErrors();
  });

  test('the presenter profile page asks for the email it should send a link to', async ({ page }) => {
    // Without a link's token it only asks; "Email me a link" sends an email, so it is never pressed.
    const { root, noErrors } = await open(page, '/presenters/edit');

    await expect(root.getByRole('heading', { name: 'Your presenter profile', level: 1 })).toBeVisible();
    noErrors();
  });

  test('the about page names the participating organizations', async ({ page, request, baseURL }) => {
    const places = await getJson<Array<Named>>(request, `${api(baseURL)}places/season/active`);
    const { root, noErrors } = await open(page, '/about');

    await expect(root.getByRole('heading', { name: `About ${site(baseURL).name}`, level: 1 })).toBeVisible();
    await expect(root.locator('#orgs h2')).toContainText('Participating Organizations');

    if (!places.length) {
      await expect(root.getByText('There are no participating organizations yet.')).toBeVisible();
    }

    noErrors();
  });

  test('the contact page shows its form, which is not sent', async ({ page, baseURL }) => {
    const { root, noErrors } = await open(page, '/contact');

    await expect(root.getByRole('heading', { name: `Contact the ${site(baseURL).name} Team`, level: 1 })).toBeVisible();
    await expect(root.getByRole('heading', { name: 'Email Us' })).toBeVisible();
    noErrors();
  });

  test('the FAQ page answers its questions', async ({ page, baseURL }) => {
    test.skip(!siteHas(site(baseURL), 'faq'), 'This site has no FAQ (`faq` is off)');

    const { root, noErrors } = await open(page, '/faq');

    await expect(root.getByRole('heading', { name: 'Frequently Asked Questions', level: 1 })).toBeVisible();
    await expect(root.locator('.faq-item').first()).toBeVisible();
    noErrors();
  });

  test('the high school portal shows its heading', async ({ page, baseURL }) => {
    // Texas A&M's (`tamu`). A site without it still opens the page by its address, which #3643 is to stop.
    test.skip(!siteHas(site(baseURL), 'tamu'), "The High School Portal is Texas A&M's (`tamu` is off; #3643)");

    const { root, noErrors } = await open(page, '/highschool');

    await expect(root.getByRole('heading', { name: 'High School Portal', level: 1 })).toBeVisible();
    noErrors();
  });

  test.describe('sponsors', () => {
    test.beforeEach(({ baseURL }) => {
      test.skip(!siteHas(site(baseURL), 'sponsors'), 'This site has no sponsor pages (`sponsors` is off)');
    });

    test("the sponsors page shows this year's sponsors' logos", async ({ page, request, baseURL }) => {
      const sponsors = await getJson<Array<Named>>(request, `${api(baseURL)}sponsors/season/active`);
      const { root, noErrors } = await open(page, '/sponsors');

      await expect(root.locator('#current h1')).toHaveText('Sponsors');

      if (sponsors.length) {
        // Each logo is a link to the sponsor's own site, titled with its name.
        await expect(root.locator('.sponsor-list .icon-item a[title]').first()).toBeVisible();
      }

      noErrors();
    });

    test("a sponsor's page shows its name", async ({ page, request, baseURL }) => {
      const sponsors = await getJson<Array<Named>>(request, `${api(baseURL)}sponsors/season/active`);

      test.skip(!sponsors.length, 'The current season has no sponsors yet');

      const { root, noErrors } = await open(page, `/sponsors/details/${sponsors[0].guid}`);

      await expect(root.locator('h1.session-title')).toHaveText(sponsors[0].name.trim());
      noErrors();
    });

    test('the sponsorship page shows the levels', async ({ page }) => {
      const { root, noErrors } = await open(page, '/sponsors/tamu');

      await expect(root.getByRole('heading', { name: 'Interested in Becoming a Sponsor?', level: 1 })).toBeVisible();
      await expect(root.locator('.swap-content-toggle.plaque').first()).toBeVisible();
      noErrors();
    });

    test('the sponsorship payment page says how to pay', async ({ page }) => {
      const { root, noErrors } = await open(page, '/sponsors/payment');

      await expect(root.getByRole('heading', { name: 'How to Pay for a Sponsorship', level: 1 })).toBeVisible();
      await expect(root.locator('#check')).toBeVisible();
      noErrors();
    });
  });

  test.describe('competitions', () => {
    test.beforeEach(({ baseURL }) => {
      test.skip(!siteHas(site(baseURL), 'competitions'), 'This site has no competitions (`competitions` is off)');
    });

    test('the competitions page lists the competitions', async ({ page }) => {
      const { root, noErrors } = await open(page, '/competitions');

      await expect(root.getByRole('heading', { name: 'Competitions', level: 1 })).toBeVisible();
      // It lists VGI, and the poster and presentation competitions in a season that runs them. The essay contest and the
      // feedback lottery are commented out of it, though their own pages remain.
      await expect(root.getByRole('heading', { name: 'VGI Competitions' })).toBeVisible();
      noErrors();
    });

    /** Each competition's own page, by the heading a visitor sees. Static text; the pages with maps are checked as text. */
    const COMPETITIONS: Array<[path: string, heading: string]> = [
      ['highschool', 'High School Essay Contest'],
      ['feedback', 'Session Feedback Lottery'],
      ['papers', 'Presentation Competition'],
      ['presentation', 'Presentation Competition'],
      ['posters', 'Poster Competition'],
      ['vgi', 'VGI Competition'],
      ['signage', 'Permanent Signage Challenge'],
      ['stormwater', 'Stormwater Survey VGI Competition'],
      ['sidewalk', 'Sidewalk Challenge VGI Competition'],
      ['lighting', 'TAMU Lighting Challenge'],
      ['lightpole', 'TAMU Light Pole Challenge'],
      ['building-bounty', 'Building Bounty Mapping Challenge'],
      ['aggie-accessibility', 'Aggie Accessibility Mapping Challenge'],
      ['manhole', 'Manhole Mapping Challenge'],
      ['curb-cuts', 'TAMU Curb Cut Hunt Challenge'],
      ['art', 'Texas A&M University Art Trail Challenge'],
      ['monuments', 'Texas A&M University Monument Trail Challenge']
    ];

    for (const [path, heading] of COMPETITIONS) {
      test(`the ${heading} page (/competitions/${path}) explains it`, async ({ page }) => {
        const { root, noErrors } = await open(page, `/competitions/${path}`);

        await expect(root.getByRole('heading', { name: heading, level: 1, exact: true })).toBeVisible();
        noErrors();
      });
    }

    test('the poster gallery shows the posters, or says there are none', async ({ page }) => {
      const { root, noErrors } = await open(page, '/competitions/posters/gallery');

      await expect(root.getByRole('heading', { name: 'Poster Gallery', level: 1 })).toBeVisible();
      await expect(root.getByText('The posters could not be loaded.')).toHaveCount(0);
      noErrors();
    });

    test('the judging page, opened without its emailed link, says where it opens from', async ({ page }) => {
      const { root, noErrors } = await open(page, '/judging');

      await expect(root.getByRole('heading', { name: 'Judging', level: 1 })).toBeVisible();
      await expect(root.getByText('This page opens from the link in your judging email.')).toBeVisible();
      noErrors();
    });
  });
});

test.describe('the most recent past season', () => {
  test.beforeEach(({ baseURL }) => {
    test.skip(!siteHas(site(baseURL), 'pastYears'), "This site has no past years' pages (`pastYears` is off)");
  });

  test("its sessions page lists that year's sessions", async ({ page, request, baseURL }) => {
    const past = await pastSeason(request, baseURL);

    test.skip(!past, 'This site has no past season');

    const sessions = await getJson<Array<Named>>(request, `${api(baseURL)}events/season/${past?.guid}`);
    const { root, noErrors } = await open(page, `/seasons/${past?.year}/sessions`);

    await expect(root.getByRole('heading', { name: 'Event Sessions', level: 1 })).toBeVisible();

    if (sessions.length) {
      await expect(root.locator('tamu-gisc-event-row').first()).toBeAttached();
    } else {
      await expect(root.getByText('No sessions have been announced yet.')).toBeVisible();
    }

    noErrors();
  });

  test("its presenters page shows that year's presenters", async ({ page, request, baseURL }) => {
    const past = await pastSeason(request, baseURL);

    test.skip(!past, 'This site has no past season');

    const speakers = await getJson<Array<Speaker>>(request, `${api(baseURL)}speakers/participating/season/${past?.guid}`);
    const { root, noErrors } = await open(page, `/seasons/${past?.year}/presenters`);

    await expect(root.getByRole('heading', { name: 'Presenters', level: 1 })).toBeVisible();

    if (speakers.length) {
      await expect(root.locator('tamu-gisc-speaker-card')).toHaveCount(speakers.length);
    }

    noErrors();
  });

  test("its sponsors page shows that year's sponsors' logos", async ({ page, request, baseURL }) => {
    test.skip(!siteHas(site(baseURL), 'sponsors'), 'This site has no sponsor pages (`sponsors` is off)');

    const past = await pastSeason(request, baseURL);

    test.skip(!past, 'This site has no past season');

    const sponsors = await getJson<Array<Named>>(request, `${api(baseURL)}sponsors/season/${past?.guid}`);
    const { root, noErrors } = await open(page, `/seasons/${past?.year}/sponsors`);

    await expect(root.locator('#current h1')).toHaveText('Sponsors');

    if (sponsors.length) {
      await expect(root.locator('.sponsor-list .icon-item a[title]').first()).toBeVisible();
    }

    noErrors();
  });

  test("a past year's address on its own opens that year's sessions", async ({ page, request, baseURL }) => {
    const past = await pastSeason(request, baseURL);

    test.skip(!past, 'This site has no past season');

    const { root, noErrors } = await open(page, `/seasons/${past?.year}`);

    await expect(page).toHaveURL(new RegExp(`/seasons/${past?.year}/sessions$`));
    await expect(root.getByRole('heading', { name: 'Event Sessions', level: 1 })).toBeVisible();
    noErrors();
  });

  test('the 2019 page shows that year', async ({ page }) => {
    const { root, noErrors } = await open(page, '/wayback/2019');

    // Its title is a logo drawn by CSS on an empty heading, so the winners' heading is what shows the page drew.
    await expect(root.locator('h1#site-title[aria-label="GIS Day 2019"]')).toBeAttached();
    await expect(root.getByRole('heading', { name: 'COMPETITION WINNERS' })).toBeVisible();
    noErrors();
  });
});

test.describe('pages that explain', () => {
  test('an address the site does not know says so, inside the site', async ({ page }) => {
    const { root, noErrors } = await open(page, '/this-page-does-not-exist');

    await expect(root.getByText("We couldn't find that page.")).toBeVisible();
    await expect(root.getByRole('link', { name: 'Sessions' }).last()).toBeVisible();
    await expect(page).toHaveURL(/\/this-page-does-not-exist$/);
    noErrors();
  });

  test('the forbidden page says why', async ({ page }) => {
    const { root, noErrors } = await open(page, '/forbidden');

    await expect(root.getByRole('heading', { name: 'Sorry', level: 1 })).toBeVisible();
    noErrors();
  });
});
