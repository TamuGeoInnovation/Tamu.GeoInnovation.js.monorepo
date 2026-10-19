/**
 * The TestBed for every Angular project on Vitest (#1479), in place of a `src/test-setup.ts` per
 * project.
 *
 * Zoneless (#1478), as AggieMap and UES Operations run: they load no zone.js, so a spec sees change
 * detection as they do. A view updates when a signal, an input, a template event or markForCheck says
 * so, never because time passed. A component that updates zoneless also updates under the zone the
 * other applications still load, so one setting covers the libraries they share.
 *
 * A project whose specs still use `waitForAsync` or `fakeAsync` asks the preset for `{ zone: true }`,
 * which loads zone.js before this file; the TestBed is then zone-based, as jest-preset-angular's
 * setupZoneTestEnv was.
 *
 * destroyAfterEach: false keeps the teardown these specs were written against under Jest.
 */
import '@angular/compiler';
import { provideZoneChangeDetection } from '@angular/core';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

const zone = 'Zone' in globalThis;

setupTestBed({
  zoneless: !zone,
  providers: zone ? [provideZoneChangeDetection()] : [],
  teardown: { destroyAfterEach: false }
});
