import { Component, ElementRef, Input, OnInit, QueryList, ViewChildren, forwardRef } from '@angular/core';
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
  @Input()
  public override set value(v) {
    this._value = v;
    this._findActiveElement(v);
  }

  public override get value() {
    return this._value;
  }

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

  public override writeValue = (v) => {
    if (this.toggleOptions !== undefined) {
      this._findActiveElement(v);
    }

    this.value = v;
  };

  private _findActiveElement(plainValue: Value) {
    if (plainValue !== null) {
      const active = this.toggleOptions.find((option) => {
        return option.nativeElement.attributes['attr-value'].value === plainValue;
      });

      this.activeOptionElement$.next(active);
    }
  }
}

