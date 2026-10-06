import { Component, OnDestroy, OnInit, ViewContainerRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Angulartics2GoogleGlobalSiteTag } from 'angulartics2';

import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { LastMapService } from '@tamu-gisc/aggiemap/ngx/discover';
import { campusOnNavigation, EventNotificationsService } from '@tamu-gisc/aggiemap/ngx/core';

@Component({
  selector: 'tamu-gisc-aggiemap-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  private _notifications: Subscription | undefined;

  constructor(
    public analytics: Angulartics2GoogleGlobalSiteTag,
    private readonly vcr: ViewContainerRef,
    private readonly ms: ModalService,
    // Injected only so it exists from startup. It is `providedIn: 'root'`, which is lazy: without
    // this it would first be constructed on a discover page, by which time the map navigation it
    // needs to observe has already happened and there would be nothing to go back to.
    private readonly lastMap: LastMapService,
    private readonly eventNotifications: EventNotificationsService,
    private readonly router: Router
  ) {
    analytics.startTracking();
  }

  public ngOnInit(): void {
    this.ms.registerGlobalViewRef(this.vcr);

    // Raised here, in the shell, rather than on the main map page, because the shell is what renders
    // the grouped notifications and every route is inside it - including the event maps, which are
    // lazy routes of this same application. Raising them on the main map page meant someone who
    // opened an event map by link was never told about the other events, and someone who dismissed
    // them on an event map had them raised again on returning to the main map. See #1246.
    //
    // On every navigation rather than once, because whose notifications belong here depends on which
    // map is showing: College Station's belong on the main map and the event, parking and operations
    // maps, and nowhere near a satellite campus or an embedded kiosk. The service skips anything
    // already raised or already dismissed during this page load, so navigating does not stack
    // duplicates. See #1265.
    this._notifications = campusOnNavigation(this.router).subscribe((campus) => {
      this.eventNotifications.checkAndTriggerEventNotifications(campus);
    });
  }

  public ngOnDestroy(): void {
    this._notifications?.unsubscribe();
  }
}
