import { Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';
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
import { EsriMapService } from '@tamu-gisc/maps/esri';

import { trackEvent } from '@tamu-gisc/common/ngx/analytics';

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

  /** The panel itself, which lies over the map's right side. */
  private readonly panel = viewChild.required(SidebarComponent, { read: ElementRef });

  constructor() {
    const mapService = inject(EsriMapService);
    const destroyRef = inject(DestroyRef);

    // The map runs under the panel, so a fit to a route or a feature leaves the panel's part of it clear (#2763).
    afterNextRender(() => destroyRef.onDestroy(mapService.coverWith(this.panel().nativeElement)));
  }

  public reportSidebarContent(tabTitle: string) {
    const label = {
      name: tabTitle
    };

    trackEvent(this.analytics, 'sidebar_select', 'ui_interaction', label);
  }
}
