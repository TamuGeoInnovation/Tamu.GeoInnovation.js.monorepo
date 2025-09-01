import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'tamu-gisc-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutocompleteComponent<T = unknown> {
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
