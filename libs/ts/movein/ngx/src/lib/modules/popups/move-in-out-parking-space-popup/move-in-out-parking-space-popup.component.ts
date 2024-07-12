import { Component } from '@angular/core';

import { BaseDirectionsComponent } from '@tamu-gisc/aggiemap/ngx/popups';

@Component({
  selector: 'tamu-gisc-move-in-out-parking-space',
  templateUrl: './move-in-out-parking-space-popup.component.html',
  styleUrls: ['./move-in-out-parking-space-popup.component.scss']
})
export class MoveInOutParkingSpacePopupComponent extends BaseDirectionsComponent {}
