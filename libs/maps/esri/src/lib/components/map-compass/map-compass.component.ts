import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { take } from 'rxjs/operators';

import { EsriMapService } from '../../services/map/map.service';
import { EsriModuleProviderService } from '../../services/module-provider/module-provider.service';

import esri = __esri;

/**
 * The map's compass: a needle that turns with the map, and turns the map back to north when pressed.
 *
 * Our own rather than Esri's (#1853). The Compass widget is on its way out, and its replacement,
 * `<arcgis-compass>`, swaps the needle for a plain arrow whenever the view is not in Web Mercator or
 * WGS84, which on the campus basemap (EPSG:32139) is always, and back again on a Web Mercator basemap.
 * At campus scale true north is straight up to within a fraction of a degree, and an icon that changes
 * with the basemap reads as a glitch (#1845). The widget took an icon; the component does not.
 *
 * Drawn as the widget was: a round button in Esri's widget style, with Calcite's needle.
 *
 * Place it in the map's top-left slot, after the locate button: `<tamu-gisc-map-compass slot="top-left">`
 * inside `<tamu-gisc-esri-map>` (#1949). It follows the map's 2D view.
 */
@Component({
  selector: 'tamu-gisc-map-compass',
  templateUrl: './map-compass.component.html',
  styleUrls: ['./map-compass.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MapCompassComponent implements OnInit, OnDestroy {
  private readonly ms = inject(EsriMapService);
  private readonly mp = inject(EsriModuleProviderService);

  /** The view's rotation in degrees, which the needle turns by. */
  public readonly rotation = signal(0);

  private view: esri.MapView;
  private watch: IHandle;

  public ngOnInit(): void {
    import('@esri/calcite-components/components/calcite-icon');

    this.ms.store.pipe(take(1)).subscribe(async (instance) => {
      this.view = instance.view as esri.MapView;

      const [reactiveUtils] = (await this.mp.require(['reactiveUtils'])) as [esri.reactiveUtils];

      this.watch = reactiveUtils.watch(
        () => this.view.rotation,
        (rotation) => this.rotation.set(rotation ?? 0),
        { initial: true }
      );
    });
  }

  /**
   * Turns the map back to north, where it is.
   *
   * By the view's own viewpoint: ArcGIS 5.0's typings no longer list `rotation` as a `goTo` target (#1859).
   */
  public reset(): void {
    if (!this.view) {
      return;
    }

    const north = this.view.viewpoint.clone();

    north.rotation = 0;

    this.view.goTo(north).catch(() => {
      // Rejected when interrupted, e.g. by panning while it turns; nothing to undo.
    });
  }

  public ngOnDestroy(): void {
    this.watch?.remove();
  }
}
