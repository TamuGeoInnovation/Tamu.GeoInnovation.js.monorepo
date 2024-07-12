import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { from, map, Observable, shareReplay, tap } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { BuildingPopupComponent } from '@tamu-gisc/aggiemap/ngx/popups';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { MoveinOutServiceService } from '../../map/services/move-in-out-service.service';

import esri = __esri;
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { FeatureLayerSourceProperties } from '@tamu-gisc/common/types';

@Component({
  selector: 'tamu-gisc-move-in-out-building-popup',
  templateUrl: './move-in-out-building-popup.component.html',
  styleUrls: ['./move-in-out-building-popup.component.scss']
})
export class MoveInOutBuildingPopupComponent extends BuildingPopupComponent implements OnInit {
  public checkInLocation: Observable<esri.FeatureSet>;
  public hasCheckinLocation: Observable<boolean>;

  constructor(
    private readonly rrt: Router,
    private readonly rtt: ActivatedRoute,
    private readonly pss: TripPlannerService,
    private readonly agl: Angulartics2,
    private readonly ems: EsriMapService,
    private readonly env: EnvironmentService,
    private readonly mss: MoveinOutServiceService
  ) {
    super(rrt, rtt, pss, agl, ems);
  }

  public override ngOnInit() {
    super.ngOnInit();

    this.getIntersectingCheckinLocation();
  }

  /**
   * Using the current building footprint geometry, query the check-in location layer for intersecting features.
   *
   * These will be displayed alongside all the other building information instead of using a separate generic popup.
   */
  public getIntersectingCheckinLocation() {
    const layerSource = this.mss.getLayerSourceCopy('move-in-out-checkin-layer') as FeatureLayerSourceProperties;
    const buildingFootprint = this.data.geometry as esri.Polygon;

    if (layerSource) {
      this.checkInLocation = from(
        this.mss.runTask(layerSource.url, { where: "Type = 'Keys'" }, buildingFootprint, false)
      ).pipe(
        tap((fs) => {
          console.log(`Returned features: ${fs.features.length}`, fs);
        }),
        shareReplay()
      );

      this.hasCheckinLocation = this.checkInLocation.pipe(
        map((featureSet) => featureSet.features.length > 0),
        shareReplay()
      );
    }
  }
}
