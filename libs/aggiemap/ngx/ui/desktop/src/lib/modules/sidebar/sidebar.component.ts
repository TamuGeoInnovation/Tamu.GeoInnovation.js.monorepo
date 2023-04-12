import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Angulartics2 } from 'angulartics2';
import { v4 as guid } from 'uuid';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

@Component({
  selector: 'tamu-gisc-aggiemap-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class AggiemapSidebarComponent implements OnInit {
  public isDev: Observable<boolean>;

  constructor(private devTools: TestingService, private readonly analytics: Angulartics2) {}

  public ngOnInit() {
    this.isDev = this.devTools.get('isTesting');
  }

  public reportSidebarContent(tabTitle: string) {
    const label = {
      guid: guid(),
      date: Date.now(),
      value: tabTitle
    };

    this.analytics.eventTrack.next({
      action: 'sidebar_select',
      properties: {
        category: 'ui_interaction',
        label: label,
        device: 'desktop'
      }
    });
  }
}
