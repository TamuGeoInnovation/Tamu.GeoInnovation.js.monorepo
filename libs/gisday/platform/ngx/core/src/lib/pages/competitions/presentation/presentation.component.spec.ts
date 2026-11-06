import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PresentationComponent } from './presentation.component';

/**
 * #2663. The 2026 deadline for submissions moved from Monday, November 9 to Friday, November 13, 5:00 PM Central,
 * and finalists hear on Saturday, November 14.
 */
describe('PresentationComponent', () => {
  function text() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });

    const fixture = TestBed.createComponent(PresentationComponent);
    fixture.detectChanges();

    return (fixture.nativeElement as HTMLElement).textContent;
  }

  it('gives Friday, November 13 as the deadline and Saturday, November 14 for finalists', () => {
    const rendered = text();

    expect(rendered).toContain('Friday November 13th, 2026');
    expect(rendered).toContain('notified on Saturday November 14th, 2026');
  });

  it('no longer gives the old deadline', () => {
    const rendered = text();

    expect(rendered).not.toContain('November 9th');
    expect(rendered).not.toContain('November 11th');
  });
});
