import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Angulartics2GoogleAnalytics } from 'angulartics2';

import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

@Component({
  selector: 'tamu-gisc-aggiemap-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    public analytics: Angulartics2GoogleAnalytics,
    private readonly vcr: ViewContainerRef,
    private readonly ms: ModalService
  ) {
    analytics.startTracking();
  }

  public ngOnInit(): void {
    this.ms.registerGlobalViewRef(this.vcr);
  }
}
