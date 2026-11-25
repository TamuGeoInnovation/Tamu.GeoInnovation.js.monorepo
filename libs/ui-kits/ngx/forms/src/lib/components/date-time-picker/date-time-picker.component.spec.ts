import { OutputRef } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import {
  DrawerComponent,
  AccordionComponent,
  AccordionHeaderComponent,
  AccordionContentComponent,
  TooltipComponent,
  TooltipTriggerComponent,
  TabsComponent,
  TabComponent,
  AccordionDirective,
  AccordionHeaderDirective,
  AccordionContentDirective,
  StepperComponent,
  StepComponent,
  StepToggleComponent,
  StepperToggleDirective,
  RenderHostDirective,
  ElementInsertDirective
} from '@tamu-gisc/ui-kits/ngx/layout';

import {
  DateTimePickerChange,
  DateTimePickerComponent,
  pickerKindFor,
  withDate,
  withTime
} from './date-time-picker.component';

/**
 * The picker on Angular Material's date and time fields (#2583), after the browser's own inputs (#1220).
 *
 * These check the behaviour its callers rely on: the right fields for each caller, values that survive the
 * round trip, and a `changed` event carrying the picked date.
 */
describe('DateTimePickerComponent', () => {
  describe('what it picks', () => {
    it('picks a time of day where the coarsest unit is the hour (GIS Day event times)', () => {
      expect(pickerKindFor('minute', 'hour')).toBe('time');
    });

    it('picks a date where the finest unit is the day (GIS Day season days)', () => {
      expect(pickerKindFor('day', 'month')).toBe('date');
    });

    it('picks a date and time by default (the VGI Designer, the trip planner)', () => {
      expect(pickerKindFor('minute', 'month')).toBe('date-time');
      expect(pickerKindFor('minute', 'year')).toBe('date-time');
    });
  });

  describe('values', () => {
    const base = new Date(2026, 9, 1, 14, 35);

    it('keeps the date when only a time is picked', () => {
      expect(withTime(base, new Date(2000, 0, 1, 9, 5))).toEqual(new Date(2026, 9, 1, 9, 5));
    });

    it('keeps the time when only a date is picked', () => {
      expect(withDate(base, new Date(2026, 10, 18))).toEqual(new Date(2026, 10, 18, 14, 35));
    });

    it('takes midnight with a date, and today with a time, when there is nothing to keep', () => {
      expect(withDate(null, new Date(2026, 10, 18, 9, 30))).toEqual(new Date(2026, 10, 18));

      const time = withTime(null, new Date(2000, 0, 1, 9, 30));
      const today = new Date();
      expect([time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes()]).toEqual([
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        9,
        30
      ]);
    });
  });

  describe('component', () => {
    let component: DateTimePickerComponent;
    let fixture: ComponentFixture<DateTimePickerComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          DrawerComponent,
          AccordionComponent,
          AccordionHeaderComponent,
          AccordionContentComponent,
          TooltipComponent,
          TooltipTriggerComponent,
          TabsComponent,
          TabComponent,
          AccordionDirective,
          AccordionHeaderDirective,
          AccordionContentDirective,
          StepperComponent,
          StepComponent,
          StepToggleComponent,
          StepperToggleDirective,
          RenderHostDirective,
          ElementInsertDirective,
          DateTimePickerComponent
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(DateTimePickerComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('takes a value written by a form', () => {
      const birthday = new Date('December 17, 1995 03:24:00');

      component.writeValue(birthday);

      expect(component.value).toStrictEqual(birthday);
    });

    it('renders the fields for what it picks', () => {
      const fields = (minView: 'day' | 'minute', maxView: 'month' | 'hour') => {
        fixture.componentRef.setInput('minView', minView);
        fixture.componentRef.setInput('maxView', maxView);
        fixture.detectChanges();

        return Array.from(fixture.nativeElement.querySelectorAll('input.date-time-picker-input'), (i: HTMLInputElement) =>
          i.getAttribute('aria-label')
        );
      };

      // The fields live in the tooltip, which renders its content only once opened - as a user does.
      fixture.nativeElement.querySelector('tamu-gisc-tooltip-trigger').click();
      fixture.detectChanges();

      expect(fields('day', 'month')).toEqual(['Date']);
      expect(fields('minute', 'hour')).toEqual(['Time']);
      expect(fields('minute', 'month')).toEqual(['Date', 'Time']);
    });

    it('emits the picked date and tells the form', () => {
      const emitted: DateTimePickerChange<Date>[] = [];
      const toForm: Date[] = [];

      component.writeValue(new Date(2026, 9, 1, 14, 35));
      component.registerOnChange((v: Date) => toForm.push(v));
      component.changed.subscribe((e) => emitted.push(e));

      component.handleDatePicked(new Date(2026, 9, 2));
      component.handleTimePicked(new Date(2000, 0, 1, 9, 0));

      expect(emitted).toHaveLength(2);
      expect(emitted[0]).toBeInstanceOf(DateTimePickerChange);
      expect(emitted[0].value).toEqual(new Date(2026, 9, 2, 14, 35));
      expect(emitted[1].value).toEqual(new Date(2026, 9, 2, 9, 0));
      expect(toForm).toEqual([new Date(2026, 9, 2, 14, 35), new Date(2026, 9, 2, 9, 0)]);
    });

    // The native time input replaced a grid of hours and minutes with a typed field, and the GIS Day
    // event form, which nobody could run at the time, lost its list of times to choose from (#1747).
    describe('a time of day (GIS Day event times)', () => {
      const offered = () =>
        Array.from(document.querySelectorAll('.tamu-gisc-date-time-picker-panel mat-option'), (o) => o.textContent.trim());

      const open = async () => {
        fixture.componentRef.setInput('maxView', 'hour');
        component.writeValue(new Date(2026, 10, 18, 15, 45));
        fixture.detectChanges();

        // The tooltip reports itself open a moment after it is drawn, and the list opens on that: wait for
        // the list itself, not for a moment that is long enough on an idle machine (#2244).
        await until(timepicker().opened, () => {
          fixture.nativeElement.querySelector('tamu-gisc-tooltip-trigger').click();
          fixture.detectChanges();
        });
      };

      // The component's own list of times: until the tooltip opens it is not projected, so no query finds it.
      const timepicker = () => component['timepicker']();

      // Does what `act` does, then waits until `event` has been emitted and the page has caught up with it.
      const until = async (event: OutputRef<void>, act: () => void) => {
        const emitted = firstValueFrom(outputToObservable(event));
        act();
        await emitted;
        await settle();
      };

      const settle = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
      };

      // The list scrolls the current time into view when it opens, which jsdom does not implement.
      beforeAll(() => {
        Element.prototype.scrollIntoView = vi.fn();
      });

      afterEach(() => {
        fixture.destroy();
      });

      it('offers the times to choose from as soon as the picker opens, in steps of minuteStep', async () => {
        await open();

        const times = offered();

        expect(times).toHaveLength(288);
        expect(times.slice(0, 3)).toEqual(['12:00 AM', '12:05 AM', '12:10 AM']);
        expect(times).toContain('3:45 PM');
      });

      it('follows a different minuteStep', async () => {
        fixture.componentRef.setInput('minuteStep', 15);
        await open();

        expect(offered()).toHaveLength(96);
      });

      it('sets the time, keeps the date, tells the caller and closes when a time is chosen', async () => {
        const emitted: DateTimePickerChange<Date>[] = [];
        component.changed.subscribe((e) => emitted.push(e));

        await open();

        const option = Array.from(
          document.querySelectorAll<HTMLElement>('.tamu-gisc-date-time-picker-panel mat-option')
        ).find((o) => o.textContent.trim() === '4:15 PM');
        option.click();
        await settle();

        expect(emitted).toHaveLength(1);
        expect(emitted[0].value).toEqual(new Date(2026, 10, 18, 16, 15));
        expect(component.value).toEqual(new Date(2026, 10, 18, 16, 15));
        expect(fixture.debugElement.query((d) => d.name === 'tamu-gisc-tooltip').componentInstance.isVisible()).toBe(false);
      });

      it('does not open the list before the picker itself is opened', async () => {
        fixture.componentRef.setInput('maxView', 'hour');
        fixture.detectChanges();
        await settle();

        expect(document.querySelectorAll('mat-option')).toHaveLength(0);
      });

      it('takes the list away with the picker', async () => {
        await open();
        expect(offered().length).toBeGreaterThan(0);

        // The tooltip closes at once and the list a moment later, on the tooltip's word: waiting a fixed
        // moment for it failed one run in four on a busy machine (#2244).
        await until(timepicker().closed, () => document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })));

        expect(document.querySelectorAll('mat-option')).toHaveLength(0);
      });
    });

    it('emits nothing for a cleared date, and tells the form there is no value', () => {
      const emitted: DateTimePickerChange<Date>[] = [];
      const toForm: Date[] = [];

      component.writeValue(new Date(2026, 9, 1, 14, 35));
      component.registerOnChange((v: Date) => toForm.push(v));
      component.changed.subscribe((e) => emitted.push(e));
      component.handleDatePicked(null);

      expect(emitted).toHaveLength(0);
      expect(toForm).toEqual([null]);
    });

    /**
     * Regression coverage (#1772). A GIS Day event's start time was stored as the text "Invalid Date",
     * and the form handed the picker an invalid Date built from it. Every time picked after that was
     * built on that invalid Date, so it came out invalid too: the event could not be corrected, and
     * each save wrote "Invalid Date" again.
     */
    describe('a value that is not a valid date', () => {
      it('turns a time chosen from the list into a valid time', () => {
        const emitted: DateTimePickerChange<Date>[] = [];
        component.changed.subscribe((e) => emitted.push(e));
        component.writeValue(new Date('Invalid Date'));

        component.handleTimePicked(new Date(2000, 0, 1, 14, 0));

        expect(emitted).toHaveLength(1);
        expect(isNaN(emitted[0].value.getTime())).toBe(false);
        expect([emitted[0].value.getHours(), emitted[0].value.getMinutes()]).toEqual([14, 0]);
      });

      it('turns a chosen date into a valid date', () => {
        const emitted: DateTimePickerChange<Date>[] = [];
        component.changed.subscribe((e) => emitted.push(e));
        component.writeValue(new Date('Invalid Date'));

        component.handleDatePicked(new Date(2026, 10, 18));

        expect(emitted).toHaveLength(1);
        expect(emitted[0].value).toEqual(new Date(2026, 10, 18));
      });

      it('shows empty fields rather than NaN, and does not throw without a value', () => {
        component.writeValue(new Date('Invalid Date'));
        expect(component.fieldValue).toBeNull();
        expect(() => component.writeValue(null)).not.toThrow();
        expect(component.value).toBeNull();
        expect(withTime(new Date('Invalid Date'), new Date(2000, 0, 1, 9, 30)).getHours()).toBe(9);
      });
    });
  });

  /**
   * Regression coverage (#2583). Setting the 2026 VGI scoring window took four saves: the Designer's date and time
   * were the browser's own `datetime-local` box, which reports a change on every key once it holds a whole value,
   * and the picker closed on the first one. Typing "30" into the minutes saved :03, and the cutoff kept saving as
   * 11:30 while 11:00 was being chosen. The date is now chosen or typed in Angular Material's calendar field and
   * the time in its time field, and the picker stays open until both are done.
   */
  describe('a date and a time (the VGI Designer, #2583)', () => {
    let component: DateTimePickerComponent;
    let fixture: ComponentFixture<DateTimePickerComponent>;
    let toForm: Date[];

    // The cutoff the maintainer was setting: 20 November, 11:00 AM, in the browser's own time, which for the
    // Designer is Central (17:00 UTC). The tests run in whatever zone the machine has, so they ask for the moment
    // in local time; the browser check in #2583 saved 2026-11-20T17:00:00Z from Central.
    const CUTOFF = new Date(2026, 10, 20, 11, 0);

    const settle = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };

    const tooltipOpen = () => fixture.debugElement.query((d) => d.name === 'tamu-gisc-tooltip').componentInstance.isVisible();

    const field = (part: 'date' | 'time'): HTMLInputElement => fixture.nativeElement.querySelector(`input.date-time-picker-${part}`);

    // Types into a field one key at a time, as a person does, then leaves it.
    const type = async (input: HTMLInputElement, text: string) => {
      input.focus();
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      for (const key of text) {
        input.value += key;
        input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await settle();
      }

      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('blur'));
      await settle();
    };

    const open = async () => {
      fixture.nativeElement.querySelector('tamu-gisc-tooltip-trigger').click();
      await settle();
    };

    // The list scrolls the current time into view when it opens, which jsdom does not implement.
    beforeAll(() => {
      Element.prototype.scrollIntoView = vi.fn();
    });

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [DateTimePickerComponent] }).compileComponents();

      fixture = TestBed.createComponent(DateTimePickerComponent);
      component = fixture.componentInstance;
      // As the Designer has it: the year down to the minute.
      fixture.componentRef.setInput('maxView', 'year');
      fixture.componentRef.setInput('minView', 'minute');
      toForm = [];
      component.registerOnChange((v: Date) => toForm.push(v));
      fixture.detectChanges();
    });

    afterEach(() => {
      fixture.destroy();
    });

    it('takes a typed date and a typed time, every key of each, and gives exactly that moment', async () => {
      component.writeValue(new Date(2026, 10, 18, 11, 30));
      await open();

      await type(field('date'), '11/20/2026');
      expect(tooltipOpen()).toBe(true);

      await type(field('time'), '11:00 AM');

      expect(component.value).toEqual(CUTOFF);
      expect(toForm[toForm.length - 1]).toEqual(CUTOFF);
    });

    it('keeps every key of a typed time: "30" is :30, not :03', async () => {
      component.writeValue(new Date(2026, 10, 20, 11, 0));
      await open();

      await type(field('time'), '11:30 AM');

      expect(component.value).toEqual(new Date(2026, 10, 20, 11, 30));
    });

    it('gives exactly the moment chosen from the calendar and the list of times', async () => {
      component.writeValue(new Date(2026, 10, 2, 8, 0));
      await open();

      fixture.nativeElement.querySelector('.date-time-picker-date-toggle button').click();
      await settle();
      document.querySelector<HTMLElement>('[aria-label="November 20, 2026"]').click();
      await settle();
      expect(tooltipOpen()).toBe(true);

      fixture.nativeElement.querySelector('.date-time-picker-time-toggle button').click();
      await settle();
      Array.from(document.querySelectorAll<HTMLElement>('.tamu-gisc-date-time-picker-panel mat-option'))
        .find((o) => o.textContent.trim() === '11:00 AM')
        .click();
      await settle();

      expect(component.value).toEqual(CUTOFF);
      expect(toForm[toForm.length - 1]).toEqual(CUTOFF);
    });

    it('offers the times in steps of minuteStep', async () => {
      fixture.componentRef.setInput('minuteStep', 15);
      component.writeValue(CUTOFF);
      await open();

      fixture.nativeElement.querySelector('.date-time-picker-time-toggle button').click();
      await settle();

      expect(document.querySelectorAll('.tamu-gisc-date-time-picker-panel mat-option')).toHaveLength(96);
    });

    it('gives no value once cleared, and shows empty fields', async () => {
      component.writeValue(CUTOFF);
      await open();

      await type(field('date'), '');

      expect(toForm[toForm.length - 1]).toBeNull();

      component.writeValue(null);
      await settle();

      expect(component.value).toBeNull();
      expect(field('date').value).toBe('');
      expect(field('time').value).toBe('');
    });
  });
});
