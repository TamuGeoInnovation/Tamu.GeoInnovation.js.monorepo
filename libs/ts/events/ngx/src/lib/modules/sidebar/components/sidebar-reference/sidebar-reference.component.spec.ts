import type { Mock } from 'vitest';
// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import { EventSettingsService } from '../../../../services/settings/event-settings.service';

import { SearchSelection, SearchSource } from '@tamu-gisc/ui-kits/ngx/search';

import {
  TAILGATING_LAYERS,
  TailgatingColdLayerSources,
  TailgatingConfiguration
} from '../../../../definitions/tailgating.definitions';
import { EventService } from '../../../../services/event/event.service';
import { SidebarReferenceComponent } from './sidebar-reference.component';

type Attributes = Record<string, unknown>;

/**
 * A feature layer on the map. A query by object id answers with that feature only; a query by a `where`
 * clause answers with every feature, as the clause the service writes matches them all here.
 */
function fakeLayer(id: string, features: Attributes[]) {
  return {
    id,
    objectIdField: 'OBJECTID',
    fields: ['OBJECTID', 'tent_id', 'name', 'zone_ID'].map((name) => ({ name })),
    load: async () => undefined,
    // An unfiltered layer's query, as ArcGIS's `createQuery()` gives it.
    createQuery: () => ({ where: '1=1' }),
    queryFeatures: async (query: { objectIds?: number[] }) => ({
      features: features
        .filter((attributes) => !query.objectIds || query.objectIds.includes(attributes['OBJECTID'] as number))
        .map((attributes) => ({ attributes: { ...attributes } }))
    })
  };
}

/** The tailgating map, drawn with these layers, and the sidebar beside it. */
function tailgatingMapWith(layers: Array<ReturnType<typeof fakeLayer>>) {
  const selectFeatures = vi.fn();
  const toast = vi.fn();

  const eventService = Object.assign(Object.create(EventService.prototype) as EventService, {
    mapService: { selectFeatures, loadLayers: async () => undefined },
    _map: { findLayerById: (id: string) => layers.find((layer) => layer.id === id), allLayers: layers },
    _sources: TailgatingColdLayerSources
  });

  const sidebar = Object.assign(Object.create(SidebarReferenceComponent.prototype) as SidebarReferenceComponent, {
    configuration: TailgatingConfiguration,
    eventService,
    ns: { toast },
    helper: { handleSearchResultFeatureSelection: vi.fn() }
  });

  return { eventService, sidebar, selectFeatures, toast };
}

/** What the search component emits when a result from one of the map's own sources is picked. */
function picked(sourceId: string, attributes: Attributes): SearchSelection<unknown> {
  const source = (TailgatingConfiguration.searchSources ?? []).find((s) => s.source === sourceId) as SearchSource;

  return new SearchSelection({
    type: 'click',
    selection: { attributes },
    result: { name: source.name, features: [], breadcrumbs: { source, value: '' } } as never
  });
}

/** Lets the selection the sidebar started finish: every fake here answers at once. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

/** The layer and object id of the feature the map selected, if any. */
function selectedFeature(selectFeatures: Mock) {
  const attributes = selectFeatures.mock.calls[0]?.[0]?.graphics?.[0]?.attributes;

  return attributes && { layer: attributes['__featureLayerId'], objectId: attributes['OBJECTID'] };
}

/**
 * Picking a tent or named area in the sidebar search opens that feature (#1788). Each layer below holds
 * a feature with the same value as one on another layer - a tent id or an area name can repeat - so
 * matching the value picks whichever layer is searched first.
 */
