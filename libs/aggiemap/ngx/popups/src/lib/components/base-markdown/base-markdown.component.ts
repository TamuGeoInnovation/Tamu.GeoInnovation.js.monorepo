import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';

@Component({
  selector: 'tamu-gisc-base-markdown',
  templateUrl: './base-markdown.component.html',
  styleUrls: ['../base-directions/base-directions.component.scss']
})
export class BaseMarkdownComponent extends BaseDirectionsComponent implements OnInit {
  constructor(
    private rtr: Router,
    private rt: ActivatedRoute,
    private ps: TripPlannerService,
    private anl: Angulartics2,
    private ms: EsriMapService
  ) {
    super(rtr, rt, ps, anl, ms);
  }

  public ngOnInit() {
    super.ngOnInit();
  }
}

