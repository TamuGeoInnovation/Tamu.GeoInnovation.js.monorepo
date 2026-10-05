import { loadModules } from 'esri-loader';

import { MAP_PROBE_GLOBAL, registerMapProbe } from './map-probe';

// Esri's projection engine, which the probe loads only for a view in a projected reference.
jest.mock('esri-loader', () => ({ loadModules: jest.fn() }));

/**
 * The smoke suite cannot import this module -- doing so pulls the Angular dependency graph into the
 * Playwright process -- so it hardcodes the global's name instead.
 *
 * This pins the constant to that literal. If it is renamed here, this fails and names the file that
 * has to be changed with it, rather than leaving every map in the scheduled prod run red with a
 * "never reached ready state" timeout.
 */
describe('map probe', () => {
  it('keeps the global name the smoke suite hardcodes', () => {
    // Duplicated in test/smoke/aggiemap/maps.spec.ts -- change both together.
    expect(MAP_PROBE_GLOBAL).toBe('__tamuGiscMapProbe');
  });

  describe('registerMapProbe', () => {
    /** Stands in for an `EsriMapService` instance; only its identity matters. */
    const owner = {};

    const layersOf = (count: number) =>
      Array.from({ length: count }, (_, i) => ({
        id: `l${i}`,
        title: `L${i}`,
        type: 'feature',
        visible: true,
        loaded: true
      }));

    /** A map whose layers have all loaded, so only the settling window governs readiness. */
    const instanceWithLayers = (count: number) =>
      ({
        map: { allLayers: { toArray: () => layersOf(count) } },
        view: { ready: true }
      } as unknown as Parameters<typeof registerMapProbe>[0]);

    afterEach(() => {
      delete (window as unknown as Record<string, unknown>)[MAP_PROBE_GLOBAL];
    });

    it('installs the global on first registration', () => {
      expect((window as unknown as Record<string, unknown>)[MAP_PROBE_GLOBAL]).toBeUndefined();

      registerMapProbe(undefined, owner);

      expect((window as unknown as Record<string, unknown>)[MAP_PROBE_GLOBAL]).toBeDefined();
    });

    it('reports not ready when no map is registered', async () => {
      registerMapProbe(undefined, owner);

      const probe = (window as unknown as Record<string, { ready: boolean; snapshot: () => Promise<unknown> }>)[
        MAP_PROBE_GLOBAL
      ];

      expect(probe.ready).toBe(false);
      await expect(probe.snapshot()).resolves.toEqual({ ready: false, viewReady: false, spatialReference: null, layers: [] });
    });

    it("reports a graphics layer's graphics by type, and null for other layers (#1174)", async () => {
      registerMapProbe(
        {
          map: {
            allLayers: {
              toArray: () => [
                {
                  id: 'bus-route-layer',
                  title: 'Bus Routes',
                  type: 'graphics',
                  visible: true,
                  loaded: true,
                  graphics: {
                    toArray: () => [
                      { attributes: { type: 'route' } },
                      { attributes: { type: 'waypoints' } },
                      { attributes: { type: 'waypoints' } },
                      { attributes: {} }
                    ]
                  }
                },
                { id: 'buildings', title: 'Buildings', type: 'feature', visible: true, loaded: true }
              ]
            }
          },
          view: { ready: true }
        } as unknown as Parameters<typeof registerMapProbe>[0],
        owner
      );

      const probe = (
        window as unknown as Record<string, { snapshot: () => Promise<{ layers: { id: string; graphicTypes: unknown }[] }> }>
      )[MAP_PROBE_GLOBAL];
      const layers = (await probe.snapshot()).layers;

      expect(layers.find((layer) => layer.id === 'bus-route-layer')?.graphicTypes).toEqual({
        route: 1,
        waypoints: 2,
        untyped: 1
      });
      expect(layers.find((layer) => layer.id === 'buildings')?.graphicTypes).toBeNull();
    });

    /**
     * A basemap that loads cleanly and draws nothing (#1240, #1241).
     *
     * Esri never reprojects a tiled or vector tiled layer, so one whose spatial reference differs
     * from the view's is invisible while reporting itself perfectly healthy. `drawable` is the only
     * signal that separates the two, and it must be decided by `SpatialReference.equals` rather than
     * by comparing wkids: **the same reference has more than one number.** Web Mercator is 102100 as
     * `wkid` and 3857 as `latestWkid`, and a view and a layer may each report a different one of the
     * pair -- a first attempt at this check compared the numbers and reported every healthy map on
     * the site as broken.
     */
    it('reports whether a tiled layer can draw in the view it is in (#1240)', async () => {
      // Stands in for Esri's own SpatialReference.equals, which treats the two numberings as equal.
      const reference = (wkid: number) => ({
        wkid,
        equals: (other: { wkid: number }) => new Set([wkid, other.wkid]).size === 1 || [wkid, other.wkid].every((w) => w === 102100 || w === 3857)
      });

      registerMapProbe(
        {
          map: {
            allLayers: {
              toArray: () => [
                // The same reference, reported by its other number. Must not be called undrawable.
                { id: 'esri-base', title: 'World Topo', type: 'vector-tile', visible: true, loaded: true, spatialReference: reference(3857) },
                // A genuinely different reference, which cannot be reprojected into the view.
                { id: 'campus-base', title: 'Base Map', type: 'vector-tile', visible: true, loaded: true, spatialReference: reference(32139) },
                // Feature data is reprojected on request, so it is always drawable.
                { id: 'buildings', title: 'Buildings', type: 'feature', visible: true, loaded: true, spatialReference: reference(32139) }
              ]
            }
          },
          view: { ready: true, spatialReference: reference(102100) }
        } as unknown as Parameters<typeof registerMapProbe>[0],
        owner
      );

      const probe = (
        window as unknown as Record<string, { snapshot: () => Promise<{ layers: { id: string; drawable: boolean | null }[] }> }>
      )[MAP_PROBE_GLOBAL];
      const layers = (await probe.snapshot()).layers;

      expect(layers.find((layer) => layer.id === 'esri-base')?.drawable).toBe(true);
      expect(layers.find((layer) => layer.id === 'campus-base')?.drawable).toBe(false);
      expect(layers.find((layer) => layer.id === 'buildings')?.drawable).toBe(true);
    });

    /**
     * Layers arrive in batches -- basemap first, operational layers after -- so the probe requires
     * the layer count to hold steady before calling the map settled. Without it a fast poller
     * snapshots a one-layer map and reports a healthy map as empty.
     */
    it('is not ready until the layer count has held steady', () => {
      const nowSpy = jest.spyOn(Date, 'now');

      try {
        nowSpy.mockReturnValue(10_000);
        registerMapProbe(instanceWithLayers(1), owner);

        const probe = (window as unknown as Record<string, { ready: boolean }>)[MAP_PROBE_GLOBAL];

        // First observation only establishes the window.
        expect(probe.ready).toBe(false);

        // Still inside it.
        nowSpy.mockReturnValue(11_000);
        expect(probe.ready).toBe(false);

        nowSpy.mockReturnValue(12_000);
        expect(probe.ready).toBe(true);
      } finally {
        nowSpy.mockRestore();
      }
    });

    it('goes back to not ready when more layers are added', () => {
      const nowSpy = jest.spyOn(Date, 'now');

      try {
        // One mutable instance, as in the real thing: layers are added to the map that is already
        // registered, so the count change has to be noticed by the probe rather than by
        // re-registration.
        let count = 1;
        const instance = {
          map: { allLayers: { toArray: () => layersOf(count) } },
          view: { ready: true }
        } as unknown as Parameters<typeof registerMapProbe>[0];

        nowSpy.mockReturnValue(10_000);
        registerMapProbe(instance, owner);

        const probe = (window as unknown as Record<string, { ready: boolean }>)[MAP_PROBE_GLOBAL];

        expect(probe.ready).toBe(false);
        nowSpy.mockReturnValue(12_000);
        expect(probe.ready).toBe(true);

        // A second batch lands on the same map: the window restarts rather than reporting a
        // half-built map as ready.
        count = 5;
        expect(probe.ready).toBe(false);

        nowSpy.mockReturnValue(14_000);
        expect(probe.ready).toBe(true);
      } finally {
        nowSpy.mockRestore();
      }
    });

    /**
     * `EsriMapService` is `providedIn: 'root'` but several map components provide their own
     * instance, and the store is a `BehaviorSubject` seeded with `undefined` -- so every additional
     * instance emits `undefined` the moment it subscribes. Without the owner check that emission
     * wipes a live map and the probe reports not-ready for the rest of the page's life.
     */
    it('does not let a different owner clear a registered map', () => {
      const nowSpy = jest.spyOn(Date, 'now');

      try {
        nowSpy.mockReturnValue(10_000);
        registerMapProbe(instanceWithLayers(2), owner);

        const probe = (window as unknown as Record<string, { ready: boolean }>)[MAP_PROBE_GLOBAL];

        // The first read only establishes the settling window; readiness cannot be true yet.
        expect(probe.ready).toBe(false);

        nowSpy.mockReturnValue(12_000);
        expect(probe.ready).toBe(true);

        registerMapProbe(undefined, {});

        expect(probe.ready).toBe(true);

        registerMapProbe(undefined, owner);

        expect(probe.ready).toBe(false);
      } finally {
        nowSpy.mockRestore();
      }
    });

    it("reports the view's zoom and center, and null before a view exists (#1379)", () => {
      registerMapProbe(
        {
          map: { allLayers: { toArray: () => [] } },
          view: { ready: true, zoom: 18, center: { longitude: -96.3354, latitude: 30.6095 } }
        } as unknown as Parameters<typeof registerMapProbe>[0],
        owner
      );

      const probe = (window as unknown as Record<string, { framing: unknown }>)[MAP_PROBE_GLOBAL];

      expect(probe.framing).toEqual({ zoom: 18, center: [-96.3354, 30.6095] });

      registerMapProbe(undefined, owner);

      expect(probe.framing).toBeNull();
    });

    it('projects a center in a projected reference to WGS 84, and is not ready until it can (#1380)', async () => {
      // Dev's main map is in Texas Centric (wkid 32139), where Esri leaves longitude and latitude null.
      const center = { x: 1082345.89, y: 3111767.64, longitude: null, latitude: null };
      const project = jest.fn(() => ({ x: -96.34467, y: 30.61306 }));

      (loadModules as jest.Mock).mockResolvedValue([{ load: () => Promise.resolve(), project }]);

      const nowSpy = jest.spyOn(Date, 'now');

      try {
        nowSpy.mockReturnValue(10_000);
        registerMapProbe(
          {
            map: { allLayers: { toArray: () => [{ id: 'l0', title: 'L0', type: 'feature', visible: true, loaded: true }] } },
            view: { ready: true, zoom: 16, center }
          } as unknown as Parameters<typeof registerMapProbe>[0],
          owner
        );

        const probe = (window as unknown as Record<string, { framing: unknown; ready: boolean }>)[MAP_PROBE_GLOBAL];

        expect(probe.framing).toBeNull();

        // Layers settled, but the engine is still loading, so not ready yet.
        expect(probe.ready).toBe(false);
        nowSpy.mockReturnValue(12_000);
        expect(probe.ready).toBe(false);

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(probe.framing).toEqual({ zoom: 16, center: [-96.34467, 30.61306] });
        expect(project).toHaveBeenCalledWith(center, { wkid: 4326 });
        expect(probe.ready).toBe(true);
        expect(loadModules).toHaveBeenCalledTimes(1);
      } finally {
        nowSpy.mockRestore();
        registerMapProbe(undefined, owner);
      }
    });
  });
});
