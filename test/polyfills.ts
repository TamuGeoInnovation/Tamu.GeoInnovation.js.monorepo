/**
 * Globals that Node provides but the test environment does not.
 *
 * Loaded before any module under test is imported: by `setupFiles` in jest.preset.js for the
 * projects still on Jest, and by `setupFiles` in vitest.preset.mts for the projects on Vitest (#1479).
 */
import { TextDecoder, TextEncoder } from 'util';

const globals = globalThis as Record<string, unknown>;

/**
 * jsdom has never shipped TextEncoder/TextDecoder, and an increasing number of dependencies assume
 * they exist. Under Node 20 this surfaced as `ReferenceError: TextEncoder is not defined` across
 * many suites -- all of which failed to even compile, so no assertion in them had run in years.
 *
 * Projects using the `node` test environment already have these; the guards make this a no-op there.
 */
if (typeof globals['TextEncoder'] === 'undefined') {
  globals['TextEncoder'] = TextEncoder;
}

if (typeof globals['TextDecoder'] === 'undefined') {
  globals['TextDecoder'] = TextDecoder;
}

/**
 * `__esri` is the ArcGIS JS API's ambient type namespace. It exists only as types, but
 * `emitDecoratorMetadata` is enabled workspace-wide, so a decorated property such as
 *
 *     @Column({ type: 'simple-json', nullable: true })
 *     public extent: __esri.Extent;
 *
 * emits `design:type` metadata that references `__esri` as a *value*. In a browser the ArcGIS API
 * defines that global, so production is fine; under Node it throws `__esri is not defined` at
 * import time and takes the whole suite with it.
 *
 * A stub is enough -- the metadata is never read, only evaluated.
 */
if (typeof globals['__esri'] === 'undefined') {
  globals['__esri'] = {};
}
