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
import { AVP_PARKING_LAYERS, AVPParkingColdLayerSources } from '../../definitions/avp-parking.definitions';
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
 * A feature lookup that fails leaves the map's chosen view and focus flash in place (#1953).
 *
 * `drawEvent` selected the linked feature, then framed the chosen view, then flashed the focus feature,
 * all in one `try`, so a lookup that threw - a service erroring, as Transportation Services' did on
 * about half its queries in October (#1951) - skipped the other two. Neither depends on the feature.
 */
describe('EventService, drawing a map whose feature lookup fails', () => {
  it('still applies the chosen view and flashes the focus feature, and reports the failure', async () => {
    const failure = new Error('Unable to complete operation.');
    const selectFeatureFromUrl = vi.fn().mockRejectedValue(failure);
    const applySelectedChoiceView = vi.fn().mockResolvedValue(undefined);
    const flashFocusFeature = vi.fn().mockResolvedValue(undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const eventService = Object.assign(Object.create(EventService.prototype) as EventService, {
      eventSettingsService: { eventLayerSources: () => BreakSummerParkingTs.sources },
      mapService: { loadLayers: async () => undefined },
      specialEventLayerReferences: [BreakSummerParkingTs.sources[0].id],
      visibleOptions: [],
      settings: {},
      applyExclusiveLayerVisibility: async () => undefined,
      selectFeatureFromUrl,
      applySelectedChoiceView,
      flashFocusFeature
    });

    await eventService.drawEvent();
    const logged = error.mock.calls.map((call) => call.at(-1));
    error.mockRestore();

    expect(selectFeatureFromUrl).toHaveBeenCalledTimes(1);
    expect(applySelectedChoiceView).toHaveBeenCalledTimes(1);
    expect(flashFocusFeature).toHaveBeenCalledTimes(1);
    // Logged once and not retried, so an outage stays visible.
    expect(logged).toEqual([failure]);
  });
});

/**
 * A kiosk map shows only its own layers (#1392).
 *
 * Every event map loads the main map's layers as well as its own. The dining kiosk did too, so it drew
 * campus layers it has no use for, and its dining layer raced the main map's copy of the same id: only
 * one layer per id reaches the map, and on most loads the one drawn was hidden.
 */
describe('EventService', () => {
  const kiosks = EventDefinitions.filter((definition) => definition.discover?.type === 'kiosk');

  it('finds the kiosk maps to check', () => {
    expect(kiosks.map((definition) => definition.configuration?.id)).toEqual(
      expect.arrayContaining(['dining', 'football-tailgating'])
    );
  });

  it.each(kiosks.map((definition) => [definition.configuration?.id, definition] as const))(
    "builds the %s kiosk map with none of the main map's layers",
    (_id, definition) => {
      expect(mainLayersLoadedFor(definition)).toEqual([]);
    }
  );

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

  /** The map service's own lookup of a link, against the application's search sources (#1969). */
  let selectFeaturesFromUrl = vi.fn();

  /** An event map's settings, with the `lot` source as the application configures it: `?lot=` matched on `LotName`. */
  const linkSettings = () =>
    ({
      eventConfiguration: () => undefined,
      eventOptions: () => [],
      settings: () => ({}),
      getVisibleOptions: () => [],
      eventLayerReferences: () => ({}),
      configuredSearchSources: () => [{ urlQueryParam: 'lot', queryParams: { where: { keys: ['LotName'] } } }]
    }) as unknown as EventSettingsService;

  /** Opens `search` on a map holding `layer`, and returns the object ids of the features selected. */
  async function selectedBy(search: string, layer: FeatureLayer): Promise<number[]> {
    const selectFeatures = vi.fn();
    selectFeaturesFromUrl = vi.fn();

    const settings = linkSettings();

    TestBed.resetTestingModule().configureTestingModule({
      providers: [
        { provide: EnvironmentService, useValue: {} },
        { provide: EsriModuleProviderService, useValue: {} },
        { provide: LayerSourcesService, useValue: {} },
        { provide: EsriMapService, useValue: { store: NEVER, selectFeatures, selectFeaturesFromUrl } },
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

  /**
   * A `?lot=` link on an event map has one answer, and the map's own layers give it first (#1969).
   *
   * The map service selected the link's feature itself as soon as the map loaded, from the application's
   * search sources - College Station's lots - while this service looked for it among the map's own layers.
   * Both selected, and whichever answered last won: the main map's Lot 100j opened first on nearly every
   * load, and stayed whenever the map's own service was slow.
   */
  describe('on an event map, where the main map has the same lot (#1969)', () => {
    it("takes the link from the map service, so the map service does not select the main map's lot itself", () => {
      const mapService = { store: NEVER, selectFeatures: vi.fn(), selectsFeaturesFromUrlOnLoad: true };

      TestBed.resetTestingModule().configureTestingModule({
        providers: [
          { provide: EnvironmentService, useValue: {} },
          { provide: EsriModuleProviderService, useValue: {} },
          { provide: LayerSourcesService, useValue: {} },
          { provide: EsriMapService, useValue: mapService },
          { provide: EventSettingsService, useValue: linkSettings() },
          EventService
        ]
      });
      TestBed.inject(EventService);

      expect(mapService.selectsFeaturesFromUrlOnLoad).toBe(false);
    });

    it("does not fall back to the application's lot when one of the map's own layers has it", async () => {
      expect(await selectedBy('?lot=100j', filteredLayer([[32270, '100j', 'M/C']]))).toEqual([32270]);
      expect(selectFeaturesFromUrl).not.toHaveBeenCalled();
    });

    it("falls back to the application's lot when none of the map's own layers has it", async () => {
      expect(await selectedBy('?lot=100j', filteredLayer([[26692, '100j', 'H/C']]))).toEqual([]);
      expect(selectFeaturesFromUrl).toHaveBeenCalledTimes(1);
    });

    it("falls back to the application's lot when the map's own layer cannot be asked", async () => {
      const layer = filteredLayer([[32270, '100j', 'M/C']]);
      vi.spyOn(layer, 'queryFeatures').mockRejectedValue(new Error('the service did not answer'));

      expect(await selectedBy('?lot=100j', layer)).toEqual([]);
      expect(selectFeaturesFromUrl).toHaveBeenCalledTimes(1);
    });
  });

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

type Attributes = Record<string, unknown>;

/** The main map's parking lot source, which gives every event map its `?lot=` links. */
const PARKING_LOT_SOURCE = factory({ environment: 'dev' }).SearchSources.filter((source) => source.source === 'parking-lot');

/**
 * A feature layer named `id`, with these fields, holding these features. A query by object id answers
 * with that feature; a query by a `where` clause is evaluated as the matcher writes it -
 * `UPPER(<field>) = '<VALUE>'` joined by `OR` - against each feature's attributes, so a clause naming a
 * field the layer does not have matches nothing, as on the service.
 */
function lotLayer(id: string, objectIdField: string, fields: string[], features: Attributes[]) {
  const where: string[] = [];

  const matchesWhere = (clause: string, attributes: Attributes) =>
    clause.split(' OR ').some((part) => {
      const [, field, value] = part.match(/^UPPER\((.+)\) = '(.*)'$/) ?? [];

      return field !== undefined && `${attributes[field] ?? ''}`.toUpperCase() === value;
    });

  return {
    id,
    objectIdField,
    fields: fields.map((name) => ({ name })),
    where,
    load: async () => undefined,
    // As ArcGIS answers for a layer with no filter.
    createQuery: () => ({ where: '1=1' }),
    queryFeatures: async (query: { objectIds?: number[]; where?: string }) => {
      // `1=1` is what an unfiltered layer's `createQuery()` carries, not a lookup.
      const clause = query.where === '1=1' ? undefined : query.where;

      if (clause) {
        where.push(clause);
      }

      return {
        features: features
          .filter((attributes) => !query.objectIds || query.objectIds.includes(attributes[objectIdField] as number))
          .filter((attributes) => !clause || matchesWhere(clause, attributes))
          .map((attributes) => ({ attributes: { ...attributes } }))
      };
    }
  };
}

/** An event map drawn with `layers`, opened at `search`; returns the layer and object id it selected, if any. */
async function selectedFromUrl(search: string, sources: LayerSource[], layers: Array<ReturnType<typeof lotLayer>>) {
  const selectFeatures = vi.fn();

  const eventService = Object.assign(Object.create(EventService.prototype) as EventService, {
    mapService: { selectFeatures },
    eventSettingsService: { configuredSearchSources: () => PARKING_LOT_SOURCE },
    _map: { findLayerById: (id: string) => layers.find((layer) => layer.id === id), allLayers: layers }
  });

  window.history.replaceState(null, '', `/parking/map${search}`);

  try {
    await (eventService as unknown as { selectFeatureFromUrl(s: LayerSource[]): Promise<void> }).selectFeatureFromUrl(
      sources
    );
  } finally {
    window.history.replaceState(null, '', '/');
  }

  const attributes = selectFeatures.mock.calls[0]?.[0]?.graphics?.[0]?.attributes;

  return attributes && { layer: attributes['__featureLayerId'], objectId: attributes['__featureObjectId'] };
}

/**
 * A `?lot=` link opens the lot where the service names its fields by table (#1952).
 *
 * Fourteen of Transportation Services' parking services join several tables, so a lot's name is
 * `GIS.TS.ParkingLots.LotName`, not `LotName`. The lot source matches on `LotName`, `Name` and
 * `FAC_CODE`, compared whole, so on those maps no layer could answer and the link opened nothing.
 */
describe('EventService, a lot link on a map whose fields are named by table', () => {
  /** The AVP parking lots layer's fields as the service lists them (in part), and two of its lots. */
  const AVP_FIELDS = [
    'GIS.TS.ParkingLots.OBJECTID',
    'GIS.TS.ParkingLots.CIT_CODE',
    'GIS.TS.ParkingLots.FAC_CODE',
    'GIS.TS.ParkingLots.LotName',
    'GIS.TS.ParkingLots.Name',
    'GIS.TS.Lot_Use.LotName',
    'GIS.TS.Lot_Use.AVP_Lot',
    'GIS.TS.Lot_Notes.AVPN'
  ];
  const AVP_OID = 'GIS.TS.ParkingLots.OBJECTID';
  const AVP_LOTS: Attributes[] = [
    {
      [AVP_OID]: 26135,
      'GIS.TS.ParkingLots.Name': '43',
      'GIS.TS.ParkingLots.LotName': 'Lot 043',
      'GIS.TS.ParkingLots.FAC_CODE': '043'
    },
    {
      [AVP_OID]: 26338,
      'GIS.TS.ParkingLots.Name': '100j',
      'GIS.TS.ParkingLots.LotName': 'Lot 100j',
      'GIS.TS.ParkingLots.FAC_CODE': '100'
    }
  ];

  const avpLayer = () => lotLayer(AVP_PARKING_LAYERS.AVP_PARKING_LOTS, AVP_OID, AVP_FIELDS, AVP_LOTS);
  const AVP_100J = { layer: AVP_PARKING_LAYERS.AVP_PARKING_LOTS, objectId: 26338 };

  it('finds the lot source the links are read from', () => {
    expect(PARKING_LOT_SOURCE.map((source) => source.queryParams?.where?.keys)).toEqual([['LotName', 'Name', 'FAC_CODE']]);
  });

  it.each(['?lot=100j', '?lot=100J', '?Lot=100j', '?lot=Lot%20100j'])(
    'opens Lot 100j on the AVP map from %s',
    async (search) => {
      expect(await selectedFromUrl(search, AVPParkingColdLayerSources, [avpLayer()])).toEqual(AVP_100J);
    }
  );

  it('opens the same lot from ?lot= as from a ?feature= link shared before, on the same map', async () => {
    const link = `?feature=${AVP_PARKING_LAYERS.AVP_PARKING_LOTS}:26338`;
    const byFeature = await selectedFromUrl(link, AVPParkingColdLayerSources, [avpLayer()]);
    const byLot = await selectedFromUrl('?lot=100j', AVPParkingColdLayerSources, [avpLayer()]);

    expect(byFeature).toEqual(AVP_100J);
    expect(byLot).toEqual(byFeature);
  });

  it('lets a ?feature= link win over a ?lot= link in the same address, as before', async () => {
    const link = `?feature=${AVP_PARKING_LAYERS.AVP_PARKING_LOTS}:26135&lot=100j`;

    expect(await selectedFromUrl(link, AVPParkingColdLayerSources, [avpLayer()])).toEqual({
      layer: AVP_PARKING_LAYERS.AVP_PARKING_LOTS,
      objectId: 26135
    });
  });

  it("queries the layer's own field names", async () => {
    const layer = avpLayer();

    await selectedFromUrl('?lot=100j', AVPParkingColdLayerSources, [layer]);

    expect(layer.where, 'the layer was never queried by name').toHaveLength(1);
    expect(layer.where[0]).toContain(`UPPER(GIS.TS.ParkingLots.LotName) = '100J'`);
    expect(layer.where[0]).not.toMatch(/UPPER\(LotName\)/);
  });

  it('still opens a lot on a map whose fields are not named by table', async () => {
    const layer = lotLayer(
      'plain-lots',
      'OBJECTID',
      ['OBJECTID', 'LotName', 'Spc_Type'],
      [{ OBJECTID: 7, LotName: '100j' }]
    );
    const source = { type: 'feature', id: 'plain-lots' } as LayerSource;

    expect(await selectedFromUrl('?lot=100j', [source], [layer])).toEqual({ layer: 'plain-lots', objectId: 7 });
  });

  it("keeps the source's field order: a layer with LotName is asked before one with only FAC_CODE", async () => {
    const byFacCode = lotLayer(
      'by-fac-code',
      'OBJECTID',
      ['OBJECTID', 'GIS.TS.Spaces.FAC_CODE'],
      [{ OBJECTID: 1, 'GIS.TS.Spaces.FAC_CODE': 'Lot 100j' }]
    );
    const byLotName = lotLayer(
      'by-lot-name',
      'OBJECTID',
      ['OBJECTID', 'GIS.TS.ParkingLots.LotName'],
      [{ OBJECTID: 2, 'GIS.TS.ParkingLots.LotName': 'Lot 100j' }]
    );
    const sources = [
      { type: 'feature', id: 'by-fac-code' },
      { type: 'feature', id: 'by-lot-name' }
    ] as LayerSource[];

    expect(await selectedFromUrl('?lot=Lot%20100j', sources, [byFacCode, byLotName])).toEqual({
      layer: 'by-lot-name',
      objectId: 2
    });
  });
});
