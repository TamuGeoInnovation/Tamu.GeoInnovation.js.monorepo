import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, Subject, throwError } from 'rxjs';

import { FormService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

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
        { provide: HttpClient, useValue: { get: jest.fn() } },
        { provide: NotificationService, useValue: { toast: jest.fn() } }
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

/**
 * #2582: Fetch Schema said nothing while it worked or when it failed. On gisday.tamu.edu a form file on txgisday.org was
 * refused by the browser (that site sends no Access-Control-Allow-Origin) and the page did nothing at all. Save said
 * nothing either way.
 */
describe('DesignFormComponent, what Fetch Schema and Save say', () => {
  let get: jest.Mock;
  let toast: jest.Mock;
  let updateForm: jest.Mock;
  let fixture: ComponentFixture<DesignFormComponent>;

  const page = () => fixture.nativeElement as HTMLElement;
  const status = () => page().querySelector('[role="status"]')?.textContent?.trim();
  const alert = () => page().querySelector('[role="alert"]')?.textContent?.trim();
  const fetchButton = () => page().querySelector<HTMLInputElement>('tamu-gisc-button input[type="submit"]');

  function fetchFrom(answer: Observable<unknown>) {
    get.mockReturnValue(answer);
    fixture.componentInstance.loadSchemaForm.setValue({ source: 'https://example.test/form.json' });
    fixture.componentInstance.getSchema();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    get = jest.fn();
    toast = jest.fn();
    updateForm = jest.fn(() => of({}));

    await TestBed.configureTestingModule({
      imports: [DesignFormComponent],
      providers: [
        {
          provide: FormService,
          useValue: {
            getFormForActiveSeason: () => of({ allowSubmissions: true, form: { guid: 'f-1', source: '', model: [] } }),
            updateForm,
            createFormModelForActiveSeason: jest.fn(() => of({}))
          }
        },
        { provide: HttpClient, useValue: { get } },
        { provide: NotificationService, useValue: { toast } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DesignFormComponent);
    fixture.detectChanges();
  });

  it('says it is fetching, and cannot be pressed again, until the answer comes', () => {
    const answer = new Subject<unknown>();

    fetchFrom(answer);
    fixture.componentInstance.getSchema();
    fixture.detectChanges();

    expect(status()).toBe('Fetching the schema…');
    expect(fetchButton().disabled).toBe(true);
    expect(get).toHaveBeenCalledTimes(1);

    answer.next({ fields: [] });
    answer.complete();
    fixture.detectChanges();

    expect(fetchButton().disabled).toBe(false);
  });

  it("says why when the browser refuses another site's file, and what to use instead", () => {
    fetchFrom(throwError(() => new HttpErrorResponse({ status: 0, url: 'https://example.test/form.json' })));

    expect(alert()).toBe(
      "Couldn't load that address. Use a form file on this site (/assets/competitions/...) or a public ArcGIS layer."
    );
    expect(fetchButton().disabled).toBe(false);
  });

  it('says what the address answered when it refuses', () => {
    fetchFrom(throwError(() => new HttpErrorResponse({ status: 404, error: 'Not Found' })));

    expect(alert()).toBe("Couldn't load that address: it answered 404.");
  });

  it('says why when an ArcGIS layer refuses, as ArcGIS does, inside a successful answer', () => {
    fetchFrom(of({ error: { code: 499, message: 'Token Required' } }));

    expect(alert()).toBe('The layer refused: Token Required. The Designer can read only a public layer.');
  });

  it('says when the address has no fields to make a form from', () => {
    fetchFrom(of({ name: 'Not a layer' }));

    expect(alert()).toBe("That address has no fields to make a form from. Use a form file or an ArcGIS layer's address.");
  });

  it('says what it found', () => {
    fetchFrom(
      of({
        fields: [
          { name: 'kind', alias: 'Kind', domain: null },
          { name: 'name', alias: 'Name', domain: null }
        ]
      })
    );

    expect(status()).toBe('Found 2 fields: Kind, Name. Each is a question below; review them, then Save.');
    expect(alert()).toBeUndefined();
    expect(fixture.componentInstance.fields().length).toBe(2);
  });

  it('says the form is saved', () => {
    fixture.componentInstance.saveForm();

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Saved', message: 'The form is saved.' }));
  });

  it("says why the form wasn't saved, in the API's words", () => {
    updateForm.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 403,
            error: { statusCode: 403, message: 'Missing permission: update:competitions', error: 'Forbidden' }
          })
      )
    );

    fixture.componentInstance.saveForm();

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Couldn't save", message: 'Missing permission: update:competitions' })
    );
  });
});
