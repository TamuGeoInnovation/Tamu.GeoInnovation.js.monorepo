import { Component, Input } from '@angular/core';

@Component({
  selector: 'tamu-gisc-service-attribute-accordion',
  templateUrl: './service-attribute-accordion.component.html',
  styleUrls: ['./service-attribute-accordion.component.scss']
})
export class ServiceAttributeAccordionComponent {
  /**
   * Determines whether the accordion toggle controls are visible.
   *
   * In the future, this should be made so that this value is determined
   * automatically based on the content provided in the body `attr-body` slot.
   *
   * Running into some issues getting a templateRef to count the children nodes because
   * the template ref is bound to a structural directive which is not rendered until
   * the accordion body is rendered.
   *
   * Defaults to `true`.
   */
  @Input()
  public collapsable = true;
}
