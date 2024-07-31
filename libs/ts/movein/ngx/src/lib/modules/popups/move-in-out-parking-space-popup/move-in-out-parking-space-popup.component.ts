import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, filter, map, Observable, of, shareReplay, switchMap } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { FeatureLayerSourceProperties } from '@tamu-gisc/common/types';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { BaseDirectionsComponent } from '@tamu-gisc/aggiemap/ngx/popups';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { MoveinOutService } from '../../map/services/move-in-out/move-in-out.service';
import { MoveInOutSettingsService } from '../../map/services/move-in-out-settings/move-in-out-settings.service';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-move-in-out-parking-space',
  templateUrl: './move-in-out-parking-space-popup.component.html',
  styleUrls: ['./move-in-out-parking-space-popup.component.scss']
})
export class MoveInOutParkingSpacePopupComponent extends BaseDirectionsComponent implements OnInit {
  /**
   * From the movein parking lots table,
   */
  public lotName: string;
  public lotParkingType: keyof ParkingLotTypes;
  public lotOrBuildingSource: Observable<'lot' | 'garage' | 'other'>;
  public lotOrBuilding: Observable<esri.Graphic>;
  public selectedMoveInDate: Observable<Date>;

  constructor(
    private readonly rrt: Router,
    private readonly rtt: ActivatedRoute,
    private readonly pss: TripPlannerService,
    private readonly agl: Angulartics2,
    private readonly ems: EsriMapService,
    private readonly mss: MoveinOutService,
    private readonly mios: MoveInOutSettingsService
  ) {
    super(rrt, rtt, pss, agl, ems);
  }

  public override ngOnInit() {
    super.ngOnInit();

    const daySuffix = this.mios.getMoveDateEventDayNumberForSettings();

    if (daySuffix !== undefined) {
      this.lotParkingType = this.data.attributes[`Day_${daySuffix}`];
    }

    // In the move-in dataset, parking lots and parking garages are stored in the same table. This is problematic because
    // parking garages are also buildings with building cod es and numbers which is the reason they they have richer popup content (e.g. images).
    // `this.data.attributes.Lot_Name` represents the click hit target from the map and it can be either of these two features. Thankfully, all lots are prefixed with 'Lot'
    // and garages are not, instead being abbreviated. This is the heuristic we use to determine if the clicked feature is a lot or a garage and then we can fetch the appropriate
    // attribute data to conditionally hydrate the popup.

    this.lotOrBuildingSource = of(this.data.attributes).pipe(
      map((attributes) => {
        if (attributes.Lot_Name.startsWith('Lot')) {
          return 'lot';
        } else if (attributes.Lot_Name.length === 3) {
          // All garages **should** have 3-character abbreviations
          return 'garage';
        } else {
          return 'other';
        }
      })
    );

    this.lotOrBuilding = this.lotOrBuildingSource.pipe(
      switchMap((type) => {
        if (type === 'lot' || type === 'other') {
          const lotSource = this.mss.getLayerSourceCopy('surface-lots-layer') as FeatureLayerSourceProperties;

          return this.mss.runTask(lotSource.url, { where: `CIT_Code = '${this.data.attributes.CIT_Code}'` }, false, false);
        } else {
          // Residence layer is a cold source that also references the campus buildings layer.
          const buildingSource = this.mss.getLayerSourceCopy('residence-layer') as FeatureLayerSourceProperties;

          return this.mss.runTask(
            buildingSource.url,
            { where: `BldgAbbr  = '${this.data.attributes.Lot_Name}'` },
            false,
            false
          );
        }
      }),
      switchMap((featureSet) => {
        if (featureSet.features.length > 0) {
          return of(featureSet.features[0]);
        } else {
          return EMPTY;
        }
      }),
      shareReplay()
    );

    this.selectedMoveInDate = of(true).pipe(
      map(() => this.mios.getMoveDateEventAsDate('in')),
      filter((date) => date !== undefined)
    );
  }
}

// Pipe to convert parking lot type to user-friendly label
@Pipe({
  name: 'parkingLotLabel'
})
export class ParkingLotLabelPipe implements PipeTransform {
  // User-friendly labels for the following parking lot types:
  // 'Free', 'Paid', '1HR DZ w P', '1HR Drop', 'SSG', 'Free 6-9', 'NoParking', 'LSP Req'
  public displayDictionary: ParkingLotTypes = {
    Free: 'Free parking',
    Paid: 'Hourly paid parking',
    '1HR DZ w P': '1-hour drop off zone, lot specific permit required after 1 hour',
    '1HR Drop': '1-hour drop zone',
    SSG: 'Free parking during move-in, no overnight parking parking without SSG permit',
    'Free 6-9': 'Free parking from 6am to 9pm, no overnight parking without lot-specific permit',
    NoParking: 'No move-in parking allowed at all times',
    'LSP Req': 'Lot specific permit required',
    'LSP Reqd': 'Lot specific permit required', // Typo in the dataset
    Disabled: 'Accessible parking ONLY. Valid placard required.'
  };

  public transform(parkingLotType: keyof ParkingLotTypes): string | undefined {
    // Resulting type can have leading/trailing whitespace
    const trimmed = parkingLotType.trim() as keyof ParkingLotTypes;

    if (parkingLotType !== undefined && this.displayDictionary[trimmed] !== undefined) {
      return this.displayDictionary[trimmed];
    }

    return;
  }
}

export interface ParkingLotTypes {
  Free: string;
  Paid: string;
  '1HR DZ w P': string;
  '1HR Drop': string;
  SSG: string;
  'Free 6-9': string;
  NoParking: string;
  'LSP Req': string;
  'LSP Reqd': string; // Typo in the dataset
  Disabled: string;
}
