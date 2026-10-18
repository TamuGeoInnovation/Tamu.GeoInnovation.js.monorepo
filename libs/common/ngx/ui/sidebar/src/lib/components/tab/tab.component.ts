import { Component, HostListener, input } from '@angular/core';
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
  public readonly material_icon = input('menu');

  /**
   * Metadata label that is used as the title and other aria-tags.
   */
  public readonly title = input('Tab');

  /**
  //  * Metadata label that is used in aria-tags for accessibility purposes.
   */
  public readonly description = input('Sidebar tab');

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
  public readonly route = input<string>(undefined);

  private _$clicked: Subject<TabHostClick> = new Subject();
  public $clicked: Observable<TabHostClick> = this._$clicked.asObservable();

  @HostListener('click', ['$event'])
  protected clicked(event: MouseEvent) {
    this._$clicked.next({ event: event, native: this });
  }
}

export interface TabHostClick {
  native: SidebarTabComponent;
  event: MouseEvent;
}
