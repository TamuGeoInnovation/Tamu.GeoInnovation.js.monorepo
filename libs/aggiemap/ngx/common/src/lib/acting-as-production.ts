/**
 * The switch that makes a development host behave as production, for one browser tab (#1722).
 *
 * Dev differs from production on purpose: it turns on features that are not released, and it draws
 * from the development GIS server. So dev never shows what a visitor to production will get - on
 * 12 October a new raster basemap went to production without having been seen drawn on dev, because
 * dev draws the vector one in its place.
 *
 * `?as=production` on any address turns the switch on. It is kept for the tab's session, because
 * moving between maps drops query parameters and the switch would otherwise be lost on the first
 * click. `?as=development` turns it off, and so does closing the tab.
 *
 * **It can only turn development behaviour off.** Everything that asks is of the form "a development
 * host, and not acting as production", so on production, where the first half is already false, the
 * parameter does nothing and cannot expose anything unreleased.
 *
 * Read when the page loads, by `getDefaultGisHosts()` beside this file and by `TestingService`, which
 * AggieMap hands it to as `ACTING_AS_PRODUCTION`. Both settle once, so changing it means loading the
 * page again, which following a link does.
 *
 * This file imports nothing, and must not: `connections.ts` uses it, and the smoke suite loads that
 * file directly, outside the workspace's import aliases.
 */

/** The query parameter, and the two values it takes. */
export const ACTING_AS_PARAMETER = 'as';
export const ACTING_AS_PRODUCTION = 'production';
export const ACTING_AS_DEVELOPMENT = 'development';

const STORAGE_KEY = 'tamu-gisc-acting-as';

/** Only what this reads of `window.location` and `window.sessionStorage`, so both can be stood in for. */
interface Address {
  search: string;
}

type Session = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** `sessionStorage`, or nothing where a browser refuses it. The switch then lasts one page. */
function session(): Session | undefined {
  try {
    return globalThis.sessionStorage;
  } catch {
    return undefined;
  }
}

/**
 * Whether this tab was asked to behave as production.
 *
 * Says nothing about whether the host is a development one: on production this may be true and
 * changes nothing, because nothing there asks.
 */
export function actingAsProduction(
  address: Address | undefined = globalThis.location,
  storage: Session | undefined = session()
): boolean {
  const asked = new URLSearchParams(address?.search ?? '').get(ACTING_AS_PARAMETER);

  try {
    if (asked === ACTING_AS_PRODUCTION) {
      storage?.setItem(STORAGE_KEY, ACTING_AS_PRODUCTION);
    } else if (asked === ACTING_AS_DEVELOPMENT) {
      storage?.removeItem(STORAGE_KEY);
    }

    if (storage) {
      return storage.getItem(STORAGE_KEY) === ACTING_AS_PRODUCTION;
    }
  } catch {
    // Storage that throws is treated as no storage: the address alone decides.
  }

  return asked === ACTING_AS_PRODUCTION;
}
