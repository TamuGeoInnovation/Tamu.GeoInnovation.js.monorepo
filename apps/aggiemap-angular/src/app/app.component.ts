import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Angulartics2GoogleGlobalSiteTag } from 'angulartics2';

import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { LastMapService } from '@tamu-gisc/aggiemap/ngx/discover';

@Component({
  selector: 'tamu-gisc-aggiemap-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    public analytics: Angulartics2GoogleGlobalSiteTag,
    private readonly vcr: ViewContainerRef,
    private readonly ms: ModalService,
    // Injected only so it exists from startup. It is `providedIn: 'root'`, which is lazy: without
    // this it would first be constructed on a discover page, by which time the map navigation it
    // needs to observe has already happened and there would be nothing to go back to.
    private readonly lastMap: LastMapService
  ) {
    analytics.startTracking();
  }

  public ngOnInit(): void {
    this.ms.registerGlobalViewRef(this.vcr);
  }
}
