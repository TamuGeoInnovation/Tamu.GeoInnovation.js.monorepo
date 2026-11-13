import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { UserSubmissionListComponent } from './user-submission-list.component';

/**
 * Regression coverage (#451). Students wrote in that they could not find how to submit to a competition: the way in
 * was a small text link in the section's toolbar, unlike every other action on the site. It is now a button.
 */
describe('UserSubmissionListComponent', () => {
  function open() {
    TestBed.configureTestingModule({
      imports: [UserSubmissionListComponent],
      providers: [provideRouter([]), { provide: UserSubmissionsService, useValue: { getPresentationsForActiveSeason: () => of([]) } }]
    });

    const fixture = TestBed.createComponent(UserSubmissionListComponent);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('offers a new submission as a button, not a text link', () => {
    const page = open();
    const add = [...page.querySelectorAll('a')].find((a) => a.getAttribute('href')?.endsWith('/add'));

    expect(add).toBeDefined();
    expect(add.classList).toContain('button');
    expect(add.textContent.trim()).toBe('New submission');
  });
});
