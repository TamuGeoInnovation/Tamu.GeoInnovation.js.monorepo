import { TestBed } from '@angular/core/testing';

import { MonumentsComponent } from './monuments.component';

/**
 * #2460. The 2026 VGI competition runs Saturday, November 14 through Friday, November 20; submissions count
 * until 11:00 AM Central that Friday and the winners are announced at that day's lunch session.
 */
describe('MonumentsComponent', () => {
  function text() {
    const fixture = TestBed.createComponent(MonumentsComponent);
    fixture.detectChanges();

    return (fixture.nativeElement as HTMLElement).textContent;
  }

  it('gives the 2026 dates and the Friday cutoff', () => {
    const rendered = text();

    expect(rendered).toContain('November 14');
    expect(rendered).toContain('11:00 AM');
    expect(rendered).toContain('Friday, November 20');
  });

  // #2497
  it('gives the dates in the eligibility sentence', () => {
    const rendered = text().replace(/\s+/g, ' ');

    expect(rendered).toContain(
      'Only submissions made between Saturday, November 14 and 11:00 AM Central on Friday, November 20 will be considered for an award.'
    );
    expect(rendered).not.toContain('the week prior to and the days before the awards ceremony');
  });

  it('no longer gives the old start or winners dates', () => {
    const rendered = text();

    expect(rendered).not.toContain('November 9');
    expect(rendered).not.toContain('November 19');
  });
});

/**
 * #2559. The competition works in a phone's browser, so the page leads to the survey and the submission form
 * with a button each, and no longer asks anyone to download an app.
 */
describe('MonumentsComponent ways in', () => {
  function page() {
    const fixture = TestBed.createComponent(MonumentsComponent);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('has a button to the pre-competition survey, then one to the submission form, before the information sheet', () => {
    const element = page();
    const buttons = Array.from(element.querySelectorAll<HTMLAnchorElement>('.competition-actions a.button'));

    expect(buttons.map((b) => b.getAttribute('href'))).toEqual(['https://forms.gle/GvVWuBc51PKniyPFA', '/app/submission']);

    const sheet = element.querySelector('.fine-print');
    expect(buttons[1].compareDocumentPosition(sheet) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('does not ask anyone to download or install an app', () => {
    expect(page().textContent).not.toMatch(/download and install/i);
  });
});
