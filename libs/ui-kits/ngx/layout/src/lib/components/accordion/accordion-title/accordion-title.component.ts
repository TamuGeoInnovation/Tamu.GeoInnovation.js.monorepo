import { Component, OnInit, Output, EventEmitter, HostListener, Input } from '@angular/core';
import { IAccordionModel } from '../accordion.component';

@Component({
  selector: 'tamu-gisc-accordion-title',
  templateUrl: './accordion-title.component.html',
  styleUrls: ['./accordion-title.component.scss']
})
export class AccordionTitleComponent implements OnInit {
  @Output()
  public toggle: EventEmitter<boolean> = new EventEmitter();

  @Input()
  public model: IAccordionModel;

  @HostListener('click', ['$event'])
  private _onClick() {
    this.toggle.emit();
  }

  constructor() {}

  public ngOnInit() {}
}
