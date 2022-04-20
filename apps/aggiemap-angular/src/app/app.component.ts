import { Component } from '@angular/core';
import { Angulartics2GoogleAnalytics } from 'angulartics2';

@Component({
  selector: 'tamu-gisc-aggiemap-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public analytics: Angulartics2GoogleAnalytics) {
    analytics.startTracking();
  }
}
