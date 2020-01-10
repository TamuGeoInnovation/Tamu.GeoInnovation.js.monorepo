import { Component } from '@angular/core';

import { AltSearchHelper } from '../../../../helper/alt-search.service';
import { TripPoint } from '@tamu-gisc/maps/feature/trip-planner';
import { SearchSelection } from '@tamu-gisc/search';
import { EsriMapService } from '@tamu-gisc/maps/esri';

import esri = __esri;

/**
 * Desktop sidebar component that displays the main search component as well as layer list and legend.
 */
@Component({
  selector: 'app-reference',
  templateUrl: './reference.component.html',
  styleUrls: ['./reference.component.scss'],
  providers: [AltSearchHelper]
})
export class ReferenceComponent<T extends esri.Graphic> {
  constructor(private helper: AltSearchHelper<T>, private mapService: EsriMapService) {}

  public onSearchResult(result: SearchSelection<T>) {
    this.helper.handleSearchResultFeatureSelection(result).subscribe((res) => {
      const tPoint = TripPoint.from(res);

      this.mapService.selectFeatures({
        graphics: [tPoint.toEsriGraphic()],
        shouldShowPopup: true,
        popupComponent: res.result.breadcrumbs.source.popupComponent
      });
    });
  }
}
