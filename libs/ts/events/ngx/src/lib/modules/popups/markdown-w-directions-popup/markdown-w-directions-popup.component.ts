import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { BaseEventPopupComponent } from '../base-event-popup/base-event-popup.component';

@Component({
  selector: 'tamu-gisc-markdown-w-directions-popup',
  templateUrl: './markdown-w-directions-popup.component.html',
  styleUrls: ['./markdown-w-directions-popup.component.scss']
})
export class MarkdownWDirectionsPopupComponent extends BaseEventPopupComponent implements OnInit {
  public title: string;
  public isContentTheSame: boolean;
  public isContentLengthZero: boolean;

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

    this.title = this.data?.attributes?.name ? this.data.attributes.name : this.data.layer.title;

    this.isContentTheSame = this.data?.attributes?.description === this.data?.attributes?.Notes;

    this.isContentLengthZero =
      typeof this.data?.attributes?.description === 'string' && this.data?.attributes?.description.trim().length === 0;
  }

  public override startDirections() {
    super.startDirections(`${this.data.attributes.OBJECTID}`);
  }
}
