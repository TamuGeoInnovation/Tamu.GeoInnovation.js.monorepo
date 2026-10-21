import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';

import { GisdaySite, gisdaySite } from '@tamu-gisc/gisday/common';

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

  it("leaves out only Texas A&M's own content on txgisday.org, keeping the required links", () => {
    expect(gisdaySite('txgisday').off).toEqual(['tamu']);
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

  it("has every feature on Texas A&M's site, and the required links but not its content on the others", () => {
    expect(gisdaySite('tamu').off).toEqual([]);
    expect(gisdaySite('txgisday').off).not.toContain('tamuLinks');
    expect(gisdaySite('ucgis').off).toEqual(expect.arrayContaining(['tamu', 'tamuLinks']));
  });
});

describe('SiteHasPipe', () => {
  it("has every feature but Texas A&M's own content on txgisday.org", () => {
    setUp();
    const pipe = TestBed.runInInjectionContext(() => new SiteHasPipe());

    for (const feature of ['competitions', 'faq', 'sponsors', 'classes', 'checkIns', 'pastYears', 'tamuLinks'] as const) {
      expect(pipe.transform(feature)).toBe(true);
    }
    expect(pipe.transform('tamu')).toBe(false);
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
