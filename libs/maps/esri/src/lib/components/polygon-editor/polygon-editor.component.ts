import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  effect,
  input,
  output,
  signal,
  untracked,
  inject
} from '@angular/core';

import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';

import { EsriMapComponent } from '../esri-map/esri-map.component';
import { MapConfig, MapServiceInstance } from '../../services/map/map.service';
import { EsriModuleProviderService } from '../../services/module-provider/module-provider.service';
import { LongitudeLatitude } from '../../geographic';

import esri = __esri;

/**
 * A polygon drawn, seen and changed on a map (#3078): its corners come in as `corners` and go back out as
 * `cornersChange` whenever someone draws, reshapes, moves or clears it on the map.
 *
 * The corners are in WGS 84, in order around the polygon, without the first repeated at the end, which is how the
 * GIS Day venue form types a check-in zone. **Draw** starts a new polygon (click each corner, double-click the
 * last); clicking the polygon selects it to drag a corner or the whole of it; **Clear** removes it. Corners that
 * change from outside, such as a box they are also typed into, are redrawn and framed; corners this component has
 * just sent are not, so a polygon being changed is not redrawn under the pointer.
 *
 * Esri's sketch view model does the drawing, loaded with the rest of ArcGIS only once the map is shown.
 */
@Component({
  selector: 'tamu-gisc-polygon-editor',
  templateUrl: './polygon-editor.component.html',
  styleUrls: ['./polygon-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EsriMapComponent, ButtonComponent]
})
export class PolygonEditorComponent implements OnInit, OnDestroy {
  private readonly modules = inject(EsriModuleProviderService);

  /** The polygon's corners, in order around it. Fewer than three draws nothing. */
  public readonly corners = input<Array<LongitudeLatitude>>([]);

  /** Where the map opens, `[longitude, latitude]`, while there is no polygon to frame. */
  public readonly center = input<[number, number]>([-96.344672, 30.61306]);

  /** The map's zoom while there is no polygon to frame. */
  public readonly zoom = input(16);

  /** The corners as drawn on the map; an empty list once the polygon is cleared. */
  public readonly cornersChange = output<Array<LongitudeLatitude>>();

  /** Whether a polygon is on the map, for the Clear button. */
  protected readonly hasPolygon = signal(false);

  protected config: MapConfig;

  /** The map's view, its polygon's layer and the sketch view model, once the map has loaded. */
  private readonly sketch = signal<Sketch | undefined>(undefined);

  /** The corners the map is showing, so that the same corners coming back in are not drawn again. */
  private shown: Array<LongitudeLatitude> = [];

  private handles: Array<IHandle> = [];

  constructor() {
    effect(() => {
      const corners = this.corners() ?? [];
      const sketch = this.sketch();

      if (sketch && !sameCorners(corners, this.shown)) {
        untracked(() => this.show(sketch, corners));
      }
    });
  }

  public ngOnInit(): void {
    this.config = {
      basemap: { basemap: 'streets-navigation-vector' },
      view: {
        properties: {
          center: this.center(),
          zoom: this.zoom(),
          spatialReference: { wkid: 102100 }
        }
      }
    } as MapConfig;
  }

  public ngOnDestroy(): void {
    this.handles.forEach((h) => h.remove());
    this.sketch()?.model.destroy();
  }

  protected async loaded(instance: MapServiceInstance): Promise<void> {
    const [GraphicsLayer, SketchViewModel, Graphic, Polygon, webMercatorUtils] = await this.modules.require([
      'GraphicsLayer',
      'SketchViewModel',
      'Graphic',
      'Polygon',
      'webMercatorUtils'
    ]);

    const view = instance.view as esri.MapView;
    const layer: esri.GraphicsLayer = new GraphicsLayer({ title: 'Polygon' });

    instance.map.add(layer);

    const model: esri.SketchViewModel = new SketchViewModel({
      view,
      layer,
      // Drag a corner, or the whole polygon; not scale or rotate, which move every corner at once.
      defaultUpdateOptions: { tool: 'reshape', toggleToolOnClick: false }
    });

    const sketch: Sketch = { view, layer, model, Graphic, Polygon, webMercatorUtils };

    this.handles.push(
      model.on('create', (event) => {
        if (event.state === 'complete') {
          this.send(sketch, event.graphic);
        }
      }),
      model.on('update', (event) => {
        const stopped = event.toolEventInfo && /-stop$/.test(event.toolEventInfo.type);

        if (stopped || event.state === 'complete') {
          this.send(sketch, event.graphics[0]);
        }
      }),
      model.on('delete', () => this.send(sketch, undefined))
    );

    this.sketch.set(sketch);
  }

  /** Starts a new polygon in place of the one on the map. */
  protected draw(): void {
    const sketch = this.sketch();

    if (sketch) {
      sketch.model.cancel();
      sketch.layer.removeAll();
      this.hasPolygon.set(false);
      sketch.model.create('polygon');
    }
  }

  /** Removes the polygon. */
  protected clear(): void {
    const sketch = this.sketch();

    if (sketch) {
      sketch.model.cancel();
      sketch.layer.removeAll();
    }

    this.shown = [];
    this.hasPolygon.set(false);
    this.cornersChange.emit([]);
  }

  /** Draws `corners` in place of what the map shows, and frames them. */
  private show(sketch: Sketch, corners: Array<LongitudeLatitude>): void {
    sketch.model.cancel();
    sketch.layer.removeAll();
    this.shown = corners;

    const ring = ringFromCorners(corners);

    if (!ring) {
      this.hasPolygon.set(false);

      return;
    }

    const geographic = new sketch.Polygon({ rings: [ring], spatialReference: { wkid: 4326 } });
    const geometry = sketch.webMercatorUtils.geographicToWebMercator(geographic) as esri.Polygon;

    sketch.layer.add(new sketch.Graphic({ geometry, symbol: sketch.model.polygonSymbol }));
    this.hasPolygon.set(true);

    // A polygon made from a ring of corners has an extent.
    sketch.view.goTo(geometry.extent!.clone().expand(2)).catch(() => undefined);
  }

  /** Sends the corners of the polygon on the map, or none when it is gone. */
  private send(sketch: Sketch, graphic: esri.Graphic | null | undefined): void {
    const geometry = graphic?.geometry as esri.Polygon | undefined;
    const geographic = geometry ? (sketch.webMercatorUtils.webMercatorToGeographic(geometry) as esri.Polygon) : undefined;
    const corners = cornersFromRing(geographic?.rings?.[0] ?? []);

    this.shown = corners;
    this.hasPolygon.set(corners.length > 0);
    this.cornersChange.emit(corners);
  }
}

/** Decimal places kept in a corner sent out: a millionth of a degree is about 10 cm. */
const PLACES = 6;

/**
 * A polygon's ring, `[longitude, latitude]` pairs closed on the first, from its corners; `undefined` for fewer than
 * three.
 */
export function ringFromCorners(corners: Array<LongitudeLatitude>): Array<[number, number]> | undefined {
  if (!corners || corners.length < 3) {
    return undefined;
  }

  const ring = corners.map((c) => [c.longitude, c.latitude] as [number, number]);
  const [first, last] = [ring[0], ring[ring.length - 1]];

  return first[0] === last[0] && first[1] === last[1] ? ring : [...ring, first];
}

/**
 * A ring's corners, rounded to a millionth of a degree, without the closing repeat of the first; an empty list for a
 * ring of fewer than three.
 */
export function cornersFromRing(ring: Array<Array<number>>): Array<LongitudeLatitude> {
  const corners = (ring ?? []).map(([x, y]) => ({ latitude: round(y), longitude: round(x) }));
  const [first, last] = [corners[0], corners[corners.length - 1]];
  const open = corners.length > 1 && sameCorner(first, last) ? corners.slice(0, -1) : corners;

  return open.length >= 3 ? open : [];
}

function round(value: number): number {
  return Number(value.toFixed(PLACES));
}

function sameCorner(a: LongitudeLatitude, b: LongitudeLatitude): boolean {
  return a.latitude === b.latitude && a.longitude === b.longitude;
}

function sameCorners(a: Array<LongitudeLatitude>, b: Array<LongitudeLatitude>): boolean {
  return a.length === b.length && a.every((c, i) => sameCorner(c, b[i]));
}

interface Sketch {
  view: esri.MapView;
  layer: esri.GraphicsLayer;
  model: esri.SketchViewModel;
  Graphic: typeof esri.Graphic;
  Polygon: typeof esri.Polygon;
  webMercatorUtils: esri.webMercatorUtils;
}
