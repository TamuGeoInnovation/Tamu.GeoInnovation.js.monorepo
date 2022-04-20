import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  combineLatest,
  firstValueFrom,
  forkJoin,
  from,
  Observable,
  of,
  ReplaySubject,
  Subject
} from 'rxjs';
import { distinctUntilChanged, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { DeepPartial } from 'typeorm';

import * as md5 from 'md5';

import { CPALayer } from '@tamu-gisc/cpa/common/entities';
import { IScenarioResolved, ISnapshotPartial, IWorkshopRequestPayload } from '@tamu-gisc/cpa/data-api';
import { WorkshopService, SnapshotService, ScenarioService } from '@tamu-gisc/cpa/ngx/data-access';
import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';
import { PortalLayerJSON } from '@tamu-gisc/maps/feature/forms';

import { ViewerBasePopupComponent } from '../components/viewer-base-popup/viewer-base-popup.component';

import esri = __esri;

@Injectable({
  providedIn: 'root'
})
export class ViewerService {
  private _workshopGuid: ReplaySubject<string> = new ReplaySubject(undefined);
  public workshopGuid: Observable<string> = this._workshopGuid.asObservable();
  private _participantGuid: ReplaySubject<string> = new ReplaySubject(undefined);
  public participantGuid: Observable<string> = this._participantGuid.asObservable();

  public workshop: Observable<IWorkshopRequestPayload>;

  public workshopSnapshots: Observable<Array<ISnapshotPartial>>;
  public workshopContexts: Observable<Array<ISnapshotPartial>>;
  public workshopScenarios: Observable<Array<IScenarioResolved>>;

  /**
   * Flattened collection of both snapshots and scenarios for a workshop
   */
  public snapshotsAndScenarios: Observable<Array<TypedSnapshotOrScenario>>;

  /**
   * Selected snapshot and scenario by index
   */
  public snapshotOrScenario: Observable<TypedSnapshotOrScenario>;

  public snapshotHistory: BehaviorSubject<TypedSnapshotOrScenario[]> = new BehaviorSubject([]);
  private selectionGuid: BehaviorSubject<string> = new BehaviorSubject(null);

  public save: Subject<boolean> = new Subject();

  private _map: esri.Map;
  private _view: esri.MapView;
  private _modules: {
    layer: esri.LayerConstructor;
    featureLayer: esri.FeatureLayerConstructor;
    graphicsLayer: esri.GraphicsLayerConstructor;
    groupLayer: esri.GroupLayerConstructor;
    graphic: esri.GraphicConstructor;
    mapImageLayer: esri.MapImageLayerConstructor;
  };

  constructor(
    private http: HttpClient,
    private ws: WorkshopService,
    private sss: SnapshotService,
    private sns: ScenarioService,
    private ms: EsriMapService,
    private mp: EsriModuleProviderService,
    private sc: ScenarioService
  ) {
    this.init();
  }

  public updateWorkshopGuid(guid: string) {
    this._workshopGuid.next(guid);
  }

  public updateSelectionGuid(guid: string) {
    this.selectionGuid.next(guid);
  }

  public updateParticipantGuid(guid: string) {
    this._participantGuid.next(guid);
  }

  public init(): void {
    this.workshop = this._workshopGuid.pipe(
      distinctUntilChanged(),
      switchMap((guid) => {
        return this.ws.getWorkshop(guid);
      }),
      shareReplay(1)
    );

    this.workshopSnapshots = this.workshop.pipe(
      switchMap((workshop) => {
        return this.sss.getForWorkshop(workshop.guid);
      }),
      shareReplay(1)
    );

    this.workshopContexts = this.workshop.pipe(
      switchMap((workshop) => {
        return this.sss.getContextsForWorkshop(workshop.guid);
      }),
      shareReplay(1)
    );

    this.workshopScenarios = this.workshop.pipe(
      switchMap((workshop) => {
        return this.sns.getForWorkshop(workshop.guid);
      })
    );

    this.snapshotsAndScenarios = combineLatest([this.workshopSnapshots, this.workshopScenarios]).pipe(
      map(([snapshots, scenarios]) => {
        const typedSnapshots: Array<TypedSnapshotOrScenario> = snapshots.map((s) => {
          return { ...s, type: 'snapshot' };
        });

        const typedScenarios: Array<TypedSnapshotOrScenario> = scenarios.map((s) => {
          return { ...s, type: 'scenario' };
        });

        return [...typedSnapshots, ...typedScenarios];
      }),
      shareReplay(1)
    );

    this.snapshotOrScenario = combineLatest([
      this.snapshotsAndScenarios,
      this.selectionGuid.pipe(distinctUntilChanged())
    ]).pipe(
      map(([snapshots, guid]) => {
        if (guid === null) {
          return snapshots[0];
        } else {
          const found = snapshots.find((s) => s.guid === guid);

          // In the event of a not found event, redirection fallback to the first snapshot.
          if (found === undefined) {
            return snapshots[0];
          } else {
            return found;
          }
        }
      }),
      tap((snapshot) => {
        this.addToSnapshotHistory(snapshot);
      }),
      shareReplay(1)
    );

    // Use SnapshotHistory observable to determine a snapshot change which requires the addition of new layers
    // and/or removal of old snapshot layers
    combineLatest([
      this.snapshotHistory,
      this.ms.store,
      from(this.mp.require(['Layer', 'FeatureLayer', 'GraphicsLayer', 'GroupLayer', 'Graphic', 'Extent', 'MapImageLayer']))
    ]).subscribe(
      ([snapshotHistory, instances, [Layer, FeatureLayer, GraphicsLayer, GroupLayer, Graphic, Extent, MapImageLayer]]: [
        TypedSnapshotOrScenario[],
        MapServiceInstance,
        [
          esri.LayerConstructor,
          esri.FeatureLayerConstructor,
          esri.GraphicsLayerConstructor,
          esri.GroupLayerConstructor,
          esri.GraphicConstructor,
          esri.ExtentConstructor,
          esri.MapImageLayerConstructor
        ]
      ]) => {
        this._modules = {
          layer: Layer,
          featureLayer: FeatureLayer,
          graphic: Graphic,
          graphicsLayer: GraphicsLayer,
          groupLayer: GroupLayer,
          mapImageLayer: MapImageLayer
        };

        this._map = instances.map;
        this._view = instances.view as esri.MapView;

        // Find any layers associated with the current snapshot and clear them to prepare to add layers from the next snapshot
        const prevSnapshot = snapshotHistory.length > 1 ? snapshotHistory[0] : undefined;
        const currSnapshot = snapshotHistory.length > 1 ? snapshotHistory[1] : snapshotHistory[0];

        if (!currSnapshot) {
          return;
        }

        if (currSnapshot.extent !== undefined || currSnapshot !== null) {
          const ext = Extent.fromJSON(currSnapshot.extent);
          this._view.goTo(ext);
        } else if (currSnapshot.mapCenter !== undefined || currSnapshot.zoom !== undefined) {
          this._view.goTo({
            center: currSnapshot.mapCenter.split(',').map((c) => parseFloat(c)),
            zoom: currSnapshot.zoom
          });
        }

        if (prevSnapshot) {
          this._removeTimelineEventLayers(prevSnapshot);
        }

        // Queue the new layers on the next event loop, otherwise any layers that need removed
        // will not have been removed until then and will not appear in the legend.
        setTimeout(async () => {
          if (currSnapshot.type === 'scenario') {
            this.getLayerForScenarioGuid(currSnapshot.guid)
              .then(async (layer) => {
                const groupLayer = await this._generateGroupLayers(layer.layers, currSnapshot.title);
                instances.map.add(groupLayer);
              })
              .catch((err) => {
                throw new Error(err);
              });
          } else if (currSnapshot.type === 'snapshot') {
            // Create a map of layers from the current snapshot to add to the map.
            const groupLayer = await this._generateGroupLayers(currSnapshot.layers, currSnapshot.title);
            instances.map.add(groupLayer);
          }
        }, 0);
      }
    );

    // Create a new subscription to the map service, load up the contexts, and add to map
    combineLatest([this.ms.store, from(this.mp.require(['Extent']))]).subscribe(
      ([instances, [Extent]]: [MapServiceInstance, [esri.ExtentConstructor]]) => {
        // Get workshop contexts
        this.workshopContexts.subscribe((contexts) => {
          contexts.forEach(async (val, index) => {
            const contextLayer = await this._generateGroupLayers(val.layers, 'Context');
            instances.map.add(contextLayer, index);
            const extent = Extent.fromJSON(val.extent);
            this._view.goTo(extent);
          });
        });
      }
    );
  }

  /**
   * Used to remotely trigger a response submission
   */
  public forceSave() {
    this.save.next(undefined);
  }
  /**
   * Manages the history of the SnapshotHistory behavior subject, to only keep a maximum of 2 entires (curr and prev).
   *
   * This history is used to add/remove layers for snapshots.
   */
  private addToSnapshotHistory(snapshot: TypedSnapshotOrScenario) {
    const prevValue = this.snapshotHistory.getValue();

    const newValue = [...prevValue, snapshot].slice(-2);

    this.snapshotHistory.next(newValue);
  }

  private async _generateGroupLayers(
    definitions: Array<DeepPartial<CPALayer>>,
    snapshotOrScenarioTitle: string
  ): Promise<esri.Layer> {
    const reversedLayers = [...definitions].reverse();
    const idHash = this._generateGroupLayerId(reversedLayers);

    const layers = await Promise.all(
      reversedLayers
        .map(async (l) => {
          if (l.url && l.info.type) {
            return await firstValueFrom(
              forkJoin([
                from(this.mp.require(['Layer'])).pipe(
                  switchMap(([Layer]: [esri.LayerConstructor]) => {
                    return Layer.fromArcGISServerUrl({
                      url: l.url
                    });
                  })
                ),
                this.http.get<PortalLayerJSON>(l.url + '?f=pjson')
              ]).pipe(
                switchMap(([serverLayer, metadata]) => {
                  if (metadata.type === 'Raster Layer') {
                    const rasterLayer = serverLayer as esri.FeatureLayer;
                    return from(
                      this.ms.findLayerOrCreateFromSource({
                        type: 'map-image',
                        id: l.info.layerId,
                        title: rasterLayer.title,
                        url: rasterLayer.url,
                        native: {
                          sublayers: [{ id: metadata.id, listMode: 'hide' }]
                        }
                      })
                    ).pipe(
                      map((mil) => {
                        if (mil instanceof Array) {
                          // No-op
                          console.warn('Multiple map image sub layers unsupported');
                          return undefined;
                        } else {
                          return mil;
                        }
                      })
                    );
                  }

                  if (serverLayer) {
                    return of(serverLayer);
                  }
                }),
                map((layer) => {
                  layer.id = l.info.layerId;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (layer as unknown as any).description = l.info.description;
                  layer.opacity = l.info.drawingInfo.opacity;
                  layer.title = l.info.name;

                  return layer;
                })
              )
            );
            // TODO: Remove many of the below cases since the above one generates a layer directly from the GIS Server JSON
          } else if (l.info.type === 'feature') {
            return await new this._modules.featureLayer({
              id: l.info.layerId,
              url: l.url,
              title: l.info.name,
              opacity: l.info.drawingInfo.opacity,
              visible: l.info.loadOnInit !== undefined ? l.info.loadOnInit : true,
              description: l.info.description
            } as esri.FeatureLayerProperties);
          } else if (l.info.type === 'group') {
            // If l.layers is undefined, it means this layer needs to be loaded from the remote service.
            // instead of making a recursive call.
            if (l.layers === undefined) {
              const layer = await this._modules.layer.fromArcGISServerUrl({
                url: l.url
              });

              layer.id = l.info.layerId;
              layer.opacity = l.info.drawingInfo.opacity;
              layer.title = l.info.name;
              layer.visible = l.info.loadOnInit !== undefined ? l.info.loadOnInit : true;

              // Use bracket notation here because description is not a native prop
              // and Typescript will nag about it.
              layer['description'] = l.info.description;

              return layer;
            } else {
              return await this._generateGroupLayers(l.layers, l.info.name);
            }
          } else if (l.info.type === 'map-image') {
            const url = l.url.split('/');
            const id = parseInt(url.pop(), 10);

            return await new this._modules.mapImageLayer({
              id: l.info.layerId,
              url: url.join('/'),
              title: l.info.name,
              opacity: l.info.drawingInfo.opacity,
              visible: l.info.loadOnInit !== undefined ? l.info.loadOnInit : true,
              sublayers: [
                {
                  id: id,
                  listMode: 'hide'
                }
              ],
              description: l.info.description
            } as esri.MapImageLayerProperties);
          } else if (l.info.type === 'graphics') {
            const g = l.graphics.map((gs) => {
              return this._modules.graphic.fromJSON(gs);
            });

            return await new this._modules.graphicsLayer({
              title: l.info.name,
              id: l.info.layerId,
              graphics: g,
              listMode: 'show',
              visible: l.info.loadOnInit !== undefined ? l.info.loadOnInit : true,
              description: l.info.description,
              popupComponent: ViewerBasePopupComponent
            } as esri.GraphicsLayerProperties);
          } else {
            console.warn(`Layer with object structure could not be generated:`, l);
            return undefined;
          }
        })
        .filter((l) => l !== undefined)
    );

    const groupLayer = new this._modules.groupLayer({
      id: idHash,
      title: snapshotOrScenarioTitle,
      visibilityMode: 'independent',
      layers: layers
    });

    return groupLayer;
  }

  /**
   * Accepts a timeline event object and extracts the layer ID's from its definition,
   * used to remove all of the resolved layers from the map if they exist.
   */
  private _removeTimelineEventLayers(event: TypedSnapshotOrScenario): void {
    const reversedLayers = [...event.layers].reverse();
    const idHash = this._generateGroupLayerId(reversedLayers);

    const prevLayers = event.layers
      .map(() => {
        return this._map.layers.find((ml) => {
          // Find layer ID from either a snapshot guid array, or the actual layer object id

          return ml.id === idHash;
        });
      })
      .filter((r) => r !== undefined);

    if (prevLayers.length > 0) {
      this._map.removeMany(prevLayers);
    }
  }

  private _generateGroupLayerId(layers: DeepPartial<CPALayer>[]) {
    // Join all sub layer ids into a string, then hash it
    const totalSubLayerIds = layers
      .map((l) => {
        return l.info.layerId;
      })
      .join();

    return md5(totalSubLayerIds);
  }

  public getLayerForScenarioGuid(scenarioGuid: string) {
    return this.sc.getLayerForScenario(scenarioGuid).toPromise();
  }
}

type ISnapshotOrScenario = ISnapshotPartial | IScenarioResolved;

export type TypedSnapshotOrScenario = ISnapshotOrScenario & { type: 'scenario' | 'snapshot' };
