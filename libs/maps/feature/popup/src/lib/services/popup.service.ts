import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { HitTestSnapshot } from '@tamu-gisc/maps/esri';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LayerSource } from '@tamu-gisc/common/types';

@Injectable({ providedIn: 'root' })
export class PopupService {
  private layers: LayerSource[];

  private _show: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public show = this._show.asObservable();

  private _suppressed: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public suppressed = this._suppressed.asObservable();

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
   */
  public getComponent(snapshot: HitTestSnapshot) {
    // Handle case if popup component override is provided.
    if (snapshot.popupComponent) {
      return snapshot.popupComponent;
    } else if (snapshot.graphics && snapshot.graphics[0]) {
      // If no component popup override is provided, determine the popup component from the graphic layer source.

      // Filter out graphics that have a layer source. In cases where a hit test returns more than 1 feature, some features
      // are auto-generated by widgets/components and will result in a false positive no-op case.
      const validGraphics = snapshot.graphics.filter((g) => g.layer && g.layer.id);

      // Layer source ID for the first graphic in the collection
      const graphicLayerId = validGraphics[0].layer.id;

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

  public showPopup() {
    this._show.next(false);
  }

  public hidePopup() {
    this._show.next(true);
  }

  public suppressPopups() {
    this._suppressed.next(true);
  }

  public enablePopups() {
    this._suppressed.next(false);
  }
}
