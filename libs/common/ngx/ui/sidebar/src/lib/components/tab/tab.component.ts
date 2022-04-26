import { Component, Input, HostListener } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'tamu-gisc-sidebar-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class SidebarTabComponent {
  /**
   * Valid material design icon name.
   *
   * It is a used to render the icon inside the tab item.
   */
  @Input()
  public material_icon = 'menu';

  /**
   * Metadata label that is used as the title and other aria-tags.
   */
  @Input()
  public title = 'Tab';

  /**
  //  * Metadata label that is used in aria-tags for accessibility purposes.
   */
  @Input()
  public description = 'Sidebar tab';

  /**
   * Optional: A configured application route name relative to the base route in which
   * the parent sidebar is rendered in.
   *
   * For example:
   *
   * - '' => Will navigate to the base route
   * - 'trip' => Will navigate to the trip route
   *
   * It is assumed that when using this property, a router-outlet exists as a ContentChild
   * within the sidebar content container in which content will be rendered based on application
   * routes.
   */
  @Input()
  public route: string = undefined;

  private _$clicked: Subject<TabHostClick> = new Subject();
  public $clicked: Observable<TabHostClick> = this._$clicked.asObservable();

  @HostListener('click', ['$event'])
  private clicked(event: MouseEvent) {
    this._$clicked.next({ event: event, native: this });
  }
}

export interface TabHostClick {
  native: SidebarTabComponent;
  event: MouseEvent;
}
