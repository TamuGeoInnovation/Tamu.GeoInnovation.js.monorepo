import { Component, OnInit, Input, HostListener } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Component({
  selector: 'tamu-gisc-sidebar-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class SidebarTabComponent implements OnInit {
  @Input()
  public material_icon: 'menu';

  @Input()
  public title: 'Tab';

  @Input()
  public description: 'Sidebar tab';

  private _$clicked: Subject<TabHostClick> = new Subject();
  public $clicked: Observable<TabHostClick> = this._$clicked.asObservable();

  @HostListener('click', ['$event'])
  private clicked(event: MouseEvent) {
    this._$clicked.next({ event: event, native: this });
  }

  constructor() {}

  public ngOnInit() {}
}

export interface TabHostClick {
  native: SidebarTabComponent;
  event: MouseEvent;
}
