import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { EsriMapService, EsriModuleProviderService } from '@tamu-gisc/maps/esri';

import { MAP_LOCATION_LAYER_ID, MapLocationComponent } from './map-location.component';

/**
 * #2625: a "you are here" dot that follows the participant, and a button to centre on it, without ever
 * asking for the location on its own (#2559).
 */
describe('MapLocationComponent', () => {
  let permission: { state: PermissionState; addEventListener: (name: string, handler: () => void) => void };
  let permissionChanged: () => void;
  let watchPosition: ReturnType<typeof vi.fn>;
  let clearWatch: ReturnType<typeof vi.fn>;
  let position: (latitude: number, longitude: number, accuracy: number) => void;
  let refuse: () => void;

  const map = { add: vi.fn(), remove: vi.fn() };
  const view = { zoom: 15, goTo: vi.fn(() => Promise.resolve()) };

  class Graphic {
    public geometry: unknown;
    constructor(public properties: { symbol: { type: string } }) {}
  }

  class GraphicsLayer {
    public parent = map;
    constructor(public properties: { id: string; graphics: Array<Graphic> }) {}
  }

  class Circle {
    constructor(public properties: { radius: number; center: object }) {}
  }

  class Point {
    constructor(public properties: { latitude: number; longitude: number }) {}
  }

  const modules = { GraphicsLayer, Graphic, Circle, Point };

  /** Where the map was last sent, and to which zoom. */
  const wentTo = () => {
    const [{ target, zoom }] = view.goTo.mock.calls.at(-1) as unknown as [{ target: Point; zoom: number }];

    return { target: target instanceof Point ? target.properties : target, zoom };
  };

  /** Lets the promises the dot is drawn through settle. */
  const settle = () => new Promise((resolve) => setTimeout(resolve));

  function stubBrowser(state: PermissionState | 'none') {
    permission = {
      state: state as PermissionState,
      addEventListener: (name, handler) => (permissionChanged = handler)
    };
    watchPosition = vi.fn((success, error) => {
      position = (latitude, longitude, accuracy) => success({ coords: { latitude, longitude, accuracy } });
      refuse = () => error({ code: 1 });

      return 7;
    });
    clearWatch = vi.fn();

    Object.defineProperty(globalThis.navigator, 'geolocation', {
      configurable: true,
      value: { watchPosition, clearWatch }
    });
    Object.defineProperty(globalThis.navigator, 'permissions', {
      configurable: true,
      value: state === 'none' ? undefined : { query: () => Promise.resolve(permission) }
    });
  }

  async function create() {
    await TestBed.configureTestingModule({
      imports: [MapLocationComponent],
      providers: [
        { provide: EsriMapService, useValue: { store: of({ map, view }) } },
        {
          provide: EsriModuleProviderService,
          useValue: { require: (names: Array<keyof typeof modules>) => Promise.resolve(names.map((n) => modules[n])) }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(MapLocationComponent);

    fixture.detectChanges();
    await settle();

    return fixture.componentInstance;
  }

  const layer = () => map.add.mock.calls[0]?.[0] as GraphicsLayer;
  const graphic = (type: string) => layer().properties.graphics.find((g) => g.properties.symbol.type === type);

  beforeEach(() => {
    map.add.mockClear();
    map.remove.mockClear();
    view.goTo.mockClear();
  });

  it('follows the location at once where the site may already use it, without moving the map', async () => {
    stubBrowser('granted');
    const component = await create();

    expect(watchPosition).toHaveBeenCalledTimes(1);

    position(30.6131, -96.3407, 12);
    await settle();

    expect(component.state()).toBe('on');
    expect(layer().properties.id).toBe(MAP_LOCATION_LAYER_ID);
    expect(graphic('simple-marker').geometry).toEqual({ type: 'point', latitude: 30.6131, longitude: -96.3407 });
    expect((graphic('simple-fill').geometry as Circle).properties).toEqual(
      expect.objectContaining({ radius: 12, center: { type: 'point', latitude: 30.6131, longitude: -96.3407 } })
    );
    expect(view.goTo).not.toHaveBeenCalled();
  });

  it('moves the dot and its circle as the location changes', async () => {
    stubBrowser('granted');
    await create();

    position(30.6131, -96.3407, 12);
    await settle();
    position(30.614, -96.341, 5);
    await settle();

    expect(map.add).toHaveBeenCalledTimes(1);
    expect(graphic('simple-marker').geometry).toEqual({ type: 'point', latitude: 30.614, longitude: -96.341 });
    expect((graphic('simple-fill').geometry as Circle).properties.radius).toBe(5);
  });

  for (const state of ['prompt', 'none'] as const) {
    it(`does not ask where the browser ${state === 'prompt' ? 'would' : 'cannot say whether it would'}, until the button`, async () => {
      stubBrowser(state);
      const component = await create();

      expect(watchPosition).not.toHaveBeenCalled();
      expect(component.state()).toBe('off');

      component.locate();
      position(30.6131, -96.3407, 12);
      await settle();

      expect(watchPosition).toHaveBeenCalledTimes(1);
      expect(wentTo()).toEqual({ target: { latitude: 30.6131, longitude: -96.3407 }, zoom: 18 });
    });
  }

  it('centres on the location from the button, without watching twice', async () => {
    stubBrowser('granted');
    const component = await create();

    position(30.6131, -96.3407, 12);
    await settle();
    component.locate();
    await settle();

    expect(watchPosition).toHaveBeenCalledTimes(1);
    // A Point, which goTo moves to; given a plain object it only zooms.
    expect(wentTo()).toEqual({ target: { latitude: 30.6131, longitude: -96.3407 }, zoom: 18 });
  });

  it('does nothing where the location is blocked, not even from the button', async () => {
    stubBrowser('denied');
    const component = await create();

    component.locate();

    expect(component.state()).toBe('blocked');
    expect(watchPosition).not.toHaveBeenCalled();
  });

  it('stops and takes the dot away when the location is refused or blocked while it follows', async () => {
    stubBrowser('granted');
    const component = await create();

    position(30.6131, -96.3407, 12);
    await settle();
    permission.state = 'denied';
    permissionChanged();
    await settle();

    expect(component.state()).toBe('blocked');
    expect(clearWatch).toHaveBeenCalledWith(7);
    expect(map.remove).toHaveBeenCalledWith(layer());
  });

  it('says it is blocked when the watch is refused', async () => {
    stubBrowser('none');
    const component = await create();

    component.locate();
    refuse();
    await settle();

    expect(component.state()).toBe('blocked');
  });
});
