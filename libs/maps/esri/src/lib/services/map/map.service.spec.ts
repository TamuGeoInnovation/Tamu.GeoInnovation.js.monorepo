import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { SearchService } from '@tamu-gisc/ui-kits/ngx/search';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LayerSource } from '@tamu-gisc/common/types';

import { EsriModuleProviderService } from '../module-provider/module-provider.service';
import { LayerSourcesService } from '../layer-sources/layer-sources.service';
import { EsriMapService } from './map.service';
import { symbologySourceOf } from './portal-symbology';

/**
 * What a feature layer is called when its definition does not name it (#1802).
 *
 * #1526 took the titles out of the definitions so that names would come from the services. Loaded by
 * URL with no title, though, ArcGIS names a layer "<service name> - <layer name>", and our services
 * are the hosted `*_view` ones, so Aggie Family Parade's route read "Aggie Family Parade view - Parade
 * Route" in the layer list and the legend.
 */
describe('EsriMapService feature layer titles', () => {
  /**
   * Stands in for ArcGIS's FeatureLayer, loading the way the real one does for a layer of the hosted
   * Aggie Family Parade service: the service describes the layer as "Parade Route", and an untitled
   * layer is titled from the service and layer names together.
   */
  class LoadingFeatureLayer {
    public title: string;
    public url: string;
    public sourceJSON: { name?: string };

    private readonly loaded: Promise<void>;

    constructor(props: { title?: string; url: string }) {
      Object.assign(this, props);

      this.loaded = Promise.resolve().then(() => {
        this.sourceJSON = { name: 'Parade Route' };

        if (this.title === undefined) {
          this.title = 'Aggie Family Parade view - Parade Route';
        }
      });
    }

    public when(): Promise<this> {
      return this.loaded.then(() => this);
    }
  }

  const url = 'https://example.test/arcgis/rest/services/Hosted/Aggie_Family_Parade_view/FeatureServer/1';

  let service: EsriMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: EsriModuleProviderService, useValue: { require: () => Promise.resolve([LoadingFeatureLayer]) } },
        { provide: Router, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: SearchService, useValue: {} },
        { provide: EnvironmentService, useValue: { value: () => undefined } },
        { provide: HttpClient, useValue: {} },
        { provide: LayerSourcesService, useValue: {} }
      ]
    });

    service = TestBed.inject(EsriMapService);
  });

  /** Makes a layer from a source and lets it finish loading. */
  async function loaded(source: LayerSource): Promise<LoadingFeatureLayer> {
    const layer = (await service.generateLayer(source)) as unknown as LoadingFeatureLayer;

    await layer.when();
    await new Promise((resolve) => setTimeout(resolve));

    return layer;
  }

  it("names an untitled layer by the layer's own name in the service, not the service's", async () => {
    const layer = await loaded({ type: 'feature', id: 'route', url });

    expect(layer.title).toBe('Parade Route');
  });

  it('leaves a title the definition chose alone', async () => {
    const layer = await loaded({ type: 'feature', id: 'route', title: 'Parade', url });

    expect(layer.title).toBe('Parade');
  });
});

/**
 * A portal renderer keyed on fields its layer lacks is not applied (#2500).
 *
 * The production item for the baseball parking views was not republished with the service, so its
 * renderers key on `baseball` for layers that now have `type` and `event`: no feature matches a class and
 * nothing draws. The layer keeps the service's own symbology, which is what development draws.
 */
describe('EsriMapService portal item renderers', () => {
  const itemId = 'item1';
  const serviceRenderer = { type: 'service' };

  class PortalFeatureLayer {
    public layerId = 3;
    public title = 'Baseball Event Parking Lots';
    public renderer: { toJSON: () => unknown } | { restored: unknown } = { toJSON: () => serviceRenderer };
    public sourceJSON = { serviceItemId: itemId };
    public url = '';
    public fields: Array<{ name: string }> = [{ name: 'objectid' }, { name: 'type' }];

    constructor(props: object) {
      Object.assign(this, props);
    }

    public when(): Promise<this> {
      return Promise.resolve(this);
    }
  }

  const rendererJsonUtils = { fromJSON: (json: unknown) => ({ restored: json }) };

  let service: EsriMapService;
  let itemRenderer: unknown;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: EsriModuleProviderService,
          useValue: {
            require: (names: string[]) =>
              Promise.resolve(names.map((name) => (name === 'rendererJsonUtils' ? rendererJsonUtils : PortalFeatureLayer)))
          }
        },
        { provide: Router, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: SearchService, useValue: {} },
        { provide: EnvironmentService, useValue: { value: () => undefined } },
        { provide: HttpClient, useValue: { get: () => of({ layers: [{ id: 3, layerDefinition: { drawingInfo: { renderer: itemRenderer } } }] }) } },
        { provide: LayerSourcesService, useValue: {} }
      ]
    });

    service = TestBed.inject(EsriMapService);
  });

  async function loaded(): Promise<PortalFeatureLayer> {
    const layer = (await service.generateLayer({
      type: 'feature',
      id: 'lots',
      url: 'https://example.test/arcgis/rest/services/Hosted/BaseballParking_view/FeatureServer/3'
    })) as unknown as PortalFeatureLayer;

    await layer.when();
    await new Promise((resolve) => setTimeout(resolve, 10));

    return layer;
  }

  it('keeps the service symbology, and says why, when the item keys on a field the layer lacks', async () => {
    itemRenderer = { type: 'uniqueValue', field1: 'baseball', uniqueValueInfos: [{ value: 'Permit' }] };
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const layer = await loaded();

    expect(layer.renderer).not.toHaveProperty('restored');
    expect(symbologySourceOf(layer)).toBe('service');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('baseball'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Baseball Event Parking Lots'));

    warn.mockRestore();
  });

  it('applies the item renderer when every field it keys on is on the layer', async () => {
    itemRenderer = { type: 'uniqueValue', field1: 'type', uniqueValueInfos: [{ value: 'Reserved' }] };

    const layer = await loaded();

    expect(layer.renderer).toEqual({ restored: itemRenderer });
    expect(symbologySourceOf(layer)).toBe('portal');
  });

  it('applies an Arcade renderer whatever fields the layer has', async () => {
    itemRenderer = { type: 'uniqueValue', field1: 'baseball', valueExpression: '$feature.type' };

    expect((await loaded()).renderer).toEqual({ restored: itemRenderer });
  });

  it('applies a simple renderer whatever fields the layer has', async () => {
    itemRenderer = { type: 'simple', symbol: {} };

    expect((await loaded()).renderer).toEqual({ restored: itemRenderer });
  });
});

