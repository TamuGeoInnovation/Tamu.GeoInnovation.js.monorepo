import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';

import { SUBMISSION_CLASSIFICATION_OPTIONS, SUBMISSION_TYPE_OPTIONS } from '@tamu-gisc/gisday/platform/ngx/common';
import { SeasonService, UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { ResearchCompetitionListComponent, withData } from './research-competition-list.component';

/** #2817: a filter offers All and only the choices the season's submissions have. */
describe('withData', () => {
  const season = [
    { submissionType: 'poster', classificationType: 'graduate' },
    { submissionType: 'presentation', classificationType: 'graduate' },
    { submissionType: 'poster', classificationType: 'undergraduate' }
  ];

  it('offers All and only the types the season has, in the form’s order', () => {
    expect(withData(SUBMISSION_TYPE_OPTIONS, season, 'submissionType').map((o) => o.label)).toEqual([
      'All',
      'Presentation',
      'Poster'
    ]);
  });

  it('offers only the classifications the season has', () => {
    expect(withData(SUBMISSION_CLASSIFICATION_OPTIONS, season.slice(0, 2), 'classificationType').map((o) => o.label)).toEqual([
      'All',
      'Graduate'
    ]);
  });

  it('offers only All for a season with no submissions', () => {
    expect(withData(SUBMISSION_TYPE_OPTIONS, [], 'submissionType').map((o) => o.label)).toEqual(['All']);
  });
});

/**
 * #2924: the page sat white while the season's submissions loaded, which took long enough (#2925) to look broken. It
 * shows the site's loader until they arrive.
 */
describe('ResearchCompetitionListComponent while loading', () => {
  function open() {
    const submissions$ = new Subject<Array<unknown>>();
    const service = {
      getEntitiesForActiveSeason: () => submissions$,
      getEntitiesForSeason: () => submissions$,
      getEntities: () => submissions$
    };

    TestBed.configureTestingModule({
      imports: [ResearchCompetitionListComponent],
      providers: [
        provideRouter([]),
        { provide: UserSubmissionsService, useValue: service },
        { provide: SeasonService, useValue: { seasons$: of([]), activeSeason$: of(null) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, queryParams: of({}) } },
        { provide: ModalService, useValue: {} },
        { provide: NotificationService, useValue: { toast: jest.fn() } }
      ]
    });

    const fixture = TestBed.createComponent(ResearchCompetitionListComponent);
    fixture.detectChanges();

    return { fixture, submissions$, page: fixture.nativeElement as HTMLElement };
  }

  it('shows the loader until the submissions arrive', () => {
    const { page } = open();

    expect(page.querySelector('.loader')).not.toBeNull();
  });

  it('replaces the loader with the list once they have', () => {
    const { fixture, submissions$, page } = open();

    submissions$.next([{ guid: 's1', title: 'A poster', submissionType: 'poster', classificationType: 'graduate' }]);
    fixture.detectChanges();

    expect(page.querySelector('.loader')).toBeNull();
    expect(page.textContent).toContain('Showing 1 of 1 submissions.');
  });
});
