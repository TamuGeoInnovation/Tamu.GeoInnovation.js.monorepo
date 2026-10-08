import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';

import { Angulartics2 } from 'angulartics2';
import { v4 as guid } from 'uuid';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';


import { TamuBlockBrandingComponent } from '@tamu-gisc/ui-kits/ngx/branding';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { SidebarComponent } from '@tamu-gisc/common/ngx/ui/sidebar';
import { SidebarTabComponent } from '@tamu-gisc/common/ngx/ui/sidebar';
import { PopupComponent } from '@tamu-gisc/maps/feature/popup';
import { RevealSidebarOnPopupDirective } from '@tamu-gisc/maps/feature/popup';

@Component({
  selector: 'tamu-gisc-aggiemap-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SidebarComponent, SidebarTabComponent, PopupComponent, RevealSidebarOnPopupDirective, TamuBlockBrandingComponent, RouterOutlet, AsyncPipe]
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
