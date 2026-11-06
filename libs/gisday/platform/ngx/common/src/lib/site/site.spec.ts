import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';

import { GISDAY_SITES, GisdaySite, gisdaySite, siteHead, siteSessionPlaces, withSiteHead } from '@tamu-gisc/gisday/common';

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

  it('goes by the key at any other address, so a local copy can show any site', () => {
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
    expect(siteSessionPlaces(gisdaySite('tamu'), [{ guid: 'p', name: '  texas a&m university gis day(s) ' }])).toEqual([
      'p'
    ]);
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

    for (const feature of [
      'competitions',
      'faq',
      'sponsors',
      'classes',
      'checkIns',
      'pastYears',
      'tamu',
      'tamuLinks',
      'homeLinks'
    ] as const) {
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

/**
 * #2649. Link previews never run the app, so each site's page carries its own name, description and image. Every site
 * once served txgisday.org's, so a UCGIS post about gisday.ucgis.org showed "TxGIS Day".
 */
describe('siteHead', () => {
  const page = [
    '<head>',
    '    <!-- site head -->',
    '    <title>TxGIS Day</title>',
    '    <!-- /site head -->',
    '    <base href="/" />',
    '</head>'
  ].join('\n');

  it("gives the UCGIS site UCGIS's name, description, address and image", () => {
    const head = siteHead(GISDAY_SITES.ucgis);

    expect(head).toContain('<title>UCGIS GIS Day</title>');
    expect(head).toContain('<meta property="og:title" content="UCGIS GIS Day" />');
    expect(head).toContain('<meta property="og:site_name" content="UCGIS GIS Day" />');
    expect(head).toContain('<meta property="og:url" content="https://gisday.ucgis.org/" />');
    expect(head).toContain(
      '<meta property="og:image" content="https://gisday.ucgis.org/assets/images/sites/ucgis/preview.png" />'
    );
    expect(head).toContain(`<meta property="og:description" content="${GISDAY_SITES.ucgis.description}" />`);
    expect(head).not.toContain('TxGIS');
  });

  it('escapes what would break an attribute', () => {
    expect(siteHead(GISDAY_SITES.tamu)).toContain('<title>Texas A&amp;M GIS Day</title>');
    expect(siteHead({ ...GISDAY_SITES.ucgis, description: 'A "quoted" <word>' })).toContain(
      'content="A &quot;quoted&quot; &lt;word&gt;"'
    );
  });

  it('replaces only what is between the markers, and keeps the markers', () => {
    const result = withSiteHead(page, GISDAY_SITES.ucgis);

    expect(result).not.toContain('<title>TxGIS Day</title>');
    expect(result).toContain('<title>UCGIS GIS Day</title>');
    expect(result).toContain('<!-- site head -->');
    expect(result).toContain('<!-- /site head -->');
    expect(result).toContain('<base href="/" />');
    expect(withSiteHead(result, GISDAY_SITES.txgisday)).toBe(withSiteHead(page, GISDAY_SITES.txgisday));
  });

  it('refuses a page without the markers rather than leaving it as it was', () => {
    expect(() => withSiteHead('<head><title>TxGIS Day</title></head>', GISDAY_SITES.ucgis)).toThrow(/site head/);
  });

  it('gives every site an address, a description and a preview image', () => {
    for (const site of Object.values(GISDAY_SITES) as Array<GisdaySite>) {
      expect(site.address).toMatch(/^https:\/\/[^/]+$/);
      expect(site.description.length).toBeGreaterThan(20);
      expect(site.preview).toMatch(/^assets\/images\/sites\/[a-z]+\/preview\.png$/);
    }
  });

  it('is the UCGIS site at its own address', () => {
    expect(gisdaySite(undefined, 'gisday.ucgis.org').name).toBe('UCGIS GIS Day');
  });
});

/**
 * #2575. UCGIS's members, and its organizers, sign in only with their UCGIS Tradewing accounts, so its Sign in goes
 * straight to that Auth0 connection. txgisday.org and gisday.tamu.edu keep Auth0's page of choices.
 */
describe('signInWith', () => {
  it('sends the UCGIS site straight to the Tradewing connection', () => {
    expect(gisdaySite('ucgis').signInWith).toBe('tradewing');
    expect(gisdaySite(undefined, 'gisday.ucgis.org').signInWith).toBe('tradewing');
  });

  it("leaves txgisday.org and Texas A&M's site on Auth0's page of choices", () => {
    expect(gisdaySite('txgisday').signInWith).toBeUndefined();
    expect(gisdaySite(undefined, 'gisday.tamu.edu').signInWith).toBeUndefined();
  });
});

