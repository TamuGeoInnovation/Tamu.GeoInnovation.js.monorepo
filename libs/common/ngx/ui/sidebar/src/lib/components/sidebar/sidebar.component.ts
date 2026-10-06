import { Component, ContentChildren, AfterContentInit, QueryList, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { from, Subject } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';

import { AbstractSlidingDrawerComponent, slide } from '@tamu-gisc/ui-kits/ngx/layout';

import { SidebarTabComponent } from '../tab/tab.component';

@Component({
  selector: 'tamu-gisc-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [slide],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class SidebarComponent extends AbstractSlidingDrawerComponent implements AfterContentInit, OnDestroy {
  public currentView: string;

  private _$destroy: Subject<null> = new Subject();

  @ContentChildren(SidebarTabComponent, { descendants: true })
  public tabs: QueryList<SidebarTabComponent>;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Call the Abstract component constructor
    super();
  }

  public ngAfterContentInit() {
    // Which tab the sidebar is already showing.
    //
    // Must be in the tabs' own vocabulary - '' for the default view, 'settings', 'trip' - because
    // `_toggleVisibility` compares against it. It used to be read from `router.url`, which gives the
    // whole path ('map/d'), so it never matched any tab: the first click always took the "a different
    // view was chosen" branch, set `visible = true` on an already visible panel, and only then
    // recorded the view. The panel did not move until the second click (#1249).
    this.currentView = this._currentTabRoute();

    from(this.tabs.toArray())
      .pipe(
        takeUntil(this._$destroy),
        mergeMap((e) => {
          return e.$clicked;
        })
      )
      .subscribe((event) => {
        if (event && event.native) {
          this._changeRoute(event.native.route);
          this._toggleVisibility(event.native.route);
        }
      });
  }

  public ngOnDestroy() {
    this._$destroy.next(undefined);
    this._$destroy.complete();
  }

  /**
   * The route of the tab currently showing, or `''` for the default view.
   *
   * Matched against the declared tabs rather than parsed out of the URL, so it cannot drift from what
   * the tabs actually use. A deep link to `/map/d/settings` resolves to `settings`; anything else,
   * including `/map/d`, resolves to the default view.
   */
  private _currentTabRoute(): string {
    const segments = this.router.url
      .split('?')[0]
      .split('/')
      .filter((segment) => segment.length > 0);
    const last = segments[segments.length - 1];

    const match = this.tabs.find((tab) => tab.route !== undefined && tab.route.length > 0 && tab.route === last);

    return match ? match.route : '';
  }

  /**
   * Navigates to sidebar nested routes, which renders different components and allows url history
   */
  private _changeRoute(viewName: string): void {
    // If selected view name is the same, hide the sidebar
    if (viewName !== undefined && viewName !== this.currentView) {
      this.router.navigate([`./${viewName}`], { relativeTo: this.route });
    }
  }

  private _toggleVisibility(viewName: string): void {
    // If selected view name is the same, hide the sidebar
    if (viewName === this.currentView || viewName === undefined) {
      this.toggleVisibility();
    } else {
      // If selected view name is different than current, show sidebar (in case it's hidden), store the selected view name as the current, and navigate to that route
      this.visible = true;
      this.currentView = viewName;
    }
  }
}
