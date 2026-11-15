import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { TextboxComponent } from './components/textbox/textbox.component';
import { RangeComponent } from './components/range/range.component';
import { SelectComponent } from './components/select/select.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { CheckboxGroupComponent } from './components/checkbox-group/checkbox-group.component';
import { FileComponent } from './components/file/file.component';
import { RadioGroupComponent } from './components/radio-group/radio-group.component';
import { DateTimePickerComponent } from './components/date-time-picker/date-time-picker.component';

/**
 * #2964. A value the form writes into a shared control is not a change the user made. Each control used to report
 * the value it was given straight back to the form, so the form counted as changed (dirty) and touched the moment it
 * opened, and an admin details page asked before leaving a form nobody had edited. #2942 reset each GIS Day form
 * after loading to hide it.
 *
 * Each control here is checked through a real form: opening with a value, then given one later, as a page does
 * when its record arrives, must leave the form unchanged; a change the user makes must still be one.
 */

interface Host<V> {
  control: FormControl<V>;
}

@Component({
  template: `<tamu-gisc-textbox [formControl]="control" type="text"></tamu-gisc-textbox>`,
  imports: [ReactiveFormsModule, TextboxComponent]
})
class TextboxHostComponent implements Host<string> {
  public control = new FormControl<string>('Saved name');
}

@Component({
  template: `<tamu-gisc-range [formControl]="control" [min]="0" [max]="9"></tamu-gisc-range>`,
  imports: [ReactiveFormsModule, RangeComponent]
})
class RangeHostComponent implements Host<number> {
  public control = new FormControl<number>(3);
}

const levels = [
  { value: 'lidar', label: 'LiDAR' },
  { value: 'raster', label: 'Raster' },
  { value: 'point', label: 'Point' }
];

@Component({
  template: `<tamu-gisc-select [formControl]="control" [data]="levels" displayTemplate="label" valueTemplate="value"></tamu-gisc-select>`,
  imports: [ReactiveFormsModule, SelectComponent]
})
class SelectHostComponent implements Host<string> {
  public levels = levels;
  public control = new FormControl<string>('raster');
}

@Component({
  template: `<tamu-gisc-checkbox [formControl]="control" label="Active"></tamu-gisc-checkbox>`,
  imports: [ReactiveFormsModule, CheckboxComponent]
})
class CheckboxHostComponent implements Host<boolean> {
  public control = new FormControl<boolean>(true);
}

const tags = [{ guid: 'a' }, { guid: 'b' }, { guid: 'c' }];

@Component({
  template: `<tamu-gisc-checkbox-group [formControl]="control" referenceId="guid">
    @for (tag of tags; track tag.guid) {
    <tamu-gisc-checkbox [data]="tag" [label]="tag.guid"></tamu-gisc-checkbox>
    }
  </tamu-gisc-checkbox-group>`,
  imports: [ReactiveFormsModule, CheckboxGroupComponent, CheckboxComponent]
})
class CheckboxGroupHostComponent implements Host<Array<string>> {
  public tags = tags;
  public control = new FormControl<Array<string>>(['a']);
}

@Component({
  template: `<tamu-gisc-file [formControl]="control" accept="image/png"></tamu-gisc-file>`,
  imports: [ReactiveFormsModule, FileComponent]
})
class FileHostComponent implements Host<File> {
  public control = new FormControl<File>(null);
}

@Component({
  template: `<tamu-gisc-radio-group [formControl]="control" [options]="levels" displayPath="label" valuePath="value"></tamu-gisc-radio-group>`,
  imports: [ReactiveFormsModule, RadioGroupComponent]
})
class RadioGroupHostComponent implements Host<string> {
  public levels = levels;
  public control = new FormControl<string>('raster');
}

@Component({
  template: `<tamu-gisc-date-time-picker [formControl]="control"></tamu-gisc-date-time-picker>`,
  imports: [ReactiveFormsModule, DateTimePickerComponent]
})
class DateTimePickerHostComponent implements Host<Date> {
  public control = new FormControl<Date>(new Date(2026, 10, 18, 15, 45));
}

const photo = new File(['png'], 'photo.png', { type: 'image/png' });

interface Case<V> {
  name: string;
  host: Type<Host<V>>;
  /** What the page's record gives the control once it arrives. */
  loaded: V;
  /** Does what a user does to change the control. */
  userChange: (fixture: ComponentFixture<Host<V>>) => void;
  /** The form's value after that change. */
  changedTo: V;
}

function control<C>(fixture: ComponentFixture<unknown>, type: Type<C>): C {
  return fixture.debugElement.query(By.directive(type)).componentInstance as C;
}

