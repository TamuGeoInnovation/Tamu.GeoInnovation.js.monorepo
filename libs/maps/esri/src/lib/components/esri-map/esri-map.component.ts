import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  afterNextRender,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import { take } from 'rxjs/operators';

import { EsriMapService, MapConfig, MapHost, MapServiceInstance } from '../../services/map/map.service';

import esri = __esri;

/**
 * A map, hosted by Esri's map components: `<arcgis-map>`, and `<arcgis-scene>` once a page asks for 3D (#1949).
 *
 * The element makes the view; `EsriMapService` makes the map it shows and does everything after (layers,
 * selection, the click hit test), and its store hands out the element's own `MapView` or `SceneView`, so
 * nothing downstream knows how the view was made.
 *
 * Controls sit in the element's slots, the current way to place them since ArcGIS 5.1 deprecated `view.ui`.
 * The zoom buttons are the host's (`zoom`, on unless a page turns them off). A page puts its own controls
 * in the map by giving them a `slot` (`top-left`, `bottom-right`, ...), in the order they should stack
 * below the zoom buttons; content without a `slot` goes in the element's default slot, positioned by its
 * own styles. `.map-overlay-ui` content stays outside the element, over the map, as before.
 *
 * The scene has the controls a scene shows by default: zoom, the pan/rotate toggle and Esri's compass.
 *
 * The elements are drawn only once their definitions and the map have loaded, so the view is created
 * with the map and the page's view properties already set and starts where the page asked.
 */
@Component({
  selector: 'tamu-gisc-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EsriMapComponent implements OnInit, OnDestroy, MapHost {
  private readonly mapService = inject(EsriMapService);
  private readonly injector = inject(Injector);

  public readonly config = input<MapConfig>(undefined);

  /** Whether the map has zoom buttons, at the top of its top-left corner. */
  public readonly zoom = input(true);

  public readonly loaded = output<MapServiceInstance>();

  /** The map the elements show, once it is made. Nothing is drawn before. */
  protected readonly map = signal<esri.Map | undefined>(undefined);

  /** Whether the scene has been asked for. It is drawn once and kept, as the 3D view always was. */
  protected readonly scene = signal(false);

  /** Which element is showing. The other stays on the page, hidden, with its view and its place. */
  protected readonly showing = signal<'2d' | '3d'>('2d');

  private readonly flat = viewChild<ElementRef<HTMLArcgisMapElement>>('flat');
  private readonly globe = viewChild<ElementRef<HTMLArcgisSceneElement>>('globe');

  /** The scene once it has been asked for; see `sceneView`. */
  private drawingScene: Promise<esri.SceneView> | undefined;

  public ngOnInit() {
    const config = this.config();

    if (!config || !config.view || !config.view.properties) {
      throw new Error(`Incorrectly formed configuration provided.`);
    }

    this.mapService.store.pipe(take(1)).subscribe((store) => {
      this.loaded.emit(store);
    });

    this.open(config);
  }

  public ngOnDestroy() {
    this.mapService.destroy();
  }

  /**
   * The scene, drawn the first time it is asked for, with `properties` set before its view loads, and the
   * same scene after, however quickly the asks come. The map service gives it the map when it is shown.
   */
  public sceneView(properties: esri.SceneViewProperties): Promise<esri.SceneView> {
    this.drawingScene ??= this.drawScene(properties);

    return this.drawingScene;
  }

  public show(view: esri.MapView | esri.SceneView): void {
    this.showing.set(view.type);
  }

  private async drawScene(properties: esri.SceneViewProperties): Promise<esri.SceneView> {
    await Promise.all([
      import('@arcgis/map-components/components/arcgis-scene'),
      import('@arcgis/map-components/components/arcgis-navigation-toggle'),
      import('@arcgis/map-components/components/arcgis-compass')
    ]);

    await this.draw(() => this.scene.set(true), () => this.globe(), properties);

    return this.globe().nativeElement.view;
  }

  private async open(config: MapConfig): Promise<void> {
    const [map] = await Promise.all([
      this.mapService.makeMap(config.basemap),
      import('@arcgis/map-components/components/arcgis-map'),
      import('@arcgis/map-components/components/arcgis-zoom'),
      import('@arcgis/map-components/components/arcgis-track')
    ]);

    await this.draw(() => this.map.set(map), () => this.flat(), config.view.properties);

    this.mapService.useView(this.flat().nativeElement.view, this);
  }

  /**
   * Draws an element by `change`, and sets `properties` on its view in the same render, before the view
   * loads. A view that loads first starts where the element's defaults put it, and a `center` set
   * afterwards no longer frames it. Set on the view, which the element makes as it is created, rather
   * than on the element, because not every view property has an element property (`attributionVisible`).
   */
  private draw(
    change: () => void,
    element: () => ElementRef<HTMLArcgisMapElement | HTMLArcgisSceneElement> | undefined,
    properties: esri.MapViewProperties | esri.SceneViewProperties
  ): Promise<void> {
    return new Promise((resolve) => {
      afterNextRender(
        () => {
          const el = element().nativeElement;

          (el.view as esri.MapView | esri.SceneView).set(
            Object.fromEntries(
              Object.entries(properties).filter(([key, value]) => value !== undefined && !IGNORED_VIEW_PROPERTIES.includes(key))
            )
          );

          el.componentOnReady().then(() => resolve());
        },
        { injector: this.injector }
      );

      change();
    });
  }
}

/** View properties the host does not pass on: it sets the map and the container itself. */
const IGNORED_VIEW_PROPERTIES = ['map', 'container'];
