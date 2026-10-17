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

  it('leaves nothing out on txgisday.org', () => {
    expect(gisdaySite('txgisday').off).toEqual([]);
  });
});

describe('SiteHasPipe', () => {
  it('has every feature on txgisday.org', () => {
    setUp();
    const pipe = TestBed.runInInjectionContext(() => new SiteHasPipe());

    for (const feature of ['competitions', 'faq', 'sponsors', 'classes', 'checkIns', 'tamu'] as const) {
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
