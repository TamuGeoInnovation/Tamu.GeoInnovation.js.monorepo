import { Component, OnInit, inject } from '@angular/core';

import { EventConfiguration } from '../../interfaces/special-event.interface';
import { EventSettingsService } from '../../services/settings/event-settings.service';

import { TamuBlockBrandingComponent } from '@tamu-gisc/ui-kits/ngx/branding';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '@tamu-gisc/common/ngx/ui/sidebar';
import { SidebarTabComponent } from '@tamu-gisc/common/ngx/ui/sidebar';
import { PopupComponent } from '@tamu-gisc/maps/feature/popup';
import { RevealSidebarOnPopupDirective } from '@tamu-gisc/maps/feature/popup';

@Component({
  selector: 'tamu-gisc-movein-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [
    SidebarComponent,
    SidebarTabComponent,
    PopupComponent,
    RevealSidebarOnPopupDirective,
    TamuBlockBrandingComponent,
    RouterOutlet
  ]
})
export class MoveInOutSidebarComponent implements OnInit {
  private readonly eventSettingsService = inject(EventSettingsService);

  public configuration: EventConfiguration | null;

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
