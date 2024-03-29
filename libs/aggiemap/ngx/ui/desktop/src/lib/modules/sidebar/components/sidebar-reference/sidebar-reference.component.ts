import { Component } from '@angular/core';

import { TripPoint } from '@tamu-gisc/maps/feature/trip-planner';
import { SearchSelection, AltSearchHelper } from '@tamu-gisc/ui-kits/ngx/search';
import { EsriMapService } from '@tamu-gisc/maps/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-sidebar-reference',
  templateUrl: './sidebar-reference.component.html',
  styleUrls: ['./sidebar-reference.component.scss']
})
export class SidebarReferenceComponent<T extends esri.Graphic> {
  constructor(private helper: AltSearchHelper, private mapService: EsriMapService) {}

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
