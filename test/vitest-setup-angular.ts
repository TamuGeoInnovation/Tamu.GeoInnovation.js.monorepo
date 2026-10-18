/**
 * The TestBed for every Angular project on Vitest (#1479), in place of a `src/test-setup.ts` per
 * project.
 *
 * Zone-based for now, as the specs were written against it: some use `waitForAsync` and
 * `fakeAsync`, which need zone.js. Going zoneless (#1478) is `zoneless: true` here, and removing the
 * `setup-zone` import, once no spec needs those helpers.
 *
 * destroyAfterEach: false keeps the teardown these specs were written against under Jest.
 */
import '@angular/compiler';
import '@analogjs/vitest-angular/setup-zone';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

setupTestBed({ zoneless: false, teardown: { destroyAfterEach: false } });
