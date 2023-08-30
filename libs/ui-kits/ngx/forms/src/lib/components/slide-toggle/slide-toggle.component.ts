import { Component, ElementRef, OnInit, QueryList, ViewChildren, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Subject, map, shareReplay } from 'rxjs';

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
  implements OnInit
{
  @ViewChildren('toggleOption')
  public toggleOptions: QueryList<ElementRef>;

  public activeOptionElement$: Subject<ElementRef> = new Subject<ElementRef>();
  public activeDimensions$: Observable<{ width: number; translate: number }>;

  public ngOnInit(): void {
    this.activeDimensions$ = this.activeOptionElement$.pipe(
      map((option) => {
        const width = option.nativeElement.offsetWidth;
        const translate = option.nativeElement.offsetLeft;

        return { width, translate };
      }),
      shareReplay()
    );
  }

  public override onInitialValue(v: Value): void {
    this._findActiveElement(v);
  }

  public override evaluateSetValue(option: Option): void {
    const t = super.evaluateSetValue(option);

    this._findActiveElement(t);
  }

  private _findActiveElement(plainValue: Value) {
    if (plainValue !== null) {
      const active = this.toggleOptions.find((option) => {
        return option.nativeElement.attributes['attr-value'].value === plainValue;
      });

      this.activeOptionElement$.next(active);
    }
  }
}

