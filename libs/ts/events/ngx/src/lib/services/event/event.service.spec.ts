// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import { EventSettingsService } from '../settings/event-settings.service';

import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { LayerSource } from '@tamu-gisc/common/types';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { SearchService } from '@tamu-gisc/ui-kits/ngx/search';
import { factory } from '@tamu-gisc/aggiemap/ngx/common';
import { EsriMapService, EsriModuleProviderService, LayerSourcesService } from '@tamu-gisc/maps/esri';

import { AggiemapCustomMapConfiguration } from '../../interfaces/special-event.interface';
import { EventDefinitions } from '../../definitions/all.definitions';
import { BreakSummerParkingTs } from '../../definitions/break-summer.definitions';
import { DiningKioskTs } from '../../definitions/dining.definitions';
import { EventService } from './event.service';

/** The main map's layers, as the environment provides them to every map. */
const MAIN_LAYERS = factory({ environment: 'dev' }).LayerSources;

/** Every layer id in a set of sources, including those nested in group layers. */
function layerIds(sources: LayerSource[]): string[] {
  return sources.flatMap((source) => [
    source.id,
    ...layerIds((source as unknown as { sources?: LayerSource[] }).sources ?? [])
  ]);
}

/** The main map's layers that a map built for this definition loads, besides its own. */
function mainLayersLoadedFor(definition: AggiemapCustomMapConfiguration): string[] {
  const env = {
    value: (key: string) => (key === 'LayerSources' ? MAIN_LAYERS : undefined)
  } as unknown as EnvironmentService;

  const mapService = new EsriMapService(
    {} as EsriModuleProviderService,
    {} as Router,
    { snapshot: { queryParams: {} } } as unknown as ActivatedRoute,
    {} as SearchService,
    env,
    {} as HttpClient,
    new LayerSourcesService(env)
  );

  const settings = {
    eventConfiguration: () => definition,
    eventOptions: () => definition.options,
    settings: () => ({}),
    getVisibleOptions: () => [],
    eventLayerReferences: () => definition.references,
    eventLayerSources: () => definition.sources
  } as unknown as EventSettingsService;

  new EventService(env, {} as EsriModuleProviderService, mapService, settings, new LayerSourcesService(env));

  return mapService.filterLayerSources(undefined, { params: true }).map((source) => source.id);
}

/**
 * A kiosk map shows only its own layers (#1392).
 *
 * Every event map loads the main map's layers as well as its own. The dining kiosk did too, so it drew
 * campus layers it has no use for, and its dining layer raced the main map's copy of the same id: only
 * one layer per id reaches the map, and on most loads the one drawn was hidden.
 */
describe('EventService', () => {
  it("builds a kiosk map with none of the main map's layers", () => {
    expect(mainLayersLoadedFor(DiningKioskTs)).toEqual([]);
  });

  it("builds any other event map with the main map's layers, as before", () => {
    expect(mainLayersLoadedFor(BreakSummerParkingTs)).toEqual(MAIN_LAYERS.map((source) => source.id));
  });

  /**
   * An event map that defines a layer with an id the main map also uses gets whichever copy loads
   * first, which is how the dining kiosk lost its dining. Kiosk maps are exempt: they load no main-map
   * layers. Give an event map's layer an id of its own.
   */
  it('gives no event map a layer id the main map also uses', () => {
    const mainIds = new Set(layerIds(MAIN_LAYERS));

    const shared = EventDefinitions.filter((definition) => definition.discover?.type !== 'kiosk').flatMap((definition) =>
      layerIds(definition.sources ?? [])
        .filter((id) => mainIds.has(id))
        .map((id) => `${definition.configuration.id}: ${id}`)
    );

    expect(shared).toEqual([]);
  });
});
