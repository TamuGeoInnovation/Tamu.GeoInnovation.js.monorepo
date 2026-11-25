import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EsriMapService } from '@tamu-gisc/maps/esri';

import { MapComponent } from './map.component';

describe('MapComponent', () => {
  let loadLayers: jest.Mock;
  let get: jest.Mock;
  let queryParams: Record<string, string>;
  let mine: Observable<unknown>;

  type Source = {
    id: string;
    url: string;
    title: string;
    native: {
      definitionExpression?: string;
      renderer: { symbol: { color: unknown } };
      popupTemplate?: { content: string; expressionInfos: Array<{ name: string; expression: string }> };
    };
  };

  const layers = () => loadLayers.mock.calls[0][0] as Array<Source>;
  const layer = (id: string) => layers().find((l) => l.id === id);

  const create = () => {
    const fixture = TestBed.createComponent(MapComponent);

    fixture.componentInstance.ngOnInit();

    return fixture.componentInstance;
  };

  beforeEach(async () => {
    loadLayers = jest.fn();
    queryParams = {};
    mine = of({
      type: 'FeatureCollection',
      features: [{ properties: { guid: 'aaaa-1111' } }, { properties: { guid: 'bbbb-2222' } }]
    });
    get = jest.fn(() => mine);

    await TestBed.configureTestingModule({
      imports: [MapComponent],
      providers: [
        { provide: EsriMapService, useValue: { store: of({}), loadLayers } },
        { provide: EnvironmentService, useValue: { value: () => 'https://api.test' } },
        { provide: ActivatedRoute, useValue: { queryParams: of(queryParams) } },
        { provide: AuthService, useValue: { user$: of({ sub: 'auth0|me' }) } },
        { provide: HttpClient, useValue: { get } }
      ]
    })
      .overrideComponent(MapComponent, { set: { imports: [], template: '' } })
      .compileComponents();
  });

  it("shows this season's submissions", () => {
    create();

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
    create();

    const ids = layers().map((l) => l.id);

    expect(layers()).toContainEqual(
      expect.objectContaining({
        id: 'already-found-layer',
        title: 'Already found last year',
        url: 'https://api.test/competitions/maps/seasons/active/already-found?format=geojson'
      })
    );
    expect(ids.indexOf('already-found-layer')).toBeLessThan(ids.indexOf('submissions-layer'));
  });

  /**
   * #2625: one ring for each thing, saying how many times it was found.
   */
  it('says in the popup how many times a thing was found last year', () => {
    create();

    const popup = layer('already-found-layer').native.popupTemplate;

    expect(popup.content).toContain('{expression/found}');
    expect(popup.expressionInfos).toEqual([expect.objectContaining({ name: 'found' })]);
    expect(popup.expressionInfos[0].expression).toContain('$feature.count');
  });

  /**
   * #2625: the participant's own submissions stand apart from everyone else's.
   */
  describe("the participant's own submissions", () => {
    it('come from the endpoint for one participant, in maroon, above everyone else', () => {
      const component = create();

      expect(get).toHaveBeenCalledWith('https://api.test/competitions/maps/seasons/active/user/auth0|me?format=geojson');
      expect(layer('my-submissions-layer')).toEqual(
        expect.objectContaining({
          title: 'Your submissions',
          url: 'https://api.test/competitions/maps/seasons/active/user/auth0|me?format=geojson'
        })
      );
      expect(layer('my-submissions-layer').native.renderer.symbol.color).toBe('#500000');
      expect(layers().map((l) => l.id)).toEqual(['already-found-layer', 'submissions-layer', 'my-submissions-layer']);
      expect(component.showsMine()).toBe(true);
    });

    it("are left out of everyone else's, which still come from the map of everyone, in grey", () => {
      create();

      expect(layer('submissions-layer')).toEqual(
        expect.objectContaining({
          title: "Everyone else's submissions",
          url: 'https://api.test/competitions/maps/seasons/active?format=geojson'
        })
      );
      expect(layer('submissions-layer').native.definitionExpression).toBe("guid NOT IN ('aaaa-1111', 'bbbb-2222')");
      expect(layer('submissions-layer').native.renderer.symbol.color).toBe('#424242');
    });

    it('leave everyone else as they are when there are none yet', () => {
      mine = of({ type: 'FeatureCollection', features: [] });
      create();

      expect(layer('submissions-layer').native.definitionExpression).toBeUndefined();
      expect(layer('my-submissions-layer')).toBeDefined();
    });

    it('put nothing but submission ids into the expression', () => {
      mine = of({ features: [{ properties: { guid: "x') OR (1=1" } }, { properties: { guid: 'cccc-3333' } }] });
      create();

      expect(layer('submissions-layer').native.definitionExpression).toBe("guid NOT IN ('cccc-3333')");
    });

    it('leave every submission alike when they cannot be read', () => {
      mine = throwError(() => new Error('offline'));
      const component = create();

      expect(layers().map((l) => l.id)).toEqual(['already-found-layer', 'submissions-layer']);
      expect(layer('submissions-layer').native.definitionExpression).toBeUndefined();
      expect(component.showsMine()).toBe(false);
    });

    it('are not looked for on the map of one participant, from the leaderboard', () => {
      queryParams['user'] = 'auth0|someone';
      const component = create();

      expect(get).not.toHaveBeenCalled();
      expect(layers().map((l) => l.url)).toContain(
        'https://api.test/competitions/maps/seasons/active/user/auth0|someone?format=geojson'
      );
      expect(layer('my-submissions-layer')).toBeUndefined();
      expect(component.showsMine()).toBe(false);
    });
  });
});
