import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { TestingService } from '@tamu-gisc/dev-tools/application-testing';

import { VisitMapsNavComponent } from './visit-maps-nav.component';
import { discoverRoutes } from '../../discover.routes';

/**
 * The Visit Maps tiles are the only way most visitors reach a category of maps, and their order is a
 * deliberate decision rather than the order someone happened to type them in.
 *
 * Transportation sits between Parking and Athletics Events - the maintainer's decision, 8 November 2026
 * (#2737). An order like this drifts silently: nothing fails when a tile moves, so without a check the
 * next person to add one puts it wherever the array ends.
 */
describe('the Visit Maps tiles', () => {
  function tiles() {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      // The tiles are `routerLink`s, so the component needs a router or creating it throws
      // asynchronously - which Vitest reports as an unhandled error and warns may make the
      // assertions below false positives.
      imports: [RouterTestingModule, VisitMapsNavComponent],
      providers: [{ provide: TestingService, useValue: { get: () => of(false) } }]
    });

    return TestBed.createComponent(VisitMapsNavComponent).componentInstance.tiles;
  }

  it('lists its categories in the order the maintainer set', () => {
    expect(tiles().map((tile) => tile.label)).toEqual([
      'Anniversary',
      'Parking & Transportation',
      'Athletics Events',
      'Campus Events',
      'Operations',
      'Campus Maps',
      'Code Maroon'
    ]);
  });

  it('puts Parking & Transportation between Anniversary and Athletics Events', () => {
    const labels = tiles().map((tile) => tile.label);

    // Stated as a relationship as well as a position, so the intent survives a tile being added
    // elsewhere in the row: the next person sees which neighbours matter. Transportation had its
    // own tile here until #2895 folded it into this one.
    expect(labels.indexOf('Parking & Transportation')).toBe(labels.indexOf('Anniversary') + 1);
    expect(labels.indexOf('Athletics Events')).toBe(labels.indexOf('Parking & Transportation') + 1);
  });

  // #2895: one tile for both kinds of map, so a visitor who wants a bus or a scooter is not sent
  // looking for a Transportation tile that no longer exists.
  it('has no separate Transportation tile', () => {
    expect(tiles().map((tile) => tile.label)).not.toContain('Transportation');
  });

  it('gives every tile a route that All Maps serves', () => {
    // A tile pointing at a path with no route renders as a link to nowhere, which nothing else catches.
    const served = discoverRoutes.map((route) => `/all-maps/${route.path}`);

    for (const tile of tiles()) {
      if (!tile.route.startsWith('/all-maps/')) {
        continue; // Main Campus Parking Map and Code Maroon leave All Maps entirely.
      }

      expect(served, `${tile.label} points at ${tile.route}, which no All Maps route serves`).toContain(tile.route);
    }
  });
});
