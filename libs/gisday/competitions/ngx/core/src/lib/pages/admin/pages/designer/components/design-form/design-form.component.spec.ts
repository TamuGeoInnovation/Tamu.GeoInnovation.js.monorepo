import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UntypedFormArray } from '@angular/forms';
import { Subject } from 'rxjs';

import { CompetitionSeason, ICompetitionSeasonFormQuestion } from '@tamu-gisc/gisday/competitions/data-api';
import { FormService } from '@tamu-gisc/gisday/competitions/ngx/data-access';

import { DesignFormComponent } from './design-form.component';

describe('DesignFormComponent', () => {
  let component: DesignFormComponent;
  let season$: Subject<CompetitionSeason>;
  let emitted: Array<Array<ICompetitionSeasonFormQuestion>>;

  const savedQuestion: ICompetitionSeasonFormQuestion = {
    attribute: 'name',
    title: 'Name',
    instructions: '',
    enabled: true,
    isDiscriminator: false,
    options: [],
    type: 'text'
  };

  beforeEach(() => {
    // The saved form arrives after the component has initialized, as it does over HTTP.
    season$ = new Subject<CompetitionSeason>();

    TestBed.configureTestingModule({
      imports: [DesignFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FormService, useValue: { getFormForActiveSeason: () => season$.asObservable() } }
      ]
    });

    component = TestBed.createComponent(DesignFormComponent).componentInstance;
    emitted = [];
    component.updated.subscribe((fields) => emitted.push(fields));
    component.ngOnInit();
  });

  it('emits the saved questions when the saved form loads', () => {
    season$.next({ allowSubmissions: true, form: { source: 'https://example.com/layer/0', model: [savedQuestion] } } as CompetitionSeason);

    expect(emitted[emitted.length - 1]).toEqual([savedQuestion]);
  });

  // #1876: edits made after the saved form loaded were never emitted.
  it('emits edits made after the saved form loads', () => {
    season$.next({ allowSubmissions: true, form: { source: 'https://example.com/layer/0', model: [savedQuestion] } } as CompetitionSeason);

    const fields = component.formModel.get('fields') as UntypedFormArray;
    fields.at(0).get('title').setValue('Full name');

    expect(emitted[emitted.length - 1]).toEqual([{ ...savedQuestion, title: 'Full name' }]);
  });
});
