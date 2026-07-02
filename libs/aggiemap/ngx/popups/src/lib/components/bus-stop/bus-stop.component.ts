import { Component } from '@angular/core';

import { BasePopupComponent } from '../base/base.popup.component';

/**
 * Popup for the AggieSpirit bus map. Rendered when a user clicks a graphic drawn by `BusService` on the
 * `bus-route-layer` — either a bus stop (`type === 'waypoints'`) or the route line (`type === 'route'`).
 */
@Component({
  selector: 'tamu-gisc-bus-stop-popup-component',
  templateUrl: './bus-stop.component.html',
  styleUrls: ['../base/base.popup.component.scss']
})
export class BusStopPopupComponent extends BasePopupComponent {}
