import { Component, ViewContainerRef, ChangeDetectionStrategy, inject } from '@angular/core';

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
  private readonly an = inject(Angulartics2GoogleAnalytics);
  private readonly viewRef = inject(ViewContainerRef);
  private readonly ms = inject(ModalService);

  constructor() {
    this.an.startTracking();
    this.ms.registerGlobalViewRef(this.viewRef);
  }
}
