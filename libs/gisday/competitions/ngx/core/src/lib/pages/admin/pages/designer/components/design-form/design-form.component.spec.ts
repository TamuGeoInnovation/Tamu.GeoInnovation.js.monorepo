import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { FormService } from '@tamu-gisc/gisday/competitions/ngx/data-access';

import { DesignFormComponent } from './design-form.component';

/**
 * #2474: an admin sets when the season's submissions start and stop counting, beside Allow Submissions.
 */
describe('DesignFormComponent, the scoring window', () => {
  const opens = '2026-11-14T06:00:00.000Z';
  const closes = '2026-11-20T17:00:00.000Z';

  let updateForm: jest.Mock;
  let component: DesignFormComponent;

  const load = (season: Record<string, unknown>) => {
    TestBed.overrideProvider(FormService, {
      useValue: {
        getFormForActiveSeason: () =>
          of({
            allowSubmissions: true,
            form: { guid: 'f-1', source: 'https://example.test/form.json', model: [{ attribute: 'kind', options: [] }] },
            ...season
          }),
        updateForm,
        createFormModelForActiveSeason: jest.fn(() => of({}))
      }
    });

    component = TestBed.createComponent(DesignFormComponent).componentInstance;
    component.ngOnInit();
  };

  beforeEach(async () => {
    updateForm = jest.fn(() => of({}));

    await TestBed.configureTestingModule({
      imports: [DesignFormComponent],
      providers: [
        { provide: FormService, useValue: {} },
        { provide: HttpClient, useValue: { get: jest.fn() } }
      ]
    })
      .overrideComponent(DesignFormComponent, { set: { template: '' } })
      .compileComponents();
  });

  it("shows the season's saved window", () => {
    load({ scoringOpensAt: opens, scoringClosesAt: closes });

    expect(component.formModel().value.scoringOpensAt).toEqual(new Date(opens));
    expect(component.formModel().value.scoringClosesAt).toEqual(new Date(closes));
  });

  it('says each moment in Central time, whatever the computer is set to', () => {
    load({ scoringOpensAt: opens, scoringClosesAt: closes });

    expect(component.inCentralTime(new Date(opens))).toBe('Sat, Nov 14, 2026, 12:00 AM Central');
    expect(component.inCentralTime(new Date(closes))).toBe('Fri, Nov 20, 2026, 11:00 AM Central');
    expect(component.inCentralTime(null)).toBe('No limit');
  });

  it('saves the window with the form', () => {
    load({ scoringOpensAt: opens, scoringClosesAt: closes });
    component.saveForm();

    expect(updateForm).toHaveBeenCalledWith(
      'f-1',
      expect.objectContaining({
        season: { allowSubmissions: true, scoringOpensAt: opens, scoringClosesAt: closes }
      })
    );
  });

  it('saves an empty moment as no limit', () => {
    load({ scoringOpensAt: null, scoringClosesAt: null });
    component.saveForm();

    expect(updateForm).toHaveBeenCalledWith(
      'f-1',
      expect.objectContaining({ season: { allowSubmissions: true, scoringOpensAt: null, scoringClosesAt: null } })
    );
  });
});
