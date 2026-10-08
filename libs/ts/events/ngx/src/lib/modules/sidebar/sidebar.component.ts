import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { EventConfiguration } from '../../interfaces/special-event.interface';
import { EventSettingsService } from '../../services/settings/event-settings.service';


import { TamuBlockBrandingComponent } from '@tamu-gisc/ui-kits/ngx/branding';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { SidebarComponent } from '@tamu-gisc/common/ngx/ui/sidebar';
import { SidebarTabComponent } from '@tamu-gisc/common/ngx/ui/sidebar';
import { PopupComponent } from '@tamu-gisc/maps/feature/popup';
import { RevealSidebarOnPopupDirective } from '@tamu-gisc/maps/feature/popup';

@Component({
  selector: 'tamu-gisc-movein-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SidebarComponent, SidebarTabComponent, PopupComponent, RevealSidebarOnPopupDirective, TamuBlockBrandingComponent, RouterOutlet, AsyncPipe]
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
