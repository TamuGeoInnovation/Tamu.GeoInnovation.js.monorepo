import { Component, ElementRef, Input, ContentChild, AfterContentInit, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccordionTitleComponent } from './accordion-title/accordion-title.component';
import { AccordionContentComponent } from './accordion-content/accordion-content.component';

@Component({
  selector: 'tamu-gisc-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss']
})
export class AccordionComponent implements OnInit, AfterContentInit {
  /**
   * Input boolean from the parent component that serves as a collapse/expand toggle
   * for the accordion.
   *
   * @type {boolean}
   * @memberof AccordionDirective
   */
  @Input()
  public expanded = false;

  @Input()
  public resize = false;

  @Input()
  public animate = false;

  private _model: IAccordionModel;

  @ContentChild(AccordionTitleComponent, { static: true })
  private _title: AccordionTitleComponent;

  @ContentChild(AccordionContentComponent, { static: true })
  private _content: AccordionContentComponent;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(private el: ElementRef) {}

  public ngOnInit() {
    this._model = {
      expanded: this.expanded,
      resize: this.resize,
      animate: this.animate
    };
  }

  public ngAfterContentInit() {
    this._content.model = this._model;
    this._title.model = this._model;

    this._title.toggle.pipe(takeUntil(this._$destroy)).subscribe(() => {
      this._model.expanded = !this._model.expanded;
    });
  }
}

export interface IAccordionModel {
  expanded: boolean;

  /**
   * If `true`, detects accordion children content changes and fires off an accordion resize.
   *
   * Defaults to `false`.
   */
  resize: boolean;

  /**
   * Determines if the accordion animate when expanding or collapsing.
   *
   * Animation is not always ideal, especially when components are re-rendered on change
   * detection cycles which would cause the accordion to flash open or closed abruptly.
   */
  animate: boolean;
}