const cases: Array<Case<unknown>> = [
  {
    name: 'textbox (AbstractValueAccessorFormComponent)',
    host: TextboxHostComponent,
    loaded: 'Loaded name',
    userChange: (fixture) => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
      input.value = 'Typed name';
      input.dispatchEvent(new Event('input'));
    },
    changedTo: 'Typed name'
  } as Case<string>,
  {
    name: 'range (AbstractValueAccessorFormComponent)',
    host: RangeHostComponent,
    loaded: 6,
    userChange: (fixture) => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="range"]');
      input.value = '8';
      input.dispatchEvent(new Event('input'));
    },
    changedTo: 8
  } as Case<number>,
  {
    name: 'select',
    host: SelectHostComponent,
    loaded: 'point',
    userChange: (fixture) => {
      // A choice from the list, as the drop-down and the searchable list both make it.
      control(fixture, SelectComponent).choose(levels[0]);
    },
    changedTo: 'lidar'
  } as Case<string>,
  {
    name: 'checkbox',
    host: CheckboxHostComponent,
    loaded: false,
    userChange: (fixture) => {
      (fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement).click();
    },
    changedTo: true
  } as Case<boolean>,
  {
    name: 'checkbox group',
    host: CheckboxGroupHostComponent,
    loaded: ['b'],
    userChange: (fixture) => {
      // Ticks "c", alongside the "b" the form gave it.
      (fixture.nativeElement.querySelectorAll('input[type="checkbox"]')[2] as HTMLInputElement).click();
    },
    changedTo: ['b', 'c']
  } as Case<Array<string>>,
  {
    name: 'file',
    host: FileHostComponent,
    loaded: null,
    userChange: (fixture) => {
      // jsdom cannot put a file in a file input, so the component's handler is given the input's change.
      control(fixture, FileComponent).handleFileChange({ target: { files: [photo], value: 'photo.png' } });
    },
    changedTo: photo
  } as Case<File>,
  {
    name: 'radio group',
    host: RadioGroupHostComponent,
    loaded: 'point',
    userChange: (fixture) => {
      control(fixture, RadioGroupComponent).evaluateSetValue(levels[0]);
    },
    changedTo: 'lidar'
  } as Case<string>,
  {
    name: 'date-time picker',
    host: DateTimePickerHostComponent,
    loaded: new Date(2026, 10, 19, 9, 0),
    userChange: (fixture) => {
      // The native input's change, which the picker's tooltip holds.
      control(fixture, DateTimePickerComponent).handleInputChange('2026-11-20T10:30');
    },
    changedTo: new Date(2026, 10, 20, 10, 30)
  } as Case<Date>
];

describe('a value the form writes into a shared control (#2964)', () => {
  describe.each(cases)('$name', ({ host, loaded, userChange, changedTo }) => {
    let fixture: ComponentFixture<Host<unknown>>;
    let form: FormControl<unknown>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [host] }).compileComponents();

      fixture = TestBed.createComponent(host);
      form = fixture.componentInstance.control;
    });

    afterEach(() => fixture.destroy());

    it('opens with the value it was given, unchanged and untouched', async () => {
      const initial = form.value;

      fixture.detectChanges();
      await fixture.whenStable();

      expect(form.dirty).toBe(false);
      expect(form.touched).toBe(false);
      expect(form.value).toEqual(initial);
    });

    it('takes a value given once the page has drawn as no change, and does not report it back', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const reported: Array<unknown> = [];
      form.valueChanges.subscribe((v) => reported.push(v));

      form.setValue(loaded);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(form.dirty).toBe(false);
      expect(form.touched).toBe(false);
      expect(form.value).toEqual(loaded);
      // Once for the form's own setValue. A second would be the control echoing it.
      expect(reported).toEqual([loaded]);
    });

    it('still reports a change the user makes', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      form.setValue(loaded);
      fixture.detectChanges();
      await fixture.whenStable();

      userChange(fixture);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(form.dirty).toBe(true);
      expect(form.value).toEqual(changedTo);
    });
  });

  // The checkbox's own `changed` output is for a user's click: list pages bind it to select rows (#2964).
  it("does not announce a checkbox's loaded value as the checkbox's own change", async () => {
    await TestBed.configureTestingModule({ imports: [CheckboxHostComponent] }).compileComponents();

    const fixture = TestBed.createComponent(CheckboxHostComponent);
    fixture.detectChanges();

    const checkbox = control(fixture, CheckboxComponent);
    const changed: Array<boolean> = [];
    checkbox.changed.subscribe((v) => changed.push(v));

    fixture.componentInstance.control.setValue(false);
    fixture.detectChanges();

    expect(checkbox.checked).toBe(false);
    expect(changed).toEqual([]);

    (fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement).click();

    expect(changed).toEqual([true]);
  });
});
