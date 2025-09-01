import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ContentChild, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { AutocompleteOptionTemplateDirective } from './autocomplete-option-template.directive';

@Component({
  selector: 'tamu-gisc-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutocompleteComponent<T = unknown> {
  /**
   * Usage:
   * <tamu-gisc-autocomplete [control]="ctrl" [options]="items" (optionSelected)="onSelect($event)">
   *   <ng-template tamuGiscAutocompleteOption let-item>
   *     <div class="my-custom-item">{{ item.name }} — {{ item.id }}</div>
   *   </ng-template>
   * </tamu-gisc-autocomplete>
   * If no template is provided the component will fall back to `displayWith(item)`.
   */
  /** Optional user-provided template for rendering each option */
  @ContentChild(AutocompleteOptionTemplateDirective, { read: TemplateRef, static: false })
  public optionTemplate: TemplateRef<{ $implicit: T }> | null = null;

  /** Form control to bind the input value */
  @Input()
  public control: FormControl;

  /** Options can be provided as an array or observable of items */
  @Input()
  public options: Array<T> | Observable<Array<T>> = [];

  @Output()
  public optionSelected = new EventEmitter<T>();

  /** Map function to render option label (optional) */
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
    this.optionSelected.emit(option);
  }
}
