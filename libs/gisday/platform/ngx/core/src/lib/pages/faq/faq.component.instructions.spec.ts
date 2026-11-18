import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { GISDAY_SITES, GisdaySite } from '@tamu-gisc/gisday/common';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';

import { FaqComponent } from './faq.component';

/**
 * #3152. The FAQ page's instructions, reviewed against the site on 16 November 2026: it named "TxGIS Day" on every site,
 * told people to click Check-in during the event (a complete profile, the visitor's location or the session's QR code
 * are now needed), sent them to "My Classes" (the page is Classes) and "Online Zoom Meeting Info" (it is Online
 * Broadcast), and its competitions answer was garbled (they are open only to current Texas A&M students).
 */
describe('FaqComponent, its instructions', () => {
  function render(site: GisdaySite) {
    TestBed.configureTestingModule({
      imports: [FaqComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { fragment: of(null) } },
        { provide: GISDAY_SITE, useValue: site }
      ]
    });

    const fixture = TestBed.createComponent(FaqComponent);
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    const answer = (id: string) => page.querySelector(`#${id}`)?.textContent.replace(/\s+/g, ' ').trim() ?? '';

    return { text: page.textContent.replace(/\s+/g, ' '), answer };
  }

  it("names Texas A&M's site on gisday.tamu.edu, never TxGIS Day's", () => {
    const { text } = render(GISDAY_SITES.tamu);

    expect(text).toContain('Texas A&M GIS Day');
    expect(text).not.toContain('TxGIS Day');
  });

  it("names txgisday.org's own site there", () => {
    expect(render(GISDAY_SITES.txgisday).text).toContain('TxGIS Day');
  });

  it('says checking in needs a complete profile, then the location in person or the QR code online', () => {
    const checkIn = render(GISDAY_SITES.tamu).answer('website-checkin');

    expect(checkIn).toContain('Profile');
    expect(checkIn).toContain('location');
    expect(checkIn).toContain('QR code');
    expect(checkIn).toContain('hybrid or online');
    expect(checkIn).toContain('10 minutes after');
    expect(checkIn).toContain('5 minutes before');
  });

  it('sends people to Classes, not My Classes, for certifying attendance', () => {
    const certify = render(GISDAY_SITES.tamu).answer('attendance-certification-website');

    expect(certify).toContain('Classes');
    expect(certify).not.toContain('My Classes');
  });

  it('names the Online Broadcast section for the Zoom link', () => {
    const zoom = render(GISDAY_SITES.tamu).answer('zoom-link');

    expect(zoom).toContain('Online Broadcast');
    expect(zoom).not.toContain('Online Zoom Meeting Info');
  });

  it('says the competitions are open only to current Texas A&M students', () => {
    expect(render(GISDAY_SITES.tamu).answer('competition-eligibility')).toContain('open only to current Texas A&M students');
  });
});
