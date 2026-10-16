import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { SearchService } from '@tamu-gisc/ui-kits/ngx/search';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LayerSource } from '@tamu-gisc/common/types';

import { EsriModuleProviderService } from '../module-provider/module-provider.service';
import { LayerSourcesService } from '../layer-sources/layer-sources.service';
import { EsriMapService } from './map.service';

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
