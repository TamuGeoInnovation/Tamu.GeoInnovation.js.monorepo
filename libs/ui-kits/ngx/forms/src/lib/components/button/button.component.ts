import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';

@Component({
  selector: 'tamu-gisc-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  /**
   * Button action type.
   *
   * `button` does not perform a default action and requires listening for the `go` event
   * to perform a custom action on the parent component.
   */
  @Input()
  public type: 'button' | 'reset' | 'submit' = 'button';

  /**
   * Button display text.
   */
  @Input()
  public value = 'Button';

  /**
   * Templating style.
   *
   * `relaxed` will stretch the button component to take the space available.
   *
   * `snug` will take only its minimum box-content space.
   */
  @Input()
  public fit: 'snug' | 'relaxed' = 'snug';

  /**
   * Event emitted on inner button trigger.
   *
   * Not required for `reset` or `submit` types.
   */
  @Output()
  public go: EventEmitter<boolean> = new EventEmitter();

  /**
   * Describes the components active state in a form, or otherwise.
   */
  @Input()
  public disabled = false;

  /**
   * Attaches class on host used to style the component appropriately.
   */
  @HostBinding('class.snug')
  private get _fit() {
    return this.fit === 'snug';
  }

  /**
   * Attaches button state class on the host to style the component appropriately.
   */
  @HostBinding('class.disabled')
  private get _disabled() {
    return this.disabled;
  }

  constructor() {}
}
