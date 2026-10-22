import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { gisdaySite } from '@tamu-gisc/gisday/common';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';

import { PeopleComponent } from './people.component';

/**
 * Regression coverage (#2077). Presenters said "TxGIS Day" and gave Texas A&M's address, gis@tamu.edu, on
 * every organization's site: UCGIS's visitors were sent to Texas A&M. It uses the site's own name, and its
 * own contact address, or its Contact page when it has none.
 */
describe('PeopleComponent', () => {
  function render(key: string) {
    TestBed.configureTestingModule({
      imports: [PeopleComponent],
      providers: [provideRouter([]), { provide: GISDAY_SITE, useValue: gisdaySite(key) }]
    });

    const fixture = TestBed.createComponent(PeopleComponent);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it("names UCGIS's site and sends presenters to its Contact page, never to Texas A&M", () => {
    const page = render('ucgis');

    expect(page.textContent).toContain('UCGIS GIS Day');
    expect(page.textContent).not.toContain('TxGIS');
    expect(page.innerHTML).not.toContain('tamu.edu');
    expect(page.querySelector('a[href="/contact"]')).not.toBeNull();
  });

  it('is unchanged on txgisday.org', () => {
    const page = render('txgisday');

    expect(page.textContent).toContain('make TxGIS Day possible');
    expect(page.querySelector('a[href="mailto:gis@tamu.edu?subject=Presentation%20Inquiry"]')?.textContent).toBe('gis@tamu.edu');
  });
});
