import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ContentChild,
  TemplateRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { AutocompleteOptionTemplateDirective } from './directives/autocomplete-option-template.directive';

@Component({
  selector: 'tamu-gisc-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutocompleteComponent<T> implements OnInit, OnDestroy {
  /**
   * Controls whether results are visible. Kept separate so the selected text can remain in the input while closing the list.
   */
  public showResults = false;

  private _suppressShow = false;
  private _subs$: Subscription = new Subscription();

  /** If true, focusing the input will show the results even when the input is empty. */
  @Input()
  public showOnFocus = false;

  /**
   * Form control to bind the input value
   */
  @Input()
  public control: FormControl;

  /**
   * Options can be provided as an array or observable of items
   */
  @Input()
  public options: Array<T> | Observable<Array<T>> = [];

  @Input()
  public placeholder = 'Start typing to search...';

  @Output()
  public optionSelected = new EventEmitter<T>();

  /**
   * Optional user-provided template for rendering each option
   *
   * Usage:
   *
   * ```html
   * <tamu-gisc-autocomplete [control]="ctrl" [options]="items" (optionSelected)="onSelect($event)">
   *   <ng-template tamuGiscAutocompleteOption let-item>
   *     <div class="my-custom-item">{{ item.name }} — {{ item.id }}</div>
   *   </ng-template>
   * </tamu-gisc-autocomplete>
   * ```
   * If no template is provided the component will fall back to `displayWith(item)`.
   */
  @ContentChild(AutocompleteOptionTemplateDirective, { read: TemplateRef, static: false })
  public optionTemplate: TemplateRef<{ $implicit: T }> | null = null;

  /**
   * Map function to render option label (optional)
   */
  @Input()
  public displayWith: (item: T) => string = (i) => {
    if (!i) {
      return '';
    }
    const maybe = i as unknown as { name?: string };
    return maybe && maybe.name ? maybe.name : String(i);
  };

  public getOptions(): Observable<Array<T>> {
    return this.options instanceof Observable ? this.options : of(this.options as Array<T>);
  }

  public onSelect(option: T) {
    // Update the bound control text so selection reflects in the input, but suppress
    // the normal show-results toggle that runs on valueChanges.
    try {
      if (this.control) {
        this._suppressShow = true;
        this.control.setValue(this.displayWith(option));
      }
    } catch (e) {
      // ignore if control is not set or not writable
    }

    // Hide results after selecting
    this.showResults = false;

    this.optionSelected.emit(option);
  }

  public onResultsKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.showResults = false;
      event.stopPropagation();
      event.preventDefault();
    }
  }

  public onInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      // Only allow selection if there are options and the input has meaningful content
      const value = this.control?.value?.trim();
      if (!value) {
        // Prevent selection if input is empty or only whitespace
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }
  }

  public ngOnInit(): void {
    if (this.control && this.control.valueChanges) {
      const sub = this.control.valueChanges.subscribe((v) => {
        if (this._suppressShow) {
          // skip one event triggered by programmatic selection
          this._suppressShow = false;
          return;
        }

        // show results whenever the control has a value
        this.showResults = !!v;
      });

      this._subs$.add(sub);
    }
  }

  public ngOnDestroy(): void {
    this._subs$.unsubscribe();
  }

  public onContainerBlur(event: FocusEvent, container: HTMLElement) {
    // If the newly focused element is outside of the autocomplete container, close results
    const related = event.relatedTarget as HTMLElement | null;
    if (!related || !container.contains(related)) {
      this.showResults = false;
    }
  }

  public onContainerFocus(event: FocusEvent, container: HTMLElement) {
    // When focus enters the container, decide whether to show results.
    // If showOnFocus is true, show results even if control value is empty.
    const target = event.target as HTMLElement | null;
    if (!target || !container.contains(target)) {
      return;
    }

    if (this.showOnFocus) {
      this.showResults = true;
      return;
    }

    // Otherwise, show results only if there is a control value.
    if (this.control) {
      const v = this.control.value;
      this.showResults = !!v;
    }
  }
}
