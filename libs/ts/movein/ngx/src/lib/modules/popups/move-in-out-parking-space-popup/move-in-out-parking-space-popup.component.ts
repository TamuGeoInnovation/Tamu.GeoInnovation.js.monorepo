import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { BaseDirectionsComponent } from '@tamu-gisc/aggiemap/ngx/popups';
import { TripPlannerService } from '@tamu-gisc/maps/feature/trip-planner';

import { MoveinOutServiceService } from '../../map/services/move-in-out-service.service';

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

  constructor(
    private readonly rrt: Router,
    private readonly rtt: ActivatedRoute,
    private readonly pss: TripPlannerService,
    private readonly agl: Angulartics2,
    private readonly ems: EsriMapService,
    private readonly mss: MoveinOutServiceService
  ) {
    super(rrt, rtt, pss, agl, ems);
  }

  public override ngOnInit() {
    super.ngOnInit();

    const daySuffix = this.mss.getMoveDateEventDayNumberForSettings();

    if (daySuffix !== undefined) {
      this.lotParkingType = this.data.attributes[`Day_${daySuffix}`];
    }
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
    Paid: 'Paid parking',
    '1HR DZ w P': '1HR DZ w P',
    '1HR Drop': '1 hour drop zone',
    SSG: 'Free parking',
    'Free 6-9': 'Free visitor parking from 6-9PM',
    NoParking: 'No parking at all times',
    'LSP Req': 'Lot-specific permit required'
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
}
