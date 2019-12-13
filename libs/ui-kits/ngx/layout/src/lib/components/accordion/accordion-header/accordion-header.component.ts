import { Component, OnInit, Output, EventEmitter, HostListener, Input } from '@angular/core';
import { IAccordionModel } from '../accordion.component';

@Component({
  selector: 'tamu-gisc-accordion-header',
  templateUrl: './accordion-header.component.html',
  styleUrls: ['./accordion-header.component.scss']
})
export class AccordionHeaderComponent implements OnInit {
  @Output()
  public toggle: EventEmitter<boolean> = new EventEmitter();

  @Input()
  public model: IAccordionModel = {
    animate: false,
    expanded: false,
    resize: false
  };

  @HostListener('click', ['$event'])
  private _onClick() {
    this.toggle.emit();
  }

  constructor() {}

  public ngOnInit() {}
}
