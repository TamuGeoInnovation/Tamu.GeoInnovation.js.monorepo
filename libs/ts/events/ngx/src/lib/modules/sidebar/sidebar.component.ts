import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { EventConfiguration } from '../../interfaces/special-event.interface';
import { EventSettingsService } from '../../services/settings/event-settings.service';

@Component({
  selector: 'tamu-gisc-movein-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false
})
export class MoveInOutSidebarComponent implements OnInit {
  public configuration: EventConfiguration | null;

  /** Development and localhost only; gates the Directions tab while routing is unpublished (#1003). */
  public isDev: Observable<boolean>;

  constructor(
    private readonly eventSettingsService: EventSettingsService,
    private readonly testing: TestingService
  ) {
    this.isDev = this.testing.get('isTesting');
  }

  public ngOnInit(): void {
    this.configuration = this.eventSettingsService.eventConfiguration()?.configuration ?? null;
  }

  /**
   * Whether the given tab should render. Falls back to showing every tab when `sidebarTabs` is
   * omitted, preserving existing behavior for maps that don't restrict their tabs.
   */
  public showTab(tab: 'features' | 'directions' | 'settings'): boolean {
    return !this.configuration?.sidebarTabs || this.configuration.sidebarTabs.includes(tab);
  }
}
