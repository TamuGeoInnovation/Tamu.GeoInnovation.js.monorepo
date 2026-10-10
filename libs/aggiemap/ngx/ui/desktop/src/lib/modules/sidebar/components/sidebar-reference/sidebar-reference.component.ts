import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { TripPoint } from '@tamu-gisc/maps/feature/trip-planner';
import { SearchSelection, AltSearchHelper } from '@tamu-gisc/ui-kits/ngx/search';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { SearchComponent } from '@tamu-gisc/ui-kits/ngx/search';
import { LayerListModule } from '@tamu-gisc/maps/feature/layer-list';
import { LegendModule } from '@tamu-gisc/maps/feature/legend';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-sidebar-reference',
  templateUrl: './sidebar-reference.component.html',
  styleUrls: ['./sidebar-reference.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SearchComponent, LayerListModule, LegendModule]
})
export class SidebarReferenceComponent<T extends esri.Graphic> {
  private helper = inject(AltSearchHelper);
  private mapService = inject(EsriMapService);


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
