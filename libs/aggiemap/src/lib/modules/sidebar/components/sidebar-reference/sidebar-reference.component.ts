import { Component, OnInit } from '@angular/core';

import { TripPoint } from '@tamu-gisc/maps/feature/trip-planner';
import { SearchSelection, AltSearchHelper } from '@tamu-gisc/search';
import { EsriMapService } from '@tamu-gisc/maps/esri';

// import { CoordinateConverter } from '@tamu-gisc/common/utils/geometry/esri';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-sidebar-reference',
  templateUrl: './sidebar-reference.component.html',
  styleUrls: ['./sidebar-reference.component.scss']
})
export class SidebarReferenceComponent<T extends esri.Graphic> implements OnInit {
  // public converter: CoordinateConverter;

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

  public ngOnInit() {
    // this.converter = new CoordinateConverter();
  }

  // public handleDrawn(g: Array<esri.Graphic>) {
  //   if (g.length > 0) {
  //     const m = g.map((graphic) => {
  //       if (graphic.geometry.type === 'polygon') {
  //         const polygon = graphic.geometry as esri.Polygon;

  //         // Assume no multi-polygon
  //         const points = polygon.rings[0];

  //         const coords = points.map((point) => {
  //           const formatted = this.converter.webMercatorToGeographic(point[1], point[0]);

  //           return `[${formatted.longitude}, ${formatted.latitude}]`;
  //         });

  //         return `[${coords.join(',')}]`;
  //       }
  //     });

  //     m.forEach((s) => {
  //       console.log(s);
  //     });
  //   }
  // }
}
