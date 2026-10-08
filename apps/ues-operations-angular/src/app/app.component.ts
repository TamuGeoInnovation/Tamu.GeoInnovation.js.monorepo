import { Component, ChangeDetectionStrategy } from '@angular/core';

import { Angulartics2GoogleAnalytics } from 'angulartics2';
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
  constructor(public analytics: Angulartics2GoogleAnalytics) {
    analytics.startTracking();
  }
}
