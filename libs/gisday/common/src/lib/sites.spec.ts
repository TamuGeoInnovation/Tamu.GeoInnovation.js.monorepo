import { GISDAY_SITES, placesShownOn, siteListsPlace, siteListsSession } from './sites';

/**
 * #2986. gisday.tamu.edu shares txgisday.org's database. Texas State's place, marked for the header, footer and About,
 * showed there; only Texas A&M's may. txgisday.org and UCGIS still show every marked place.
 */
describe('placesShownOn', () => {
  const marked = ['header', 'footer', 'org-page', 'sessions-filter'];
  const places = [
    { guid: 'tamu', name: 'Texas A&M University GIS Day(s)', visibilitySettings: marked },
    { guid: 'txst', name: 'Texas State University GIS Day', visibilitySettings: marked },
    { guid: 'ut', name: 'University of Texas at Austin GIS Day', visibilitySettings: [] }
  ];

  for (const spot of marked) {
    it(`shows only Texas A&M's place in the ${spot} on gisday.tamu.edu`, () => {
      expect(placesShownOn(GISDAY_SITES.tamu, places, spot).map((p) => p.guid)).toEqual(['tamu']);
    });

    it(`shows every place marked for the ${spot} on txgisday.org and UCGIS`, () => {
      expect(placesShownOn(GISDAY_SITES.txgisday, places, spot).map((p) => p.guid)).toEqual(['tamu', 'txst']);
      expect(placesShownOn(GISDAY_SITES.ucgis, places, spot).map((p) => p.guid)).toEqual(['tamu', 'txst']);
    });
  }

  it('shows nothing when there are no places', () => {
    expect(placesShownOn(GISDAY_SITES.tamu, null, 'header')).toEqual([]);
  });

  // #3626: a place's visibility settings are stored as they were saved, null included (Place allows it), and such a place
  // is marked for nowhere: it is left out, and the rest still show.
  it('leaves out a place whose visibility settings are null', () => {
    const withNull = [...places, { guid: 'unset', name: 'A place saved with no settings', visibilitySettings: null }];

    expect(placesShownOn(GISDAY_SITES.txgisday, withNull, 'header').map((p) => p.guid)).toEqual(['tamu', 'txst']);
  });
});

/** #2986: the admin Sessions list on gisday.tamu.edu starts with Texas A&M's sessions. */
describe('siteListsSession', () => {
  const at = (guid: string, name: string) => ({ location: { place: { guid, name } } });

  it("lists Texas A&M's sessions on gisday.tamu.edu, and not Texas State's", () => {
    expect(siteListsSession(GISDAY_SITES.tamu, at('tamu', 'Texas A&M University GIS Day(s)'))).toBe(true);
    expect(siteListsSession(GISDAY_SITES.tamu, at('txst', 'Texas State University GIS Day'))).toBe(false);
  });

  it('lists a session with no place yet, so an admin can find and place it', () => {
    expect(siteListsSession(GISDAY_SITES.tamu, { location: null })).toBe(true);
  });

  it("lists every organization's sessions on txgisday.org", () => {
    expect(siteListsSession(GISDAY_SITES.txgisday, at('txst', 'Texas State University GIS Day'))).toBe(true);
  });
});

/**
 * #3048. A broadcast belongs to a place, and gisday.tamu.edu lists only its places' broadcasts, by the same rule as its
 * sessions: every organization's Zooms were listed there, and one could be picked for a Texas A&M session by mistake.
 */
describe('siteListsPlace', () => {
  const tamu = { guid: 'tamu', name: 'Texas A&M University GIS Day(s)' };
  const ttu = { guid: 'ttu', name: 'Texas Tech University GIS Day' };

  it("lists Texas A&M's on gisday.tamu.edu, and not another organization's", () => {
    expect(siteListsPlace(GISDAY_SITES.tamu, tamu)).toBe(true);
    expect(siteListsPlace(GISDAY_SITES.tamu, ttu)).toBe(false);
  });

  it('lists one with no place yet, so an admin can find it and give it one', () => {
    expect(siteListsPlace(GISDAY_SITES.tamu, null)).toBe(true);
    expect(siteListsPlace(GISDAY_SITES.tamu, undefined)).toBe(true);
  });

  it("lists every organization's on txgisday.org and UCGIS", () => {
    expect(siteListsPlace(GISDAY_SITES.txgisday, ttu)).toBe(true);
    expect(siteListsPlace(GISDAY_SITES.ucgis, ttu)).toBe(true);
  });

  it("agrees with siteListsSession, which asks it about a session's place", () => {
    for (const place of [tamu, ttu, null]) {
      expect(siteListsSession(GISDAY_SITES.tamu, { location: { place } })).toBe(siteListsPlace(GISDAY_SITES.tamu, place));
    }
  });
});
