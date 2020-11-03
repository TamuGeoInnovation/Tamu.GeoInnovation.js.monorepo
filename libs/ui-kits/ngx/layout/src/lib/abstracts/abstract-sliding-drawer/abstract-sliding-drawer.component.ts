import { Component, Input, HostBinding, OnInit } from '@angular/core';

import { slide } from '../../animations/drawer';
import { AnimationOptions } from '@angular/animations';

@Component({
  selector: 'tamu-gisc-abstract-sliding-drawer-model',
  template: '',
  animations: [slide]
})
export class AbstractSlidingDrawerComponent implements OnInit {
  private _visible: boolean;

  /**
   * Describes sliding component visible state.
   *
   * Defaults to `true`
   */
  @Input()
  public set visible(value: string | boolean) {
    if (typeof value === 'string') {
      this._visible = value.toLowerCase() === 'true';
    } else {
      this._visible = value;
    }
  }

  public get visible() {
    return this._visible;
  }

  /**
   * Describes the left or right adjustment (depending on positioning) applied
   * to the animated transformation.
   *
   * Defaults to `0`
   */
  @Input()
  public offset = '0';

  /**
   * Describes the width applied to the sliding component.
   *
   * Defaults to `22.5rem`;
   */
  @Input()
  public width = '22.5rem';

  /**
   * Describes the positioning of the sliding component.
   *
   * Defaults to `left`
   */
  @Input()
  public position: 'left' | 'right' = 'left';

  /**
   * Describes the host CSS layout position as relative
   * or absolute
   */
  @Input()
  public layout: 'absolute' | 'relative' | 'fixed' = 'absolute';

  private _params: Partial<AnimationOptions>;

  /**
   * Binds the animation `@slide` to the host, triggered by the `visible` property
   * and using the `width` and `offset` properties as variables for animation parameters.
   */
  @HostBinding('@slide')
  private get toggleDrawer() {
    return {
      value: this.visible,
      ...this._params
    };
  }

  /**
   * Binds the host with the the input width as the width.
   */
  @HostBinding('style.width')
  private get _width() {
    return this.width;
  }

  /**
   * Binds the host with the value of `position`, representing the location of the sidebar
   * on the view.
   */
  @HostBinding('class')
  private get _position() {
    return this.position;
  }

  public ngOnInit() {
    this._params = {
      params: {
        xLimit:
          this.position === 'left'
            ? `-${this._removeUnits(this.width) + this._removeUnits(this.offset)}${this._getUnits(this.width)}`
            : `${this._removeUnits(this.width) + this._removeUnits(this.offset)}${this._getUnits(this.width)}`
      }
    };
  }

  /**
   * Toggles (on/off) drawer visibility.
   */
  public toggleVisibility() {
    this.visible = !this.visible;
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
