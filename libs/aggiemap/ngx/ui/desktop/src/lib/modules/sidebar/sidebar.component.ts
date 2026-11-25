import { Component, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { TamuBlockBrandingComponent } from '@tamu-gisc/ui-kits/ngx/branding';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { SidebarComponent } from '@tamu-gisc/common/ngx/ui/sidebar';
import { SidebarTabComponent } from '@tamu-gisc/common/ngx/ui/sidebar';
import { PopupComponent } from '@tamu-gisc/maps/feature/popup';
import { RevealSidebarOnPopupDirective } from '@tamu-gisc/maps/feature/popup';

import { SIDEBAR_OPTIONS, SidebarTab, sidebarTabsFor } from './sidebar-tabs';

@Component({
  selector: 'tamu-gisc-aggiemap-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [
    SidebarComponent,
    SidebarTabComponent,
    PopupComponent,
    RevealSidebarOnPopupDirective,
    TamuBlockBrandingComponent,
    RouterOutlet,
    AsyncPipe
  ]
})
export class AggiemapSidebarComponent {
  private readonly analytics = inject(Angulartics2);

  /** What this map changes about its side panel, if anything (`SIDEBAR_OPTIONS`). */
  public readonly options = inject(SIDEBAR_OPTIONS, { optional: true });

  public readonly tabs: Observable<SidebarTab[]> = inject(TestingService)
    .get('isTesting')
    .pipe(map((development) => sidebarTabsFor(this.options, development === true)));

  public reportSidebarContent(tabTitle: string) {
    const label = {
      guid: crypto.randomUUID(),
      date: Date.now(),
      name: tabTitle
    };

    this.analytics.eventTrack.next({
      action: 'sidebar_select',
      properties: {
        category: 'ui_interaction',
        gstCustom: label
      }
    });
  }
}
