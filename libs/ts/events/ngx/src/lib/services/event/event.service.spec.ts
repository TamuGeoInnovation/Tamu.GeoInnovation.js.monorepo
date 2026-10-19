// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import { EventSettingsService } from '../settings/event-settings.service';

import { TestBed } from '@angular/core/testing';
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
    queryFeatures: async (query: { objectIds?: number[]; where?: string }) => {
      if (query.where) {
        where.push(query.where);
      }

      return {
        features: features
          .filter((attributes) => !query.objectIds || query.objectIds.includes(attributes[objectIdField] as number))
          .filter((attributes) => !query.where || matchesWhere(query.where, attributes))
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
    expect(PARKING_LOT_SOURCE.map((source) => source.queryParams?.where?.keys)).toEqual([
      ['LotName', 'Name', 'FAC_CODE']
    ]);
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
    const layer = lotLayer('plain-lots', 'OBJECTID', ['OBJECTID', 'LotName', 'Spc_Type'], [
      { OBJECTID: 7, LotName: '100j' }
    ]);
    const source = { type: 'feature', id: 'plain-lots' } as LayerSource;

    expect(await selectedFromUrl('?lot=100j', [source], [layer])).toEqual({ layer: 'plain-lots', objectId: 7 });
  });

  it("keeps the source's field order: a layer with LotName is asked before one with only FAC_CODE", async () => {
    const byFacCode = lotLayer('by-fac-code', 'OBJECTID', ['OBJECTID', 'GIS.TS.Spaces.FAC_CODE'], [
      { OBJECTID: 1, 'GIS.TS.Spaces.FAC_CODE': 'Lot 100j' }
    ]);
    const byLotName = lotLayer('by-lot-name', 'OBJECTID', ['OBJECTID', 'GIS.TS.ParkingLots.LotName'], [
      { OBJECTID: 2, 'GIS.TS.ParkingLots.LotName': 'Lot 100j' }
    ]);
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
