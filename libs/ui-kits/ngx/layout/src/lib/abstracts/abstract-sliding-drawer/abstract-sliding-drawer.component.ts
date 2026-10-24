import { Component, HostBinding, OnInit, input, model } from '@angular/core';

@Component({
  selector: 'tamu-gisc-abstract-sliding-drawer-model',
  template: ''
})
export class AbstractSlidingDrawerComponent implements OnInit {
  /**
   * Describes sliding component visible state.
   *
   * Defaults to `true`
   *
   * A model rather than an input: the component toggles it itself. It used to accept the strings
   * 'true' and 'false' as well; no caller binds it at all.
   */
  public readonly visible = model(true);

  /**
   * Describes the left or right adjustment (depending on positioning) applied
   * to the animated transformation.
   *
   * Defaults to `0`
   */
  public readonly offset = input('0');

  /**
   * Describes the width applied to the sliding component.
   *
   * Defaults to `22.5rem`;
   */
  public readonly width = input('22.5rem');

  /**
   * Describes the positioning of the sliding component.
   *
   * Defaults to `left`
   */
  public readonly position = input<'left' | 'right'>('left');

  /**
   * Describes the host CSS layout position as relative
   * or absolute
   */
  public readonly layout = input<'absolute' | 'relative' | 'fixed'>('absolute');

  /** How far the drawer moves to hide: its width and offset, towards its own side. */
  private _xLimit = '0';

  /**
   * Slides the host out of view when `visible` is false, by its width and offset. Each drawer's stylesheet includes
   * `slide-transition` from libs/sass/motion, which animates it (#1218).
   */
  @HostBinding('style.transform')
  private get toggleDrawer() {
    return this.visible() ? 'none' : `translate(${this._xLimit})`;
  }

  /**
   * Binds the host with the the input width as the width.
   */
  @HostBinding('style.width')
  private get _width() {
    return this.width();
  }

  /**
   * Binds the host with the value of `position`, representing the location of the sidebar
   * on the view.
   */
  @HostBinding('class')
  private get _position() {
    return this.position();
  }

  public ngOnInit() {
    this._xLimit =
      this.position() === 'left'
        ? `-${this._removeUnits(this.width()) + this._removeUnits(this.offset())}${this._getUnits(this.width())}`
        : `${this._removeUnits(this.width()) + this._removeUnits(this.offset())}${this._getUnits(this.width())}`;
  }

  /**
   * Toggles (on/off) drawer visibility.
   */
  public toggleVisibility() {
    this.visible.set(!this.visible());
  }

  /**
   * Remove units from a CSS measurement.
   *
   * Example: `-20rem` => `-20`
   *
   */
  private _removeUnits(measurement: string): number {
    const split = measurement.match(/-?\d+/g);

    // Check if result is float or whole number.
    if (split.length > 1) {
      return parseFloat(split.join('.'));
    } else {
      return parseInt(split[0], 10);
    }
  }

  /**
   * Removes the quantitative portion of a css measurement.
   *
   * Example: `-20rem` => `rem`
   */
  private _getUnits(measurement: string): string {
    const unit = measurement.match(/[a-zA-Z]+/g).join('');

    return unit;
  }
}
