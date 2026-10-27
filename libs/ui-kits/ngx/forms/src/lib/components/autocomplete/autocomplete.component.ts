import { Component, ChangeDetectionStrategy, TemplateRef, OnInit, OnDestroy, contentChild, input, output } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { AutocompleteOptionTemplateDirective } from './directives/autocomplete-option-template.directive';
import { TextboxComponent } from '../textbox/textbox.component';
import { KeyboardNavigationDirective } from '@tamu-gisc/ui-kits/ngx/interactions/keyboard';
import { NgTemplateOutlet, AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TextboxComponent, FormsModule, ReactiveFormsModule, KeyboardNavigationDirective, NgTemplateOutlet, AsyncPipe]
})
export class AutocompleteComponent<T> implements OnInit, OnDestroy {
  /**
   * Controls whether results are visible. Kept separate so the selected text can remain in the input while closing the list.
   */
  public showResults = false;

  private _suppressShow = false;
  private _subs$: Subscription = new Subscription();

  public readonly autofocus = input(false);

  /** If true, focusing the input will show the results even when the input is empty. */
  public readonly showOnFocus = input(false);

  /**
   * Form control to bind the input value
   */
  public readonly control = input<FormControl>(undefined);

  /**
   * Options can be provided as an array or observable of items
   */
  public readonly options = input<Array<T> | Observable<Array<T>>>([]);

  public readonly placeholder = input('Start typing to search...');

  public readonly optionSelected = output<T>();

  /**
   * Optional user-provided template for rendering each option
   *
   * Usage:
   *
   * ```html
   * <tamu-gisc-autocomplete [control]="ctrl" [options]="items" (optionSelected)="onSelect($event)">
   *   <ng-template tamuGiscAutocompleteOption let-item>
   *     <div class="my-custom-item">{{ item.name }} - {{ item.id }}</div>
   *   </ng-template>
   * </tamu-gisc-autocomplete>
   * ```
   * If no template is provided the component will fall back to `displayWith(item)`.
   */
  public readonly optionTemplate = contentChild<AutocompleteOptionTemplateDirective, TemplateRef<{ $implicit: T }>>(
    AutocompleteOptionTemplateDirective,
    { read: TemplateRef }
  );

  /**
   * Map function to render option label (optional)
   */
  public readonly displayWith = input<(item: T) => string>((i) => {
    if (!i) {
      return '';
    }
    const maybe = i as unknown as {
      name?: string;
    };
    return maybe && maybe.name ? maybe.name : String(i);
  });

  public getOptions(): Observable<Array<T>> {
    const options = this.options();
    return options instanceof Observable ? options : of(options as Array<T>);
  }

  public onSelect(option: T) {
    // Update the bound control text so selection reflects in the input, but suppress
    // the normal show-results toggle that runs on valueChanges.
    try {
      const control = this.control();
      if (control) {
        this._suppressShow = true;
        control.setValue(this.displayWith()(option));
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
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  }

  public ngOnInit(): void {
    const control = this.control();
    if (control && control.valueChanges) {
      const sub = control.valueChanges.subscribe((v) => {
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

    if (this.showOnFocus()) {
      this.showResults = true;
      return;
    }

    // Otherwise, show results only if there is a control value.
    const control = this.control();
    if (control) {
      const v = control.value;
      this.showResults = !!v;
    }
  }
}
