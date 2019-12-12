import { Component } from '@angular/core';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

import { RouterHistoryService } from '@tamu-gisc/common/ngx/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public analytics: Angulartics2GoogleAnalytics, private history: RouterHistoryService) {
    analytics.startTracking();
  }
}
