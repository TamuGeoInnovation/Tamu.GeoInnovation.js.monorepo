import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EsriMapService } from '@tamu-gisc/maps/esri';

import { MapComponent } from './map.component';

describe('MapComponent', () => {
  let loadLayers: jest.Mock;
  let queryParams: Record<string, string>;

  const layers = () => loadLayers.mock.calls[0][0] as Array<{ id: string; url: string; title: string }>;

  beforeEach(async () => {
    loadLayers = jest.fn();
    queryParams = {};

    await TestBed.configureTestingModule({
      imports: [MapComponent],
      providers: [
        { provide: EsriMapService, useValue: { store: of({}), loadLayers } },
        { provide: EnvironmentService, useValue: { value: () => 'https://api.test' } },
        { provide: ActivatedRoute, useValue: { queryParams: of(queryParams) } }
      ]
    })
      .overrideComponent(MapComponent, { set: { imports: [], template: '' } })
      .compileComponents();
  });

  it("shows this season's submissions", () => {
    TestBed.createComponent(MapComponent).componentInstance.ngOnInit();

    expect(layers()).toContainEqual(
      expect.objectContaining({
        id: 'submissions-layer',
        url: 'https://api.test/competitions/maps/seasons/active?format=geojson'
      })
    );
  });

  /**
   * #2166: and where things were already found last season, so participants look elsewhere.
   */
  it('shows where things were already found last season, beneath this season', () => {
    TestBed.createComponent(MapComponent).componentInstance.ngOnInit();

    const ids = layers().map((layer) => layer.id);

    expect(layers()).toContainEqual(
      expect.objectContaining({
        id: 'already-found-layer',
        title: 'Already found last year',
        url: 'https://api.test/competitions/maps/seasons/active/already-found?format=geojson'
      })
    );
    expect(ids.indexOf('already-found-layer')).toBeLessThan(ids.indexOf('submissions-layer'));
  });
});
