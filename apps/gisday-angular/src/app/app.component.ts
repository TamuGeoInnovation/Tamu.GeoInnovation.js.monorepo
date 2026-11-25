import { Component, ViewContainerRef, inject } from '@angular/core';

import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { RouterOutlet } from '@angular/router';
import { NotificationContainerComponent } from '@tamu-gisc/common/ngx/ui/notification';

import { GisdayAnalytics } from './analytics';

@Component({
  selector: 'tamu-gisc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, NotificationContainerComponent]
})
export class AppComponent {
  private readonly an = inject(GisdayAnalytics);
  private readonly viewRef = inject(ViewContainerRef);
  private readonly ms = inject(ModalService);

  constructor() {
    this.an.startTracking();
    this.ms.registerGlobalViewRef(this.viewRef);
  }
}
