import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { gisdaySite } from '@tamu-gisc/gisday/common';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';
import { InitialSurveyService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { InitialSurveyComponent } from './initial-survey.component';

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
