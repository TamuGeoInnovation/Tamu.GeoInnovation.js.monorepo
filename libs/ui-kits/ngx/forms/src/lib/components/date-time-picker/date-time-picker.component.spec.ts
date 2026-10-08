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
      component.minView = 'day';
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

    it('emits nothing for a cleared input', () => {
      const emitted: DateTimePickerChange<Date>[] = [];

      component.changed.subscribe((e) => emitted.push(e));
      component.handleInputChange('');

      expect(emitted).toHaveLength(0);
    });
  });
});
