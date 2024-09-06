import {
  Component,
  Input,
  forwardRef,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef
} from '@angular/core';

import { AbstractValueAccessorFormComponent } from '../../models/abstract-value-accessor-form/abstract-value-accessor-form.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'tamu-gisc-range',
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RangeComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RangeComponent extends AbstractValueAccessorFormComponent<number> implements OnChanges {
  /**
   * Use the host `formControlName` directive as the input form name used to identify input fields and label ownership.
   *
   * Defaults to `default`
   */
  @Input()
  public formControlName = 'default';

  @Input()
  public label: string;

  /**
   * Pins the minimum value of the slider.
   */
  @Input()
  public min = 0;

  /**
   * Pins the maximum value of the slider.
   *
   * Will override the length of the `customDataMap` if provided.
   */
  @Input()
  public max = 9;

  /**
   * The granularity of the slider. The value must be greater than zero, and should divide the difference between `max` and `min` evenly.
   */
  @Input()
  public step = 1;

  /**
   *  If true, the slider will display a marker for each step.
   *
   */
  @Input()
  public markedSteps: boolean;

  /**
   * Format the value displayed in the label.
   *
   * Defaults to `none`
   */
  @Input()
  public limitFormat: 'currency' | 'number' | 'none' = 'none';

  @Input()
  public showTooltip = false;

  /**
   * When provided, each native step in the slider will be mapped to a custom
   * value and display string. This is useful when the slider is used to select
   * from a set of discrete values and the values are either not numeric or do not
   * represent the display values.
   *
   * For example: a slider with fixed steps from 0 through 9 (10 steps), where each step instead is mapped to the following values:
   *
   *  - 0 => 0
   *  - 1 => 10
   *  - 2 => 100
   *  - 3 => 1,000
   *  - 4 => 10,0000
   *  - 5 => 100,000
   *  - 6 => 250,000
   *  - 7 => 500,000
   *  - 8 => 1,000,000
   *  - 9 => 2,500,000
   *
   * Data map length will be used to set the max value of the slider.
   *
   * When using a data map, the control value will be the indexed value of the data map.
   * Developers have the responsibility of extracting the mapped value from the input map.
   */
  @Input()
  public customDataMap: RangeInputDataMap;

  @ViewChild('rangeElement', { static: true })
  public input: ElementRef;

  @ViewChild('liveValue', { static: true })
  public liveValue: ElementRef;

  public minDisplay: string | number;
  public maxDisplay: string | number;

  public override get value(): number {
    return this.getInternalValue();
  }

  public override set value(value: number) {
    this.setInternalValue(value);

    if (this.showTooltip) {
      if (this.customDataMap) {
        this.liveValue.nativeElement.innerText = this.customDataMap[value].display;
      } else {
        this.liveValue.nativeElement.innerText = value;
      }

      // The slider thumb offsets from 0% to 100% of the thumb width from the left side of the slider.
      // This causes the tooltip to either be offset too far to the left at 0% range select or too far
      // to the right at 100% range select.
      //
      // 8px is the approximate half-width of the slider thumb. This is used to offset the tooltip anchor
      // point to the center of the thumb.

      // On the left, half tooltip width - half width of the thumb
      // On the right, half tooltip width + half width of the thumb.
      const thumbOffset = this.offsetDirection * this.offsetRatio * 8;

      // To position the tooltip in the center of the slider thumb, we need to know the width of the tooltip.
      // Half of the tooltip width is the anchor point relative to the thumb
      const halfTooltipWidth = this.liveValue.nativeElement.offsetWidth / 2;

      // thumbOffset can be negative or positive which is why it makes sense to add the two values together.
      const tooltipOffset = halfTooltipWidth + thumbOffset;

      // Set the tooltip position to the center of the slider.
      // This is based on the fact that the slider is broken down into even steps from 0 to max
      // and the tooltip is positioned as a percentage of the slider width minus half the width of the tooltip.
      this.liveValue.nativeElement.style.left = `calc(${(this.value / this.max) * 100}% - ${tooltipOffset}px)`;
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.customDataMap && changes.customDataMap.currentValue !== undefined) {
      // Simplify the template by having mapped and vanilla limits referenced by the same property.
      // This might need to be moved to OnChanges because the data source can change at any point in time
      // and the limits will not update.
      if (this.customDataMap) {
        this.max = this.customDataMap.length - 1;

        this.minDisplay = this.customDataMap[0].display;
        this.maxDisplay = this.customDataMap[this.customDataMap.length - 1].display;

        // When the data map value changes, the maximum value of the slider can potentially be higher than the size
        // of the new data map. This will cause the slider to be out of bounds. To prevent this, we need to
        // set the value to the maximum value of the data map.
        if (this.value > this.max) {
          this.value = this.max;
        }
      } else {
        this.minDisplay = this.min;
        this.maxDisplay = this.max;
      }
    }
  }

  /**
   * Offsets are different depending on the current point in the slider (before or after the midpoint).
   *
   * Before the midpoint, the offset is negative. After the midpoint, the offset is positive.
   */
  private get offsetDirection(): number {
    const position = this.value / this.max;

    if (position === 0.5) {
      return 0;
    } else {
      return position > 0.5 ? 1 : -1;
    }
  }

  /**
   * The offset ratio is the percentage of the slider relative to the midpoint.
   *
   * At either end, the offset ratio is 1. At the midpoint, the offset ratio is 0.
   */
  private get offsetRatio(): number {
    if (this.offsetDirection === 0) {
      return 0;
    } else if (this.offsetDirection === 1) {
      return (this.value - this.max / 2) / (this.max / 2);
    } else {
      return (this.max / 2 - this.value) / (this.max / 2);
    }
  }
}

export type RangeInputDataMap = Array<RangeInputDataMapEntry>;

export interface RangeInputDataMapEntry {
  /**
   * The step value the display should be matched to
   */
  value: number;

  /**
   * The value mapped to the underlying step value
   */
  display: string;
}
