import { MAP_PROBE_GLOBAL, registerMapProbe } from './map-probe';

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
      await expect(probe.snapshot()).resolves.toEqual({ ready: false, viewReady: false, layers: [] });
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
  });
});
