import { ComponentFixture, TestBed } from '@angular/core/testing';

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
  fromInputValue,
  inputTypeFor,
  toInputValue
} from './date-time-picker.component';

/**
 * The picker on the browser's native inputs (#1220).
 *
 * It wrapped `angular-bootstrap-datetimepicker`, a View Engine library with no Ivy release, which only
 * worked because `ngcc` rewrote it and stopped being a valid NgModule without it. These check the
 * behaviour its callers rely on: the right input for each caller, values that survive the round trip,
 * and a `changed` event carrying the picked date.
 */
describe('DateTimePickerComponent', () => {
  describe('input type', () => {
    it('picks a time of day where the coarsest unit is the hour (GIS Day event times)', () => {
      expect(inputTypeFor('minute', 'hour')).toBe('time');
    });

    it('picks a date where the finest unit is the day (GIS Day season days)', () => {
      expect(inputTypeFor('day', 'month')).toBe('date');
    });

    it('picks a date and time by default (UES, the trip planner)', () => {
      expect(inputTypeFor('minute', 'month')).toBe('datetime-local');
    });
  });

  describe('values', () => {
    const base = new Date(2026, 9, 1, 14, 35);

    it('writes each input type in local time', () => {
      expect(toInputValue(base, 'time')).toBe('14:35');
      expect(toInputValue(base, 'date')).toBe('2026-10-01');
      expect(toInputValue(base, 'datetime-local')).toBe('2026-10-01T14:35');
    });

    it('keeps the date when only a time is picked', () => {
      expect(fromInputValue('09:05', 'time', base)).toEqual(new Date(2026, 9, 1, 9, 5));
    });

    it('keeps the time when only a date is picked', () => {
      expect(fromInputValue('2026-11-18', 'date', base)).toEqual(new Date(2026, 10, 18, 14, 35));
    });

    it('reads a date and time', () => {
      expect(fromInputValue('2026-11-18T08:00', 'datetime-local', base)).toEqual(new Date(2026, 10, 18, 8, 0));
    });

    it('ignores an empty or malformed value', () => {
      expect(fromInputValue('', 'time', base)).toBeNull();
      expect(fromInputValue('', 'date', base)).toBeNull();
      expect(fromInputValue('not a date', 'datetime-local', base)).toBeNull();
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

    it('renders a native input of the right type', () => {
      fixture.componentRef.setInput('minView', 'day');
      fixture.detectChanges();

      // The input lives in the tooltip, which renders its content only once opened - as a user does.
      fixture.nativeElement.querySelector('tamu-gisc-tooltip-trigger').click();
      fixture.detectChanges();

      const input: HTMLInputElement = fixture.nativeElement.querySelector('input.date-time-picker-input');

      expect(input).not.toBeNull();
      expect(input.type).toBe('date');
    });

    it('emits the picked date and tells the form', () => {
      const emitted: DateTimePickerChange<Date>[] = [];
      const toForm: Date[] = [];

      component.writeValue(new Date(2026, 9, 1, 14, 35));
      component.registerOnChange((v: Date) => toForm.push(v));
      component.changed.subscribe((e) => emitted.push(e));

      component.handleInputChange('2026-10-02T09:00');

      expect(emitted).toHaveLength(1);
      expect(emitted[0]).toBeInstanceOf(DateTimePickerChange);
      expect(emitted[0].value).toEqual(new Date(2026, 9, 2, 9, 0));
      expect(toForm).toEqual([new Date(2026, 9, 2, 9, 0)]);
    });

    // The native time input replaced a grid of hours and minutes with a typed field, and the GIS Day
    // event form, which nobody could run at the time, lost its list of times to choose from (#1747).
    describe('a time of day (GIS Day event times)', () => {
      const offered = () => Array.from(document.querySelectorAll('.tamu-gisc-date-time-picker-panel mat-option'), (o) => o.textContent.trim());

      const open = async () => {
        fixture.componentRef.setInput('maxView', 'hour');
        component.writeValue(new Date(2026, 10, 18, 15, 45));
        fixture.detectChanges();

        fixture.nativeElement.querySelector('tamu-gisc-tooltip-trigger').click();
        fixture.detectChanges();

        // The tooltip reports itself open a moment after it is drawn, and the list opens on that.
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
        Element.prototype.scrollIntoView = jest.fn();
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

        const option = Array.from(document.querySelectorAll<HTMLElement>('.tamu-gisc-date-time-picker-panel mat-option')).find(
          (o) => o.textContent.trim() === '4:15 PM'
        );
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

        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await settle();

        expect(document.querySelectorAll('mat-option')).toHaveLength(0);
      });
    });

    it('emits nothing for a cleared input', () => {
      const emitted: DateTimePickerChange<Date>[] = [];

      component.changed.subscribe((e) => emitted.push(e));
      component.handleInputChange('');

      expect(emitted).toHaveLength(0);
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

      it('turns a typed time into a valid time', () => {
        fixture.componentRef.setInput('maxView', 'hour');
        const emitted: DateTimePickerChange<Date>[] = [];
        component.changed.subscribe((e) => emitted.push(e));
        component.writeValue(new Date('Invalid Date'));

        component.handleInputChange('16:00');

        expect(emitted).toHaveLength(1);
        expect([emitted[0].value.getHours(), emitted[0].value.getMinutes()]).toEqual([16, 0]);
      });

      it('shows an empty field rather than NaN, and does not throw without a value', () => {
        expect(toInputValue(new Date('Invalid Date'), 'time')).toBe('');
        expect(toInputValue(null, 'datetime-local')).toBe('');
        expect(() => component.writeValue(null)).not.toThrow();
        expect(component.value).toBeNull();
        expect(fromInputValue('09:30', 'time', new Date('Invalid Date')).getHours()).toBe(9);
      });
    });
  });
});
