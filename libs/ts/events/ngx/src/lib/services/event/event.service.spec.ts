// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import { EventSettingsService } from '../settings/event-settings.service';

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NEVER } from 'rxjs';

import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';

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

  const settings = {
    eventConfiguration: () => definition,
    eventOptions: () => definition.options,
    settings: () => ({}),
    getVisibleOptions: () => [],
    eventLayerReferences: () => definition.references,
    eventLayerSources: () => definition.sources
  } as unknown as EventSettingsService;

  // The map and layer source services are the real ones, built from the fakes above.
  TestBed.resetTestingModule().configureTestingModule({
    providers: [
      { provide: EnvironmentService, useValue: env },
      { provide: EsriModuleProviderService, useValue: {} },
      { provide: Router, useValue: {} },
      { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
      { provide: SearchService, useValue: {} },
      { provide: HttpClient, useValue: {} },
      { provide: EventSettingsService, useValue: settings },
      LayerSourcesService,
      EsriMapService,
      EventService
    ]
  });

  TestBed.inject(EventService);
  const mapService = TestBed.inject(EsriMapService);

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

  /**
   * A satellite campus map shows only its own campus (#1910).
   *
   * Galveston, McAllen and DC loaded every College Station layer too: 26 on DC, ten of them failing
   * there, and RNS Spaces' 44,980 points, which left the DC map painting for 100 seconds on ArcGIS 5.1.
   * None of them can show anything on another campus.
   */
  const satelliteCampuses = EventDefinitions.filter((definition) => definition.discover?.type === 'satellite-campus');

  it('finds the satellite campus maps to check', () => {
    expect(satelliteCampuses.map((definition) => definition.configuration?.id)).toEqual(
      expect.arrayContaining(['galveston', 'mcallen', 'dc-bush-school'])
    );
  });

  it.each(satelliteCampuses.map((definition) => [definition.configuration?.id, definition] as const))(
    "builds the %s campus map with none of the main map's layers",
    (_id, definition) => {
      expect(mainLayersLoadedFor(definition)).toEqual([]);
    }
  );

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

/**
 * A link selects only a feature the map draws (#1954).
 *
 * Motorcycle Parking draws one layer filtered to motorcycle spaces with a `definitionExpression`, and
 * `?lot=100j` selected an accessible space in that lot, which the map does not draw. ArcGIS applies a
 * layer's `definitionExpression` to what it draws and to `layer.createQuery()`, but a query passed to
 * `queryFeatures` is sent as it is. The layer here is a real ArcGIS layer, so it is ArcGIS's own query
 * behaviour being tested, not a stand-in for it.
 */
describe('EventService: selecting a feature from a link', () => {
  const LAYER_ID = 'motorcycle-parking-space';

  /** A motorcycle-parking layer drawing only `M/C` spaces, holding these spaces as `[objectId, lot, type]`. */
  function filteredLayer(spaces: Array<[number, string, string]>): FeatureLayer {
    return new FeatureLayer({
      id: LAYER_ID,
      source: spaces.map(
        ([OBJECTID, LotName, Spc_Type]) =>
          new Graphic({ geometry: new Point({ x: -96.34, y: 30.6 }), attributes: { OBJECTID, LotName, Spc_Type } })
      ),
      objectIdField: 'OBJECTID',
      fields: [
        { name: 'OBJECTID', type: 'oid' },
        { name: 'LotName', type: 'string' },
        { name: 'Spc_Type', type: 'string' }
      ],
      geometryType: 'point',
      spatialReference: { wkid: 4326 },
      definitionExpression: `Spc_Type = 'M/C'`
    });
  }

  /** Opens `search` on a map holding `layer`, and returns the object ids of the features selected. */
  async function selectedBy(search: string, layer: FeatureLayer): Promise<number[]> {
    const selectFeatures = vi.fn();

    const settings = {
      eventConfiguration: () => undefined,
      eventOptions: () => [],
      settings: () => ({}),
      getVisibleOptions: () => [],
      eventLayerReferences: () => ({}),
      // The `lot` source as the application configures it: `?lot=` matched on `LotName`.
      configuredSearchSources: () => [{ urlQueryParam: 'lot', queryParams: { where: { keys: ['LotName'] } } }]
    } as unknown as EventSettingsService;

    TestBed.resetTestingModule().configureTestingModule({
      providers: [
        { provide: EnvironmentService, useValue: {} },
        { provide: EsriModuleProviderService, useValue: {} },
        { provide: LayerSourcesService, useValue: {} },
        { provide: EsriMapService, useValue: { store: NEVER, selectFeatures } },
        { provide: EventSettingsService, useValue: settings },
        EventService
      ]
    });

    const service = TestBed.inject(EventService) as unknown as {
      _map: { findLayerById: (id: string) => FeatureLayer | undefined };
      selectFeatureFromUrl: (sources: LayerSource[]) => Promise<void>;
    };

    service._map = { findLayerById: (id) => (id === LAYER_ID ? layer : undefined) };
    window.history.replaceState(null, '', `/parking/motorcycle-parking/map${search}`);

    await service.selectFeatureFromUrl([{ type: 'feature', id: LAYER_ID } as LayerSource]);

    return selectFeatures.mock.calls.flatMap(([{ graphics }]) =>
      (graphics as Graphic[]).map((graphic) => graphic.attributes.OBJECTID as number)
    );
  }

  afterEach(() => window.history.replaceState(null, '', '/'));

  it("selects nothing for a ?lot= link whose only match is outside the map's filter", async () => {
    expect(await selectedBy('?lot=100j', filteredLayer([[26692, '100j', 'H/C']]))).toEqual([]);
  });

  it('selects the space the map draws, not the first match, for a ?lot= link', async () => {
    const layer = filteredLayer([
      [26692, '100j', 'H/C'],
      [32270, '100j', 'M/C']
    ]);

    expect(await selectedBy('?lot=100j', layer)).toEqual([32270]);
  });

  it("selects nothing for a ?feature= link naming a feature outside the map's filter", async () => {
    const layer = filteredLayer([
      [26692, '100j', 'H/C'],
      [32270, '100j', 'M/C']
    ]);

    expect(await selectedBy(`?feature=${LAYER_ID}:26692`, layer)).toEqual([]);
  });

  it('still selects the feature a ?feature= link names when the map draws it', async () => {
    const layer = filteredLayer([
      [26692, '100j', 'H/C'],
      [32270, '100j', 'M/C']
    ]);

    expect(await selectedBy(`?feature=${LAYER_ID}:32270`, layer)).toEqual([32270]);
  });
});
