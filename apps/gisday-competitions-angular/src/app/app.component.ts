import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Angulartics2GoogleAnalytics } from 'angulartics2';

@Component({
  selector: 'tamu-gisc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class AppComponent {
  constructor(private analytics: Angulartics2GoogleAnalytics) {
    this.analytics.startTracking();
  }
}
