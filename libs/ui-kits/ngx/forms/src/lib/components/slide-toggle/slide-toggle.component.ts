import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChildren, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Subject, delay, map, shareReplay } from 'rxjs';

import { RadioGroupComponent } from '../radio-group/radio-group.component';

@Component({
  selector: 'tamu-gisc-slide-toggle',
  templateUrl: './slide-toggle.component.html',
  styleUrls: ['./slide-toggle.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SlideToggleComponent),
      multi: true
    }
  ]
})
export class SlideToggleComponent<Option extends object, Value>
  extends RadioGroupComponent<Option, Value>
  implements OnInit, AfterViewInit
{
  @ViewChildren('toggleOption')
  public toggleOptions: QueryList<ElementRef>;

  public activeOptionElement$: Subject<ElementRef | undefined> = new Subject<ElementRef | undefined>();
  public activeDimensions$: Observable<{ width: number; translate: number }>;

  public ngOnInit(): void {
    this.activeDimensions$ = this.activeOptionElement$.pipe(
      // Wait for the next tick to ensure that the element has been rendered and avoid ExpressionChangedAfterItHasBeenCheckedError
      delay(0),
      map((option) => {
        if (!option) {
          return { width: 0, translate: 0 };
        }
        const width = option.nativeElement.offsetWidth;
        const translate = option.nativeElement.offsetLeft;

        return { width, translate };
      }),
      shareReplay(1)
    );
  }

  public ngAfterViewInit(): void {
    this._findActiveElement(this._value);
  }

  public override onInitialValue(v: Value): void {
    this._findActiveElement(v);
  }

  public override evaluateSetValue(option: Option): Value | undefined {
    const t = super.evaluateSetValue(option);

    this._findActiveElement(t);
    
    return t;
  }

  private _findActiveElement(plainValue: Value | undefined) {
    if (plainValue !== null && plainValue !== undefined && this.toggleOptions) {
      const active = this.toggleOptions.find((option) => {
        return option.nativeElement.attributes['attr-value'].value === plainValue;
      });

      this.activeOptionElement$.next(active);
    }
  }
}
