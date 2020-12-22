import { Component, ContentChildren, AfterContentInit, QueryList, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { from, Subject } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';

import { AbstractSlidingDrawerComponent, slide } from '@tamu-gisc/ui-kits/ngx/layout';

import { SidebarTabComponent } from '../tab/tab.component';

@Component({
  selector: 'tamu-gisc-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [slide]
})
export class SidebarComponent extends AbstractSlidingDrawerComponent implements AfterContentInit, OnDestroy {
  public currentView: string;

  private _$destroy: Subject<null> = new Subject();

  @ContentChildren(SidebarTabComponent, { descendants: true })
  public tabs: QueryList<SidebarTabComponent>;

  constructor(private router: Router, private route: ActivatedRoute) {
    // Call the Abstract component constructor
    super();
    // Set the current view based on the router url on component instantiation
    this.currentView = this._updateCurrentView();
  }

  public ngAfterContentInit() {
    from(this.tabs.toArray())
      .pipe(
        takeUntil(this._$destroy),
        mergeMap((e) => {
          return e.$clicked;
        })
      )
      .subscribe((event) => {
        if (event && event.native && event.native.route !== undefined) {
          this.routeHandler(event.native.route);
        }
      });
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }

  private _updateCurrentView(): string {
    return this.router.url.substring(1, this.router.url.length);
  }

  /**
   * Navigates to sidebar nested routes, which renders different components and allows url history
   */
  public routeHandler(viewName: string): void {
    // Update the current view state whenever the route handler is called.
    this._updateCurrentView();

    // If selected view name is the same, hide the sidebar
    if (viewName === this.currentView) {
      this.toggleVisibility();
    } else {
      // If selected view name is different than current, show sidebar (in case it's hidden), store the selected view name as the current, and navigate to that route
      this.visible = true;
      this.currentView = viewName;

      this.router.navigate([`./${viewName}`], { relativeTo: this.route });
    }
  }
}
