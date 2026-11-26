import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

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

    return Array.from(fixture.nativeElement.querySelectorAll('h1') as NodeListOf<HTMLElement>).map((h) =>
      h.textContent?.trim()
    );
  }

  it('shows only the pre-event heading to a visitor who has taken the survey', () => {
    expect(render(true)).toEqual(['Pre-Event User Impact Survey']);
  });

  it('shows only the survey heading to a visitor who has not, without throwing', () => {
    expect(render(false)).toEqual(['Event User Impact Survey']);
  });
});

/**
 * #3627. The survey's questions are read with what each may lack checked: an option question saved without its options
 * offers none rather than failing every question, and a question with no guid gets no control, as none could be keyed.
 */
describe('InitialSurveyComponent questions', () => {
  function open(questions: Array<object>) {
    TestBed.configureTestingModule({
      imports: [InitialSurveyComponent],
      providers: [
        { provide: GISDAY_SITE, useValue: gisdaySite('tamu') },
        {
          provide: InitialSurveyService,
          useValue: { seeIfUserTookSurvey: () => of(false), getInitialSurveyQuestions: () => of(questions) }
        }
      ]
    });

    const component = TestBed.createComponent(InitialSurveyComponent).componentInstance;
    component.ngOnInit();

    return component;
  }

  it("splits an option question's options", async () => {
    const component = open([{ guid: 'q-1', questionType: { type: 'multiple-option' }, questionOptions: 'Maps|Drones' }]);

    const [question] = await firstValueFrom(component.$initalSurveyQuestions);

    expect(question.options).toEqual([{ value: 'Maps' }, { value: 'Drones' }]);
    expect(component.dataGroup.contains('q-1')).toBe(true);
  });

  it('offers no options for an option question saved without any, and still reads the other questions', async () => {
    const component = open([
      { guid: 'q-1', questionType: { type: 'multiple-option' }, questionOptions: null },
      { guid: 'q-2', questionType: { type: 'text' }, questionOptions: null }
    ]);

    const questions = await firstValueFrom(component.$initalSurveyQuestions);

    expect(questions.map((q) => q.options)).toEqual([[], undefined]);
    expect(component.dataGroup.contains('q-2')).toBe(true);
  });

  it('adds no control for a question with no guid', async () => {
    const component = open([{ questionType: { type: 'text' }, questionOptions: null }]);

    await firstValueFrom(component.$initalSurveyQuestions);

    expect(Object.keys(component.dataGroup.controls)).toEqual([]);
  });
});
