import { expect, test } from '@playwright/test';

// connections.ts loads here without the Angular dependency graph, as in services.spec.ts, so the
// service asked about is the one the app requests.
import { Connections } from '../../../libs/aggiemap/ngx/common/src/lib/connections';

/**
 * The Lactation Rooms layer reads a service with the fields its popup shows (#1960).
 *
 * The layer moved from layer 2 of FCOR/MapInfo_20190529 to the hosted Lactation_Spaces_view service,
 * and every field changed name. `services.spec.ts` would pass either service, because both answer;
 * only one has the fields the popup reads, and with the other the popup opens empty. That had already
 * happened once: the old popup read a `Bldg_Number` neither service has, so its Building Number was
 * always blank. So this asks for what the popup shows.
 *
 * Needs no browser. Read-only. The service is on the production GIS server, so every environment reads
 * the same one.
 */

/** The fields `lactation.component.html` shows. Keep the two in step. */
const POPUP_FIELDS = ['bldgname', 'bldgnum', 'availability_type', 'availability_times', 'access', 'amenities', 'notes'];

/**
 * The service held 35 rooms on 19 October 2026, the old one 21. A count well below 35 means the layer
 * is reading something else, or the service has lost its rooms.
 */
const FEWEST_ROOMS = 30;

const url = (Connections as unknown as Record<string, string | undefined>)['lactationRoomsUrl'];

test.describe('Lactation Rooms', () => {
  test('the service has every field the popup shows', async ({ request }) => {
    expect(url, 'connections.ts names no lactationRoomsUrl').toBeTruthy();

    const layer = await (await request.get(`${url}?f=json`, { timeout: 30_000 })).json();
    const fields = ((layer.fields ?? []) as { name: string }[]).map((f) => f.name);

    expect(fields, `${url} lacks a field the popup shows`).toEqual(expect.arrayContaining(POPUP_FIELDS));
  });

  test('the service holds the campus lactation rooms, each with a building name', async ({ request }) => {
    expect(url, 'connections.ts names no lactationRoomsUrl').toBeTruthy();

    const count = async (where: string): Promise<number> => {
      const response = await request.get(`${url}/query`, {
        params: { where, returnCountOnly: 'true', f: 'json' },
        timeout: 30_000
      });

      return (await response.json()).count;
    };

    expect(await count('1=1'), `${url} holds fewer rooms than expected`).toBeGreaterThanOrEqual(FEWEST_ROOMS);
    expect(await count("bldgname IS NULL OR bldgname = ''"), 'rooms with no building name').toBe(0);
  });
});
