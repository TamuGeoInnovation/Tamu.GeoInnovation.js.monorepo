import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';

import { Angulartics2 } from 'angulartics2';
import { v4 as guid } from 'uuid';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';
import { SidebarModule } from '@tamu-gisc/common/ngx/ui/sidebar';
import { MapPopupModule } from '@tamu-gisc/maps/feature/popup';
import { TamuBlockBrandingComponent } from '@tamu-gisc/ui-kits/ngx/branding';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'tamu-gisc-aggiemap-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SidebarModule, MapPopupModule, TamuBlockBrandingComponent, RouterOutlet, AsyncPipe]
})
export class AggiemapSidebarComponent implements OnInit {
  public isDev: Observable<boolean>;

  constructor(
    private devTools: TestingService,
    private readonly analytics: Angulartics2
  ) {}

  public ngOnInit() {
    this.isDev = this.devTools.get('isTesting');
  }

  public reportSidebarContent(tabTitle: string) {
    const label = {
      guid: guid(),
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
