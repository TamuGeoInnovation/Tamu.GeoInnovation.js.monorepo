import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { BaseEventPopupComponent } from '../base-event-popup/base-event-popup.component';
import { CopyComponent } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

@Component({
    selector: 'tamu-gisc-markdown-popup',
    templateUrl: './markdown-popup.component.html',
    styleUrls: ['./markdown-popup.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CopyComponent]
})
export class MarkdownPopupComponent extends BaseEventPopupComponent implements OnInit {
  public title: string;

  constructor(
    router: Router,
    route: ActivatedRoute,
    plannerService: TripPlannerService,
    analytics: Angulartics2,
    mapService: EsriMapService
  ) {
    super(router, route, plannerService, analytics, mapService);
  }

  public override ngOnInit(): void {
    super.ngOnInit();

    this.title = this.data?.attributes?.name ? this.data.attributes.name : this.data.layer.title;
  }
}
