import { Injectable, inject } from '@angular/core';
import { combineLatest, from, fromEventPattern, Observable, ReplaySubject } from 'rxjs';
import { map, scan, startWith, switchMap } from 'rxjs/operators';

import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import esri = __esri;

/**
 * Whether a layer gets a legend entry. A layer hidden from the Layers list never does, and a listed
 * layer can opt out with the Maps SDK's own `legendEnabled: false`, for something worth toggling
 * that needs no key of its own.
 */
export function showsInLegend(layer: esri.Layer): boolean {
  return layer.listMode !== 'hide' && (layer as esri.FeatureLayer).legendEnabled !== false;
}

@Injectable()
export class LegendService {
  private moduleProvider = inject(EsriModuleProviderService);
  private mapService = inject(EsriMapService);
  private env = inject(EnvironmentService);

  private _legendItems: ReplaySubject<Array<esri.ActiveLayerInfo>> = new ReplaySubject(1);
  public legendItems: Observable<Array<esri.ActiveLayerInfo>> = this._legendItems.asObservable();

  public legend(options?: LegendOptions) {
    const excludedLayerIds = new Set(options?.excludedLayerIds ?? []);
    const allowedLayerIds = options?.allowedLayerIds ?? [];
    const forceShowLayerIds = options?.forceShowLayerIds ?? [];
    const keepSwitchedOff = options?.keepSwitchedOff ?? false;

    const modules = this.moduleProvider.require(['LegendViewModel', 'reactiveUtils']) as Promise<
      [typeof esri.LegendViewModel, esri.reactiveUtils]
    >;

    return combineLatest([from(modules), this.mapService.store]).pipe(
      switchMap(
        ([[LegendViewModel, reactiveUtils], instances]: [
          [typeof esri.LegendViewModel, esri.reactiveUtils],
          MapServiceInstance
        ]) => {
          // Use respectLayerVisibility: false so that ESRI never removes a layer from
          // activeLayerInfos when its visibility changes. This keeps toggled-off layers
          // in the list so the legend-collection component can collapse (not destroy) them.
          const model = new LegendViewModel({
            view: instances.view,
            respectLayerVisibility: false
          });

          let handle: esri.Handle;

          // Watch every layer's visibility as well as the list itself. Because the list keeps hidden
          // layers, switching one on does not change it, so watching the list alone never listed a
          // layer that loaded hidden and was switched on later: every layer on the main map (#1857).
          const add = (handler) => {
            handle = reactiveUtils.watch(() => model.activeLayerInfos.map((info) => info.layer.visible), handler);
          };

          const remove = (): void => {
            handle.remove();
          };

          return fromEventPattern(add, remove).pipe(
            startWith(undefined),
            map(() => {
              return model.activeLayerInfos
                .filter((l) => showsInLegend(l.layer))
                .filter((l) => !excludedLayerIds.has(l.layer.id))
                .filter((l) => allowedLayerIds.length === 0 || allowedLayerIds.includes(l.layer.id))
                .toArray();
            }),
            // Track layers that have ever been visible. Initially-hidden layers (e.g. alternate
            // map-mode layers, base-map layers that are off by default) are never added to the
            // allowed set and therefore never appear in the legend. Once a layer has been seen
            // as visible it stays in the legend so that toggling it off from its legend title
            // collapses the entry instead of removing it (`keepSwitchedOff`). A legend without
            // such titles drops a layer switched off, which the map no longer draws (#1871).
            //
            // `forceShowLayerIds` seeds the set so those layers always appear, even when they
            // start hidden (e.g. an off-by-default layer in a mutually-exclusive group that
            // should still be listed in the legend so users know it exists).
            scan(
              (acc: { allowedIds: Set<string>; result: esri.ActiveLayerInfo[] }, items: esri.ActiveLayerInfo[]) => {
                const allowedIds = new Set(acc.allowedIds);
                items.filter((l) => l.layer.visible).forEach((l) => allowedIds.add(l.layer.id));
                const result = items.filter((l) =>
                  keepSwitchedOff ? allowedIds.has(l.layer.id) : l.layer.visible || forceShowLayerIds.includes(l.layer.id)
                );
                return { allowedIds, result };
              },
              { allowedIds: new Set<string>(forceShowLayerIds), result: [] as esri.ActiveLayerInfo[] }
            ),
            map((acc) => acc.result)
          );
        }
      )
    );
  }
}

interface LegendOptions {
  excludedLayerIds?: string[];
  allowedLayerIds?: string[];

  /**
   * Layer ids that should always appear in the legend, even if they start hidden and have never
   * been toggled on. Use for off-by-default layers that should still be listed (e.g. one half of a
   * mutually-exclusive group). Must also satisfy `allowedLayerIds`/`excludedLayerIds` filtering.
   */
  forceShowLayerIds?: string[];

  /**
   * Keep a layer listed after it is switched off, for a legend whose titles switch layers on and off
   * (`allowVisibilityToggle`): its collapsed title is how it is switched back on. Otherwise a layer
   * switched off leaves the legend, as it has left the map (#1871).
   */
  keepSwitchedOff?: boolean;
}