describe('SidebarReferenceComponent, picking one of the map own results', () => {
  const tent = { tent_id: 'A1' };
  const area = { name: 'Lot E', zone_ID: 'X-1' };

  it.each([
    ['tailgating-tent-search', TAILGATING_LAYERS.TENTS, 11, tent],
    ['tailgating-simpson-tent-search', TAILGATING_LAYERS.SIMPSON_TENTS, 21, tent],
    ['tailgating-aggie-park-area-search', TAILGATING_LAYERS.AGGIE_PARK, 31, area],
    ['tailgating-west-campus-area-search', TAILGATING_LAYERS.WEST_CAMPUS, 41, area]
  ])('opens the picked feature itself, from %s', async (sourceId, layerId, objectId, attributes) => {
    const { sidebar, selectFeatures, toast } = tailgatingMapWith([
      fakeLayer(TAILGATING_LAYERS.TENTS, [{ OBJECTID: 11, ...tent }]),
      fakeLayer(TAILGATING_LAYERS.SIMPSON_TENTS, [{ OBJECTID: 21, ...tent }]),
      fakeLayer(TAILGATING_LAYERS.AGGIE_PARK, [{ OBJECTID: 31, ...area }]),
      fakeLayer(TAILGATING_LAYERS.WEST_CAMPUS, [{ OBJECTID: 41, ...area }])
    ]);

    await sidebar.onSearchResult(picked(sourceId, { OBJECTID: objectId, ...attributes }));
    await settle();

    expect(selectedFeature(selectFeatures)).toEqual({ layer: layerId, objectId });
    expect(selectFeatures.mock.calls[0][0].shouldShowPopup).toBe(true);
    expect(toast).not.toHaveBeenCalled();
  });

  it('opens the tent with its popup text, as a ?tent= link does', async () => {
    const { sidebar, selectFeatures } = tailgatingMapWith([
      fakeLayer(TAILGATING_LAYERS.TENTS, [{ OBJECTID: 11, tent_id: 'O12', lawn: 'Ortega Lawn' }])
    ]);

    await sidebar.onSearchResult(picked('tailgating-tent-search', { OBJECTID: 11, tent_id: 'O12' }));
    await settle();

    const shown = selectFeatures.mock.calls[0][0];

    expect(shown.graphics[0].attributes).toMatchObject({ name: 'Tent O12', description: 'Ortega Lawn' });
    expect(shown.popupComponent).toBe(
      TailgatingColdLayerSources.find((s) => s.id === TAILGATING_LAYERS.TENTS)?.popupComponent
    );
  });

  it('says so when the picked feature is no longer on the map', async () => {
    const { sidebar, selectFeatures, toast } = tailgatingMapWith([fakeLayer(TAILGATING_LAYERS.TENTS, [])]);

    await sidebar.onSearchResult(picked('tailgating-tent-search', { OBJECTID: 11, tent_id: 'O12' }));
    await settle();

    expect(selectFeatures).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledTimes(1);
    expect(toast.mock.calls[0][0].message).toContain('Tent O12');
  });

  it('opens nothing from an earlier drawing of the map once it is drawn again without that layer', async () => {
    const { eventService, sidebar, selectFeatures, toast } = tailgatingMapWith([
      fakeLayer(TAILGATING_LAYERS.TENTS, [{ OBJECTID: 11, tent_id: 'O12' }])
    ]);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    eventService.specialEventLayerReferences = [];
    await eventService.drawEvent();
    error.mockRestore();

    await sidebar.onSearchResult(picked('tailgating-tent-search', { OBJECTID: 11, tent_id: 'O12' }));
    await settle();

    expect(selectFeatures).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledTimes(1);
  });
});

/** Which sources the sidebar search is given, for the three kinds of map. */
describe('SidebarReferenceComponent search sources', () => {
  const campusBuilding = { source: 'building', searchActive: true } as SearchSource;

  function searchSourcesFor(configuration: unknown, configured: SearchSource[]) {
    const settings = {
      queryParamsFromSettings: null,
      eventConfiguration: () => ({ configuration }),
      configuredSearchSources: () => configured,
      settings: () => ({}),
      eventOptions: () => [],
      eventLayerSources: () => [],
      getMergedSettings: () => ({})
    } as unknown as EventSettingsService;

    const sidebar = Object.assign(Object.create(SidebarReferenceComponent.prototype) as SidebarReferenceComponent, {
      eventSettingsService: settings
    });

    sidebar.ngOnInit();

    return sidebar.searchSources?.map((source) => source.source);
  }

  it('searches the map own sources and the campus ones, the map own first, when it asks for both', () => {
    const own = TailgatingConfiguration.searchSources ?? [];

    expect(searchSourcesFor(TailgatingConfiguration, [...own, campusBuilding])).toEqual([
      ...own.map((source) => source.source),
      'building'
    ]);
  });

  it('searches only the map own sources otherwise, as a satellite campus does', () => {
    const own = [{ source: 'galveston-building', searchActive: true } as SearchSource];

    expect(searchSourcesFor({ searchSources: own }, [...own, campusBuilding])).toEqual(['galveston-building']);
  });

  it('keeps the application search for a map whose own sources are only for its links', () => {
    const own = [{ source: 'link-only', searchActive: false } as SearchSource];

    expect(searchSourcesFor({ searchSources: own }, [...own, campusBuilding])).toBeUndefined();
  });
});
