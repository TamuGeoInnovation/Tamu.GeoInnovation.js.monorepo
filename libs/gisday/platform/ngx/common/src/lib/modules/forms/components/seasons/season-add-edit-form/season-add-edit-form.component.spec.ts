import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { SeasonAddEditFormComponent } from './season-add-edit-form.component';

/**
 * #3574. SeasonService hands the form a season's days with their dates as Dates (#3558), so each day's control holds the
 * Date it came with, and a day added by hand starts as a new Date.
 */
describe('SeasonAddEditFormComponent, its days', () => {
  const monday = { guid: 'day-mon', date: new Date('2026-11-16T06:00:00.000Z') };
  const tuesday = { guid: 'day-tue', date: new Date('2026-11-17T06:00:00.000Z') };

  function open() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ guid: 'season-2026' }) } },
        {
          provide: SeasonService,
          useValue: { getEntity: () => of({ guid: 'season-2026', year: 2026, active: true, days: [monday, tuesday] }) }
        },
        { provide: NotificationService, useValue: { toast: vi.fn() } }
      ]
    });
    // The form's own setup is what is under test, not its template.
    TestBed.overrideTemplate(SeasonAddEditFormComponent, '');

    const fixture = TestBed.createComponent(SeasonAddEditFormComponent);
    fixture.componentRef.setInput('type', 'edit');
    fixture.componentInstance.ngOnInit();

    return fixture.componentInstance;
  }

  it("holds each of the season's days with the Date it came with", () => {
    const days = open().form.getRawValue().days;

    expect(days).toEqual([
      { guid: 'day-mon', date: monday.date },
      { guid: 'day-tue', date: tuesday.date }
    ]);
    expect(days[0].date).toBeInstanceOf(Date);
  });

  it('starts a day added by hand as a new Date', () => {
    const form = open();

    form.addDay();

    const added = form.form.getRawValue().days[2];

    expect(added.guid).toBeUndefined();
    expect(added.date).toBeInstanceOf(Date);
    expect(isNaN(added.date.getTime())).toBe(false);
  });
});
