import { Component, HostBinding, input, output } from '@angular/core';

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
  public readonly type = input<'button' | 'reset' | 'submit'>('button');

  /**
   * Button display text.
   */
  public readonly value = input('Button');

  /**
   * Templating style.
   *
   * `relaxed` will stretch the button component to take the space available.
   *
   * `snug` will take only its minimum box-content space.
   */
  public readonly fit = input<'snug' | 'relaxed'>('relaxed');

  /**
   * Sets the visual style of the button.
   */
  public readonly look = input<'default' | 'secondary' | 'tertiary' | 'success' | 'danger' | 'warning'>(undefined);

  /**
   * Event emitted on inner button trigger.
   *
   * Not required for `reset` or `submit` types.
   */
  // Emitted with no value; it was declared as boolean but has never carried one.
  public readonly go = output<void>();

  /**
   * Describes the components active state in a form, or otherwise.
   */
  public readonly disabled = input(false);

  /**
   * Attaches class on host used to style the component appropriately.
   */
  @HostBinding('class.snug')
  private get _fitSnug() {
    return this.fit() === 'snug';
  }

  @HostBinding('class.relaxed')
  private get _fitRelaxed() {
    return this.fit() === 'relaxed';
  }

  /**
   * Attaches button state class on the host to style the component appropriately.
   */
  @HostBinding('class.disabled')
  private get _disabled() {
    return this.disabled();
  }

  @HostBinding('class.secondary')
  private get _styleSecondary() {
    return this.look() === 'secondary';
  }

  @HostBinding('class.tertiary')
  private get _styleTertiary() {
    return this.look() === 'tertiary';
  }

  @HostBinding('class.success')
  private get _styleSuccess() {
    return this.look() === 'success';
  }

  @HostBinding('class.danger')
  private get _styleDanger() {
    return this.look() === 'danger';
  }

  @HostBinding('class.warning')
  private get _styleWarning() {
    return this.look() === 'warning';
  }
}