/**
 * Two callers asking for the same layer at once get one layer (#1849).
 *
 * A layer is only on the map once it has been made, which takes at least one await. The main map's set
 * and a Football Tailgating `?tent=` link both asked for the selection layer in that window, each made
 * one, and the map ended up with two layers called `selection-layer`: the tent's highlight on one, the
 * other empty, and the empty one sometimes on top.
 */
describe('EsriMapService layers asked for twice at once', () => {
  class FakeGraphicsLayer {
    public id: string;
    // A collection, as Esri's is: selectFeatures reads it back with toArray().
    public graphics = { items: [] as unknown[], toArray: () => [...this.graphics.items] };

    constructor(props: { id: string }) {
      this.id = props.id;
    }

    public removeAll(): void {
      this.graphics.items = [];
    }

    public addMany(graphics: unknown[]): void {
      this.graphics.items.push(...graphics);
    }
  }

  const selectionSource = { type: 'graphics', id: 'selection-layer', title: 'Selected Buildings' } as LayerSource;

  let service: EsriMapService;
  let layers: FakeGraphicsLayer[];

  beforeEach(() => {
    layers = [];

    TestBed.configureTestingModule({
      providers: [
        { provide: EsriModuleProviderService, useValue: { require: () => Promise.resolve([FakeGraphicsLayer]) } },
        { provide: Router, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: SearchService, useValue: {} },
        {
          provide: EnvironmentService,
          useValue: {
            value: (key: string) => (key === 'LayerSources' ? [selectionSource] : { polygon: { type: 'simple-fill' } })
          }
        },
        { provide: HttpClient, useValue: {} },
        { provide: LayerSourcesService, useValue: {} }
      ]
    });

    service = TestBed.inject(EsriMapService);
    service['_modules'].map = {
      findLayerById: (id: string) => layers.find((layer) => layer.id === id),
      add: (layer: FakeGraphicsLayer) => layers.push(layer)
    } as unknown as __esri.Map;
    vi.spyOn(service, 'zoomTo').mockReturnValue(undefined);
  });

  /** Lets every pending promise settle. */
  const settle = () => new Promise((resolve) => setTimeout(resolve));

  it('makes one layer when two callers ask for it before it is on the map', async () => {
    const [first, second] = await Promise.all([
      service.findLayerOrCreateFromSource(selectionSource),
      service.findLayerOrCreateFromSource(selectionSource)
    ]);

    expect(layers).toHaveLength(1);
    expect(second).toBe(first);
  });

  it('puts a selection made while the map is making the selection layer on that one layer', async () => {
    const feature = { geometry: { type: 'polygon' }, attributes: {} } as unknown as __esri.Graphic;

    const loading = service.findLayerOrCreateFromSource(selectionSource);
    service.selectFeatures({ graphics: [feature], zoom: 17 });
    await loading;
    await settle();

    expect(layers).toHaveLength(1);
    expect(layers[0].graphics.toArray()).toEqual([feature]);
  });
});

/**
 * A map selects the feature a link names as it loads, unless its host resolves links itself (#1969).
 *
 * An event map's `EventService` asks the map's own layers first. When the map service also selected the
 * link from the application's search sources, both selected, and a `?lot=` link on Visitor Parking opened
 * the main map's Lot 100j whenever that answer came last.
 */
describe('EsriMapService selecting a linked feature as the map loads', () => {
  let service: EsriMapService;
  let selectFeaturesFromUrl: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: EsriModuleProviderService, useValue: {} },
        { provide: Router, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: SearchService, useValue: {} },
        { provide: EnvironmentService, useValue: { value: () => [] } },
        { provide: LayerSourcesService, useValue: {} },
        { provide: HttpClient, useValue: {} },
        EsriMapService
      ]
    });

    service = TestBed.inject(EsriMapService);
    selectFeaturesFromUrl = vi.fn();

    const stubbed = service as unknown as Record<string, unknown>;
    stubbed['filterLayerSources'] = () => [];
    stubbed['loadLayers'] = () => Promise.resolve();
    stubbed['registerViewClickEventHandler'] = () => undefined;
    stubbed['selectFeaturesFromUrl'] = selectFeaturesFromUrl;
  });

  afterEach(() => TestBed.resetTestingModule());

  const useView = () => service.useView({} as never, { sceneView: vi.fn(), show: vi.fn() } as never);

  it('selects it on a map whose host does not resolve links, as the main map', async () => {
    await useView();

    expect(selectFeaturesFromUrl).toHaveBeenCalledTimes(1);
  });

  it('leaves it to a host that resolves links itself, as an event map', async () => {
    service.selectsFeaturesFromUrlOnLoad = false;

    await useView();

    expect(selectFeaturesFromUrl).not.toHaveBeenCalled();
  });
});
