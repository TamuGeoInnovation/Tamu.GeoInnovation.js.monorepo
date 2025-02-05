import { Component } from '@angular/core';

import { Angulartics2GoogleGlobalSiteTag } from 'angulartics2';

@Component({
  selector: 'tamu-gisc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ts-football-angular';

  constructor(public analytics: Angulartics2GoogleGlobalSiteTag) {
    analytics.startTracking();
  }
}
