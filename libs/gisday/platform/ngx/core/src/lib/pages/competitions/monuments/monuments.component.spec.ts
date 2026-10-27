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

  it('no longer gives the old start or winners dates', () => {
    const rendered = text();

    expect(rendered).not.toContain('November 9');
    expect(rendered).not.toContain('November 19');
  });
});
