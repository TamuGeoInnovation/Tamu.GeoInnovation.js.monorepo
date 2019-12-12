import { Injectable } from '@angular/core';

import { HitTestSnapshot } from '@tamu-gisc/maps/esri';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LayerSource } from '@tamu-gisc/common/types';

@Injectable()
export class PopupService {
  private layers: LayerSource[];

  constructor(private environment: EnvironmentService) {
    this.layers = this.environment.value('LayerSources');
  }

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
  public getComponent(snapshot: HitTestSnapshot): any {
    // Handle case if popup component override is provided.
    if (snapshot.popupComponent) {
      return snapshot.popupComponent;
    } else if (snapshot.graphics && snapshot.graphics[0]) {
      // If no component popup override is provided, determine the popup component from the graphic layer source.

      // Layer source ID for the first graphic in the collection
      const graphicLayerId = snapshot.graphics[0].layer.id;

      // Determined layer source by graphicLayerId
      const source = this.layers.find((src) => src.id === graphicLayerId);

      // Check if there is a source match
      if (!source) {
        return;
      }

      // Check if the source has a component declaration
      if (!source.popupComponent) {
        return;
      }

      return source.popupComponent;
    }
  }
}
