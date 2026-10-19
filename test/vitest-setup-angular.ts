/**
 * The TestBed for every Angular project on Vitest (#1479), in place of a `src/test-setup.ts` per
 * project.
 *
 * Zone-based, as under Jest: jest-preset-angular's setupZoneTestEnv provided
 * provideZoneChangeDetection(), and the specs were written against it. Some use `waitForAsync` and
 * `fakeAsync`, which need zone.js. Without that provider Angular 22 schedules change detection
 * itself, as it does zoneless, and two specs then failed on views their mocks did not fully set up.
 *
 * Going zoneless (#1478) is this file's change alone: `zoneless: true`, no provider and no
 * `setup-zone` import, once no spec needs the zone helpers.
 *
 * destroyAfterEach: false keeps the teardown these specs were written against under Jest.
 */
import '@angular/compiler';
import '@analogjs/vitest-angular/setup-zone';
import { provideZoneChangeDetection } from '@angular/core';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

setupTestBed({
  zoneless: false,
  providers: [provideZoneChangeDetection()],
  teardown: { destroyAfterEach: false }
});
