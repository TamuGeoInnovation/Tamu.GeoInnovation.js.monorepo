import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent {
  @ViewChild('checkboxInput', { static: true }) public ref: ElementRef;

  /**
   * Determines the checked state of the checkbox ref element. Dumb component state.
   *
   * Defaults to `false`.
   */
  @Input()
  public checked = false;

  /**
   * Determines the interaction state of the component, preventing or allowing user input.
   * `true` disables inputs and changes style to reflect.
   *
   * Defaults to `false`.
   */
  @Input()
  public disabled = false;

  /**
   * Populates the aria-label attribute property.
   *
   * Defaults to "Checkbox input".
   */
  @Input()
  public ariaLabel = 'Checkbox input';

  /**
   * Populates the checkbox label property.
   *
   * Defaults to "Checkbox".
   */
  @Input()
  public label = 'Checkbox';

  @Input()
  public description = '';

  /**
   * Populates the form name properties on the label and input elements.
   *
   * Defaults to "checkbox".
   */
  @Input()
  public name = 'checkbox';

  /**
   * Output event emitter, used to bubble up the event value to the parent component.
   */
  @Output()
  public changed: EventEmitter<boolean> = new EventEmitter();

  constructor() {}

  /**
   * Mouse event handler, emitting the raw checked value of the reference checkbox
   *
   * @memberof CheckboxComponent
   */
  public handleMouseEvent(): void {
    this.changed.emit(this.ref.nativeElement.checked);
  }

  /**
   * Keyboard event handler, emitting the inverse value of the reference checkbox due
   * to the fact that keyboard events do not interact directly with the input box.
   *
   * @memberof CheckboxComponent
   */
  public handleKeyboardEvent(): void {
    this.changed.emit(!this.ref.nativeElement.checked);
  }
}
