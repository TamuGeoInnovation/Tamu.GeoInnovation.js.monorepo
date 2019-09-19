import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { EsriModuleProviderService } from '@tamu-gisc/maps/esri';
import { EsriMapService } from '@tamu-gisc/maps/esri';
import { Subscription } from 'rxjs';

import { LayerSources } from '../../../../../environments/environment';

import esri = __esri;
@Component({
  selector: 'map-viewfinder',
  templateUrl: './map-viewfinder.component.html',
  styleUrls: ['./map-viewfinder.component.scss']
})
export class MapViewfinderComponent implements OnInit, OnDestroy {
  /**
   * Esri map service subscription used to retrieve view from the store.
   *
   * Subscription stored in order to unsubscribe on component destroy to avoid memory leaks.
   *
   * @private
   * @type {Subscription}
   * @memberof MapViewfinderComponent
   */
  private _mapServiceSubscription: Subscription;

  /**
   * Map view DOM reference
   *
   * @private
   * @type {HTMLDivElement}
   * @memberof MapViewfinderComponent
   */
  private _mapViewEl: HTMLDivElement;

  /**
   * Store for selected features within the viewfinder. Used in temlate to render list.
   *
   * @type {esri.Graphic[]}
   * @memberof MapViewfinderComponent
   */
  public viewFinderFeatures: esri.Graphic[];

  /**
   * Determines when the view finder is visible.
   *
   * @type {boolean}
   * @memberof MapViewfinderComponent
   */
  public accessibleNavigation = false;

  /**
   * Viewfinder DOM reference.
   *
   * @private
   * @type {ElementRef}
   * @memberof MapViewfinderComponent
   */
  @ViewChild('viewfinder', { static: true }) private viewfinder: ElementRef;

  constructor(private moduleProvider: EsriModuleProviderService, private mapService: EsriMapService) {}

  public ngOnInit() {
    this._mapServiceSubscription = this.mapService.store.subscribe((instance) => {
      this._mapViewEl = instance.view.container;

      instance.view.on('key-up', (e: esri.MapViewKeyDownEvent) => {
        // Catch a select few keys to query buildings feature layer
        if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', '-', '=', '+'].includes(e.key)) {
          this.accessibleNavigation = true;

          // Set timeout required to allow the state variables to reflect in the UI.
          // Else, the feature intersection calculation does not work as there is no pause for rendering
          // in the event loop until the next event cycle
          setTimeout(() => {
            const viewfinder = this.viewfinder.nativeElement;

            // Get vertice coordinates of the on-screen viewfinder
            const screenCoords = [
              [
                viewfinder.offsetLeft - viewfinder.offsetWidth / 2,
                viewfinder.offsetTop - viewfinder.offsetHeight / 2 - this._mapViewEl.offsetTop
              ], // First vertex
              [
                viewfinder.offsetLeft + viewfinder.offsetWidth / 2,
                viewfinder.offsetTop - viewfinder.offsetHeight / 2 - this._mapViewEl.offsetTop
              ],
              [
                viewfinder.offsetLeft + viewfinder.offsetWidth / 2,
                viewfinder.offsetTop + viewfinder.offsetHeight / 2 - this._mapViewEl.offsetTop
              ],
              [
                viewfinder.offsetLeft - viewfinder.offsetWidth / 2,
                viewfinder.offsetTop + viewfinder.offsetHeight / 2 - this._mapViewEl.offsetTop
              ],
              [
                viewfinder.offsetLeft - viewfinder.offsetWidth / 2,
                viewfinder.offsetTop - viewfinder.offsetHeight / 2 - this._mapViewEl.offsetTop
              ] // Closing vertex, same as first
            ];

            // Transform screen point coordinates to map point coordinates
            const mapCoords: any = screenCoords
              .map((point) => {
                return instance.view.toMap({
                  x: point[0],
                  y: point[1]
                });
              })
              .map((coord) => {
                return [coord.longitude, coord.latitude];
              });

            // Use module provider to get polygon class object
            this.moduleProvider.require(['Polygon']).then(([Polygon]: [esri.PolygonConstructor]) => {
              // Create a polygon that will be used to query the feature layer to get intersecting features
              const polygon = new Polygon({
                rings: mapCoords
              });

              const layerSource = LayerSources.find((source) => source.id === 'buildings-layer');

              this.mapService.findLayerOrCreateFromSource(layerSource).then((layer: esri.FeatureLayer) => {
                layer
                  .queryFeatures({
                    geometry: polygon,
                    returnGeometry: true,
                    outFields: ['*']
                  })
                  .then((features) => {
                    // Limit viewfinder results by the first 5 returned.
                    this.viewFinderFeatures = features.features.slice(0, 5);
                  });
              });
            });
          }, 0);
        }

        // If viewfinder has features, and a number selection is made.
        if (
          this.viewFinderFeatures &&
          this.viewFinderFeatures.length > 0 &&
          ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(e.key)
        ) {
          if (this.viewFinderFeatures[parseInt(e.key, 10) - 1]) {
            // Clear the results layer

            this.mapService.selectFeatures({
              graphics: [this.viewFinderFeatures[parseInt(e.key, 10) - 1].clone()],
              shouldShowPopup: true
            });
          }
        }
      });

      // On any map view click, disable the keyboard accessible navigation overlay
      instance.view.on('click', (e) => {
        this.accessibleNavigation = false;
      });
    });
  }

  public ngOnDestroy() {
    this._mapServiceSubscription.unsubscribe();
  }
}
