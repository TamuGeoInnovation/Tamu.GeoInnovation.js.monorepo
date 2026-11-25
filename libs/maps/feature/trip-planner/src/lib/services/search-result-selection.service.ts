import { Injectable, inject } from '@angular/core';
import { Subscription } from 'rxjs';

import { EsriMapService } from '@tamu-gisc/maps/esri';
import { AltSearchHelper, SearchSelection } from '@tamu-gisc/ui-kits/ngx/search';

import { TripPoint } from '../core/trip-planner-core';

import esri = __esri;

/**
 * Shows a chosen search result on the map, with its own popup (#3484).
 *
 * This was written line for line in three components on two platforms - the desktop sidebar, the phone's omnisearch
 * and the event maps' sidebar - each resolving the result, building a `TripPoint` from it, and calling
 * `selectFeatures` with that point's graphic and the popup component its search source declares. A change to how a
 * search result reaches the map, or to which popup it opens, was three edits.
 *
 * It lives here because `TripPoint` does: `libs/maps/esri` cannot own it without depending on the trip planner, which
 * depends on `libs/maps/esri`.
 *
 * The event maps' copy reached for `res?.result?.breadcrumbs` while the other two reached straight through `res.result`.
 * The guarded form is kept, because it is the one that cannot throw on a result that resolved without breadcrumbs, and
 * `popupComponent` is optional to `selectFeatures` anyway.
 */
@Injectable({
  providedIn: 'root'
})
export class SearchResultSelectionService {
  private readonly helper = inject(AltSearchHelper);
  private readonly mapService = inject(EsriMapService);

  /** Resolves the result, then draws it and opens its popup. The subscription is returned for a caller that unsubscribes. */
  public show<T extends esri.Graphic>(result: SearchSelection<T>): Subscription {
    return this.helper.handleSearchResultFeatureSelection(result).subscribe((resolved) => {
      this.mapService.selectFeatures({
        graphics: [TripPoint.from(resolved).toEsriGraphic()],
        shouldShowPopup: true,
        popupComponent: resolved?.result?.breadcrumbs?.source?.popupComponent
      });
    });
  }
}
