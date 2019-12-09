import {
  Component,
  OnInit,
  Input,
  ElementRef,
  HostListener,
  ContentChild,
  AfterContentInit,
  OnDestroy
} from '@angular/core';
import { TooltipTriggerComponent } from '../tooltip-trigger/tooltip-trigger.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'tamu-gisc-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit, OnDestroy, AfterContentInit {
  @Input()
  public width: number;

  @Input()
  public height: number;

  @Input()
  public position: string;

  @Input()
  public isVisible = false;

  @ContentChild(TooltipTriggerComponent, { static: true })
  public trigger: TooltipTriggerComponent;

  private _$destroy: Subject<boolean> = new Subject();

  /**
   * Detects if interaction clicks are within the component
   *
   * @param {*} event
   * @memberof TooltipComponent
   */
  @HostListener('document:mousedown', ['$event'])
  public clickOutside(event) {
    if (this.isVisible && !this.elementRef.nativeElement.contains(event.target)) {
      this.isVisible = false;
    }
  }

  constructor(private elementRef: ElementRef) {}

  public ngOnInit() {}

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public ngAfterContentInit() {
    if (this.trigger) {
      this.trigger.triggerActivate.pipe(takeUntil(this._$destroy)).subscribe(() => {
        this.isVisible = !this.isVisible;
      });
    }
  }
}
