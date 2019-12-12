import { Injectable } from '@angular/core';

import { BasePopupComponent } from '../components/base/base.popup.component';
import { BuildingPopupComponent } from '../components/building/building-popup.component';
import { ConstructionPopupComponent } from '../components/construction/construction.component';
import { PoiPopupComponent } from '../components/poi/poi.component';
import { RestroomPopupComponent } from '../components/restroom/restroom.component';
import { LactationPopupComponent } from '../components/lactation/lactation.component';
import { ParkingKioskPopupComponent } from '../components/parking-kiosk/parking-kiosk.component';
import { ParkingLotPopupComponent } from '../components/parking-lot/parking-lot.component';
import { AccessiblePopupComponent } from '../components/accessible/accessible.component';

import { HitTestSnapshot } from '@tamu-gisc/maps/esri';
import { LayerSources } from '../../../../../environments/environment';

@Injectable()
export class PopupService {
  constructor() {}

  private _dictionary = [
    { id: 'BasePopupComponent', component: BasePopupComponent },
    { id: 'BuildingPopupComponent', component: BuildingPopupComponent },
    { id: 'ConstructionPopupComponent', component: ConstructionPopupComponent },
    { id: 'PoiPopupComponent', component: PoiPopupComponent },
    { id: 'RestroomPopupComponent', component: RestroomPopupComponent },
    { id: 'LactationPopupComponent', component: LactationPopupComponent },
    { id: 'ParkingKioskPopupComponent', component: ParkingKioskPopupComponent },
    { id: 'ParkingLotPopupComponent', component: ParkingLotPopupComponent },
    { id: 'AccessiblePopupComponent', component: AccessiblePopupComponent }
  ];

  /**
   * Determine component ID by one of two methods:
   *
   * - Component name reference by source layer id from top-most graphic in array collection.
   * - Component override reference declaration
   *
   * @param {HitTestSnapshot} snapshot Snapshot object containing graphic collection and the
   *  optional component override reference.
   * @returns {*}
   * @memberof PopupService
   */
  public getComponent(snapshot: HitTestSnapshot) {
    // Handle case if popup component override is provided.
    if (snapshot.popupComponent) {
      const dicionaryObject = this._dictionary.find((obj) => obj.id === snapshot.popupComponent);

      // Chck we got a dictionary match by ID
      if (!dicionaryObject) {
        return;
      }

      return dicionaryObject.component;
    } else if (snapshot.graphics && snapshot.graphics[0]) {
      // If no component popup override is provided, determine the popup component from the graphic layer source.

      // Layer source ID for the first graphic in the collection
      const graphicLayerId = snapshot.graphics[0].layer.id;

      // Determined layer source by graphicLayerId
      const source = LayerSources.find((src) => src.id === graphicLayerId);

      // Check if there is a source match
      if (!source) {
        return;
      }

      // Check if the source has a component declaration
      if (!source.popupComponent) {
        return;
      }

      const dicionaryObject = this._dictionary.find((obj) => obj.id === source.popupComponent);

      // Chck we got a dictionary match by ID
      if (!dicionaryObject) {
        return;
      }

      return dicionaryObject.component;
    }
  }
}
