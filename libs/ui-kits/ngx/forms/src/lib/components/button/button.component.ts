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
  public fit: 'snug' | 'relaxed' = 'relaxed';

  /**
   * Sets the visual style of the button.
   */
  @Input()
  public look: 'default' | 'secondary' | 'success' | 'danger' | 'warning';

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
  private get _fitSnug() {
    return this.fit === 'snug';
  }

  @HostBinding('class.relaxed')
  private get _fitRelaxed() {
    return this.fit === 'relaxed';
  }

  /**
   * Attaches button state class on the host to style the component appropriately.
   */
  @HostBinding('class.disabled')
  private get _disabled() {
    return this.disabled;
  }

  @HostBinding('class.secondary')
  private get _styleSecondary() {
    return this.look === 'secondary';
  }

  @HostBinding('class.success')
  private get _styleSuccess() {
    return this.look === 'success';
  }

  @HostBinding('class.danger')
  private get _styleDanger() {
    return this.look === 'danger';
  }

  @HostBinding('class.warning')
  private get _styleWarning() {
    return this.look === 'warning';
  }

  constructor() {}
}
