import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { BaseEventPopupComponent } from '../base-event-popup/base-event-popup.component';

@Component({
  selector: 'tamu-gisc-markdown-popup',
  templateUrl: './markdown-popup.component.html',
  styleUrls: ['./markdown-popup.component.scss']
})
export class MarkdownPopupComponent extends BaseEventPopupComponent implements OnInit {
  public title: string;

  constructor(
    router: Router,
    route: ActivatedRoute,
    plannerService: TripPlannerService,
    analytics: Angulartics2,
    mapService: EsriMapService,
    env: EnvironmentService
  ) {
    super(router, route, plannerService, analytics, mapService, env);
  }

  public override ngOnInit(): void {
    super.ngOnInit();

    this.title = this.data?.attributes?.name ? this.data.attributes.name : this.data?.layer?.title ?? '';
  }
}
