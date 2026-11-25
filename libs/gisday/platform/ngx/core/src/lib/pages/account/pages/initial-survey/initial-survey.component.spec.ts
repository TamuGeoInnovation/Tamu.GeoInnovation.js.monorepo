import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { gisdaySite } from '@tamu-gisc/gisday/common';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';
import { InitialSurveyService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { InitialSurveyComponent } from './initial-survey.component';

/**
 * #3636. The page has one heading for a visitor who has taken the survey and another for one who has not. The second was
 * drawn through `ngTemplateOutlet` from `#noFeedback`, which was a `<div>`, not a template: the outlet threw
 * ("templateRef.createEmbeddedViewImpl is not a function"), and the `<div>` itself always rendered, so a visitor who had
 * taken the survey saw both headings.
 */
describe('InitialSurveyComponent', () => {
  function render(tookSurvey: boolean) {
    TestBed.configureTestingModule({
      imports: [InitialSurveyComponent],
      providers: [
        { provide: GISDAY_SITE, useValue: gisdaySite('') },
        {
          provide: InitialSurveyService,
          useValue: {
            seeIfUserTookSurvey: () => of(tookSurvey),
            getInitialSurveyQuestions: () => of([]),
            createEntity: vi.fn()
          }
        }
      ]
    });

    const fixture = TestBed.createComponent(InitialSurveyComponent);
    fixture.detectChanges();

    return Array.from(fixture.nativeElement.querySelectorAll('h1') as NodeListOf<HTMLElement>).map((h) => h.textContent?.trim());
  }

  it('shows only the pre-event heading to a visitor who has taken the survey', () => {
    expect(render(true)).toEqual(['Pre-Event User Impact Survey']);
  });

  it('shows only the survey heading to a visitor who has not, without throwing', () => {
    expect(render(false)).toEqual(['Event User Impact Survey']);
  });
});
