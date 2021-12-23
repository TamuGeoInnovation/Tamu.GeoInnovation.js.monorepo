import { Component } from '@angular/core';

import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

@Component({
  selector: 'tamu-gisc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public analytics: Angulartics2GoogleAnalytics) {
    analytics.startTracking();
  }
}
