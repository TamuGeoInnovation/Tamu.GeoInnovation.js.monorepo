import { Component, Input, Output, EventEmitter } from '@angular/core';
import { getPropertyValue } from '@tamu-gisc/common/utils/object';

@Component({
  selector: 'gisc-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent {
  /**
   * Functions as the intial/default or state value of the select element.
   *
   * If no `model` is provided from the parent, the placeholder is automatically selected.
   *
   * @type {*}
   * @memberof SelectComponent
   */
  @Input()
  public model: any;

  /**
   * Iterable data collection that will be used to generate the dropdown options.
   *
   * @type {any[]}
   * @memberof SelectComponent
   */
  @Input()
  public data: any[];

  /**
   * Dot-notation string representing the evaluated property used in the display of the option element.
   *
   * @type {string}
   * @memberof SelectComponent
   */
  @Input()
  public displayTemplate: string;

  /**
   * Dot-notation string representing the evaluated property used in the option data model.
   *
   * @type {string}
   * @memberof SelectComponent
   */
  @Input()
  public valueTemplate: string;

  /**
   * Custom string used as the intial/undefined default option.
   *
   * @type {string}
   * @memberof SelectComponent
   */
  @Input()
  public placeholder?: string;

  /**
   * Determines interactivity availability.
   *
   * Default to `failse`;
   *
   * @type {boolean}
   * @memberof SelectComponent
   */
  @Input()
  public disabled = false;

  /**
   * Event emitted when the value of the select input element is changed.
   *
   * @type {EventEmitter<any>}
   * @memberof SelectComponent
   */
  @Output()
  public changed: EventEmitter<any> = new EventEmitter();

  constructor() {}

  /**
   * Responsible for emitting the model changed event to the parent component.
   *
   * @param {Event} event
   * @memberof SelectComponent
   */
  public changeEvent(event: Event) {
    this.changed.next(this.model);
  }

  /**
   * Calls a utility function that evaluates the template against the iterated data item.
   *
   * @param {*} iterated
   * @param {string} template
   * @returns
   * @memberof SelectComponent
   */
  public getDataItemValue(iterated: any, template: string) {
    return getPropertyValue(iterated, template);
  }
}
