import { Component, ViewContainerRef } from '@angular/core';

import { Angulartics2GoogleAnalytics } from 'angulartics2';

import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

@Component({
  selector: 'tamu-gisc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private readonly an: Angulartics2GoogleAnalytics,
    private readonly viewRef: ViewContainerRef,
    private readonly ms: ModalService
  ) {
    this.an.startTracking();
    this.ms.registerGlobalViewRef(this.viewRef);
  }
}
