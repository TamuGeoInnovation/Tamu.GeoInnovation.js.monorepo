import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  ChangeDetectorRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal
} from '@angular/core';
import { getPropertyValue } from '@tamu-gisc/common/utils/object';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

import { AutocompleteComponent } from '../autocomplete/autocomplete.component';

@Component({
  selector: 'tamu-gisc-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgClass, AutocompleteComponent]
})
export class SelectComponent<T extends object> implements ControlValueAccessor {
  private cd = inject(ChangeDetectorRef);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Functions as the initial/default or state value of the select element.
   *
   * If no `model` is provided from the parent, the placeholder is automatically selected.
   *
   * A model rather than an input: the component sets it itself, from the user and the forms API.
   *
   * The property of the chosen item named by `valueTemplate`, or the item itself without one: the layer filter
   * takes the whole field (#2256).
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  protected readonly _value = model<T | string>(undefined, { alias: 'value' });

  public readonly formControlName = input('default');

  public readonly floatLabel = input(false);

  public get value() {
    return this._value();
  }

  public set value(value: T | string) {
    this._value.set(value === null || value === undefined || value === ('undefined' as unknown) ? undefined : value);
    this._onChange(value === null || value === undefined || value === ('undefined' as unknown) ? undefined : value);
    this._onTouched();
    this.cd.markForCheck();
  }

  /**
   * Iterable data collection that will be used to generate the drop-down options.
   */
  public readonly data = input<T[]>(undefined);

  /**
   * Dot-notation string representing the evaluated property used in the display of the option element.
   */
  public readonly displayTemplate = input<string>(undefined);

  /**
   * Dot-notation string representing the evaluated property used in the option data model.
   */
  public readonly valueTemplate = input<string>(undefined);

  /**
   * Custom string used as the initial/undefined default option.
   */
  public readonly placeholder = input<string>(undefined);

  /**
   * Determines interactivity availability.
   *
   * Default to `false`;
   *
   * A model rather than an input: the forms API sets it.
   */
  public readonly disabled = model(false);

  /**
   * Event emitted when the value of the select input element is changed.
   */
  public readonly changed = output<T | string>();

  /**
   * Lets the option be found by typing as well as picked from the list (#2656). The list opens when the field is
   * focused, and typing narrows it to the options whose label contains the text, ignoring case. The value is the same
   * as without it: the chosen item's `valueTemplate` property, so a form needs no other change. The typing and the
   * list are the shared autocomplete's.
   */
  public readonly searchable = input(false);

  /** The searchable field's text. */
  public readonly search = new FormControl<string>('');

  private readonly searchText = signal('');

  /** An item's label, from `displayTemplate`. */
  public readonly label = (item: T): string => {
    const label = item ? this.getDataItemValue(item, this.displayTemplate()) : undefined;
    return label === undefined || label === null ? '' : String(label);
  };

  /** The item whose value is the current value. */
  private readonly chosen = computed(() =>
    (this.data() ?? []).find((item) => this.getDataItemValue(item, this.valueTemplate()) === this._value())
  );

  /**
   * The options the searchable list shows: every one while the text is empty or still the chosen item's label, so it
   * works as a drop-down too, otherwise those whose label contains the text.
   */
  public readonly matches = computed(() => {
    const items = this.data() ?? [];
    const text = this.searchText().trim().toLowerCase();
    const chosen = this.chosen();

    if (!text || (chosen && text === this.label(chosen).toLowerCase())) {
      return items;
    }

    return items.filter((item) => this.label(item).toLowerCase().includes(text));
  });

  constructor() {
    this.search.valueChanges.subscribe((text) => this.searchText.set(text ?? ''));

    // The text shows the chosen item's label, including a value written by the form before the options arrive.
    effect(() => this.showLabel(this.chosen()));

    effect(() => (this.disabled() ? this.search.disable({ emitEvent: false }) : this.search.enable({ emitEvent: false })));
  }

  /** Chooses an item from the searchable list. */
  public choose(item: T) {
    this.value = this.getDataItemValue(item, this.valueTemplate()) as T | string;
    this.changeEvent();
  }

  /**
   * When focus leaves the searchable field: text that is exactly an option's label chooses it, empty text clears the
   * value, and anything else is put back to the chosen item's label, so the field never shows text it has not chosen.
   */
  public leave(event: FocusEvent) {
    const next = event.relatedTarget as Node | null;

    if (next && this.host.nativeElement.contains(next)) {
      return;
    }

    const text = (this.search.value ?? '').trim().toLowerCase();
    const exact = text ? (this.data() ?? []).find((item) => this.label(item).toLowerCase() === text) : undefined;

    if (exact && exact !== this.chosen()) {
      this.choose(exact);
    } else if (!text && this.value !== undefined) {
      this.value = undefined;
      this.changeEvent();
    } else {
      this.showLabel(this.chosen());
    }
  }

  private showLabel(item: T | undefined) {
    const label = item ? this.label(item) : '';

    if (this.search.value !== label) {
      // Without an event, so the autocomplete does not open its list for text the user did not type.
      this.search.setValue(label, { emitEvent: false });
      this.searchText.set(label);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  private _onChange = (value: T | string) => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private _onTouched = () => {};

  /**
   * Responsible for emitting the model changed event to the parent component.
   */
  public changeEvent() {
    this.changed.emit(this.value);
  }

  /**
   * Calls a utility function that evaluates the template against the iterated data item.
   *
   * If no value template is provided, return will be the object reference.
   */
  public getDataItemValue<U extends object>(iterated: U, template?: string): U | object {
    if (template !== undefined) {
      return getPropertyValue<U>(iterated, template);
    } else {
      return iterated;
    }
  }

  public writeValue(value: T | string) {
    this.value = value;
  }

  public registerOnChange(fn) {
    this._onChange = fn;
  }

  public registerOnTouched(fn) {
    this._onTouched = fn;
  }

  public setDisabledState(disabled: boolean) {
    this.disabled.set(disabled);
  }
}
