import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
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
  private analytics = inject(Angulartics2GoogleAnalytics);

  constructor() {
    this.analytics.startTracking();
  }
}
