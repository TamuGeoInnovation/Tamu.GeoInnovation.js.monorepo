import {
  Directive,
  OnInit,
  ContentChild,
  Input,
  OnDestroy,
  HostBinding,
  TemplateRef,
  ViewContainerRef,
  ViewChild,
  AfterContentInit,
  ElementRef
} from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccordionHeaderDirective } from './accordion-header.directive';
import { AccordionContentDirective } from './accordion-content.directive';
import { AccordionService } from '../services/accordion.service';

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: '[giscAccordion]'
})
export class AccordionDirective implements OnInit, OnDestroy {
  @Input()
  public expanded = false;

  public controller: BehaviorSubject<boolean> = new BehaviorSubject(false);

  // @ViewChild(AccordionHeaderDirective, { static: true })
  // public header: AccordionHeaderDirective;

  // @ViewChild(AccordionContentDirective, { static: true })
  // public content: AccordionContentDirective;

  @HostBinding('class.accordion-expanded')
  private get _expanded() {
    return this.expanded;
  }

  @Input()
  public set giscAccordion(v) {
    this.viewContainer.createEmbeddedView(this.templateRef, {
      $implicit: this.expanded,
      controller: this.controller
    });
  }

  private _$destroy: Subject<boolean> = new Subject();

  constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) {}

  public ngOnInit() {
    this;
    debugger;
    // this.header.toggle.pipe(takeUntil(this._$destroy)).subscribe(() => {
    //   this.expanded = !this.expanded;

    //   this._setExpandedState();
    // });
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }

  // private _setExpandedState() {
  //   this.header.expanded = this.content.expanded = this.content.display = this.expanded;
  // }
}
