import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

import { DateTimePickerComponent } from '@tamu-gisc/ui-kits/ngx/forms/date-time-picker';

import { TripPlannerService } from '../../../../services/trip-planner.service';
import { TripPlannerTimePickerComponent } from './base.component';

/**
 * The trip planner's "Leave at" (#2608).
 *
 * Choosing it from the menu drew no picker: the option said `depart`, and the picker is drawn for `leave`, the word
 * the planner's type and a shared link use. And a shared link with a time drew a picker with nothing in it: it was
 * handed the time as a number of milliseconds, and the picker reads anything but a `Date` as no value.
 */
describe('TripPlannerTimePickerComponent (#2608)', () => {
  let options: BehaviorSubject<{ time_mode: string; requested_time: Date | null }>;

  function render(time_mode: string, requested_time: Date | null) {
    options = new BehaviorSubject({ time_mode, requested_time });

    TestBed.configureTestingModule({
      imports: [TripPlannerTimePickerComponent],
      providers: [
        {
          provide: TripPlannerService,
          useValue: {
            TravelOptions: options.asObservable(),
            updateTravelOptions: (changes: object) => options.next({ ...options.value, ...changes })
          }
        }
      ]
    });

    const fixture = TestBed.createComponent(TripPlannerTimePickerComponent);
    fixture.detectChanges();

    return fixture;
  }

  const picker = (fixture: ReturnType<typeof render>) => fixture.debugElement.query(By.directive(DateTimePickerComponent));

  it('draws the picker when "Leave at" is chosen from the menu, at the current time', async () => {
    const fixture = render('now', null);
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#timeModeSelector');
    const before = Date.now();

    select.selectedIndex = [...select.options].findIndex((o) => o.textContent?.trim() === 'Leave at');
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(options.value.time_mode).toBe('leave');
    expect(picker(fixture), 'no picker was drawn').not.toBeNull();
    expect((picker(fixture).componentInstance as DateTimePickerComponent).value?.getTime()).toBeGreaterThanOrEqual(
      before - 1000
    );
  });

  it('shows "Leave at" as the chosen option when the planner leaves at a time', () => {
    const fixture = render('leave', new Date('2026-11-05T21:30:00.000Z'));
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#timeModeSelector');

    expect(select.options[select.selectedIndex].textContent?.trim()).toBe('Leave at');
  });

  it("gives the picker a shared link's time, so it shows it", () => {
    const at = new Date('2026-11-05T21:30:00.000Z');
    const fixture = render('leave', at);

    expect(picker(fixture), 'no picker was drawn').not.toBeNull();
    expect((picker(fixture).componentInstance as DateTimePickerComponent).value?.getTime()).toBe(at.getTime());
    expect(
      (picker(fixture).nativeElement as HTMLElement).textContent?.trim().length,
      'the picker shows no time'
    ).toBeGreaterThan(0);
  });

  it('removes the picker when "Leave now" is chosen', async () => {
    const fixture = render('leave', new Date('2026-11-05T21:30:00.000Z'));
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('#timeModeSelector');

    select.selectedIndex = [...select.options].findIndex((o) => o.textContent?.trim() === 'Leave now');
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(options.value).toEqual({ time_mode: 'now', requested_time: null });
    expect(picker(fixture)).toBeNull();
  });
});
