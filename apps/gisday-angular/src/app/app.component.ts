import { Component, ViewContainerRef, ChangeDetectionStrategy } from '@angular/core';

import { Angulartics2GoogleAnalytics } from 'angulartics2';

import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { RouterOutlet } from '@angular/router';
import { NotificationContainerComponent } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet, NotificationContainerComponent]
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
