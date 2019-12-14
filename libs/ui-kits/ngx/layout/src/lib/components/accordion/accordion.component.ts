import { Component, ElementRef, Input, ContentChild, AfterContentInit, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccordionHeaderComponent } from './accordion-header/accordion-header.component';
import { AccordionContentComponent } from './accordion-content/accordion-content.component';

import { AccordionService } from './services/accordion.service';

@Component({
  selector: 'tamu-gisc-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  providers: [AccordionService]
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

  @ContentChild(AccordionHeaderComponent, { static: true })
  private _title: AccordionHeaderComponent;

  @ContentChild(AccordionContentComponent, { static: true })
  private _content: AccordionContentComponent;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(private el: ElementRef, private comm: AccordionService) {}

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
