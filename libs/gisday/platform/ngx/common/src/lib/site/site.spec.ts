import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';

import { GisdaySite, gisdaySite, siteSessionPlaces } from '@tamu-gisc/gisday/common';

import { GISDAY_SITE, SiteHasPipe, siteFeatureGuard } from './site';

const withoutFaq: GisdaySite = { ...gisdaySite(), off: ['faq'] };

function setUp(site?: GisdaySite) {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), ...(site ? [{ provide: GISDAY_SITE, useValue: site }] : [])]
  });
}

describe('gisdaySite', () => {
  it('is txgisday.org for a missing, unknown or unreplaced key', () => {
    for (const key of [undefined, '', 'nowhere', '___ANGULAR_SITE___']) {
      expect(gisdaySite(key).name).toBe('TxGIS Day');
    }
  });

  /**
   * #2071. txgisday.org keeps everything it had, Texas A&M's content included, until it becomes a landing page
   * for every organization's GIS Day site. #2066 had moved that content to gisday.tamu.edu only.
   */
  it("leaves nothing out on txgisday.org, Texas A&M's content included", () => {
    expect(gisdaySite('txgisday').off).toEqual([]);
  });

  /**
   * #2012. gisday.tamu.edu is served by txgisday.org's deployment, so its key says txgisday; the address
   * is what makes it Texas A&M's site.
   */
  it("is Texas A&M's site at its addresses, whatever the deployment's key", () => {
    for (const host of ['gisday.tamu.edu', 'tamu.txgisday.org', 'GISDAY.TAMU.EDU']) {
      for (const key of [undefined, 'txgisday', '___ANGULAR_SITE___']) {
        const site = gisdaySite(key, host);

        expect(site.name).toBe('Texas A&M GIS Day');
        expect(site.brand).toBe('tamu');
      }
    }
  });

  it("goes by the key at any other address, so a local copy can show any site", () => {
    expect(gisdaySite('txgisday', 'txgisday.org').name).toBe('TxGIS Day');
    expect(gisdaySite('tamu', 'localhost').name).toBe('Texas A&M GIS Day');
    expect(gisdaySite('ucgis', 'gisday.ucgis.org').name).toBe('UCGIS GIS Day');
    expect(gisdaySite(undefined, 'localhost').name).toBe('TxGIS Day');
  });

  /** #2431. Only gisday.tamu.edu leaves out the links under Explore Events. */
  it("leaves the homepage's links under Explore Events out of Texas A&M's site only", () => {
    expect(gisdaySite('tamu').off).toContain('homeLinks');
    expect(gisdaySite('txgisday').off).not.toContain('homeLinks');
    expect(gisdaySite('ucgis').off).not.toContain('homeLinks');
  });

  it("has every other feature on Texas A&M's site and txgisday.org, and neither Texas A&M's content nor its links on UCGIS's", () => {
    expect(gisdaySite('tamu').off).toEqual(['homeLinks']);
    expect(gisdaySite('txgisday').off).toEqual([]);
    expect(gisdaySite('ucgis').off).toEqual(expect.arrayContaining(['tamu', 'tamuLinks']));
  });
});

describe('siteSessionPlaces', () => {
  const places = [
    { guid: 'tamu-place', name: 'Texas A&M University GIS Day(s)' },
    { guid: 'txst-place', name: 'Texas State University GIS Day' },
    { guid: 'atx-place', name: 'ATX GIS Day' }
  ];

  /** #2142. gisday.tamu.edu shares txgisday.org's database, which can hold every organization's sessions. */
  it("is only Texas A&M's place on Texas A&M's site", () => {
    expect(siteSessionPlaces(gisdaySite('tamu'), places)).toEqual(['tamu-place']);
  });

  it('matches the name ignoring case and surrounding spaces', () => {
    expect(siteSessionPlaces(gisdaySite('tamu'), [{ guid: 'p', name: '  texas a&m university gis day(s) ' }])).toEqual(['p']);
  });

  it('is every place, as null, on txgisday.org and UCGIS', () => {
    expect(siteSessionPlaces(gisdaySite('txgisday'), places)).toBeNull();
    expect(siteSessionPlaces(gisdaySite('ucgis'), places)).toBeNull();
  });

  it("is none, not every place, when a season has no place by Texas A&M's name", () => {
    expect(siteSessionPlaces(gisdaySite('tamu'), places.slice(1))).toEqual([]);
  });
});

describe('SiteHasPipe', () => {
  it('has every feature on txgisday.org', () => {
    setUp();
    const pipe = TestBed.runInInjectionContext(() => new SiteHasPipe());

    for (const feature of ['competitions', 'faq', 'sponsors', 'classes', 'checkIns', 'pastYears', 'tamu', 'tamuLinks', 'homeLinks'] as const) {
      expect(pipe.transform(feature)).toBe(true);
    }
  });

  it('does not have a feature the site leaves out', () => {
    setUp(withoutFaq);
    const pipe = TestBed.runInInjectionContext(() => new SiteHasPipe());

    expect(pipe.transform('faq')).toBe(false);
    expect(pipe.transform('sponsors')).toBe(true);
  });
});

describe('siteFeatureGuard', () => {
  it('lets a page through on a site that has its feature', () => {
    setUp();
    expect(TestBed.runInInjectionContext(() => siteFeatureGuard('faq')(null, null))).toBe(true);
  });

  it('sends a page a site leaves out to the homepage', () => {
    setUp(withoutFaq);
    const result = TestBed.runInInjectionContext(() => siteFeatureGuard('faq')(null, null)) as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/');
  });
});
