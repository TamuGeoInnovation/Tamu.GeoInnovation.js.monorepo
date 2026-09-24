/**
 * Globals that Node provides but the test environment does not.
 *
 * Loaded via `setupFiles` in jest.preset.js, which runs before the test framework is installed and
 * therefore before any module under test is imported.
 */

/**
 * jsdom has never shipped TextEncoder/TextDecoder, and an increasing number of dependencies assume
 * they exist. Under Node 20 this surfaced as `ReferenceError: TextEncoder is not defined` across
 * many suites -- all of which failed to even compile, so no assertion in them had run in years.
 *
 * Projects using `testEnvironment: 'node'` already have these; the guards make this a no-op there.
 */
const { TextEncoder, TextDecoder } = require('util');

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder;
}

if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder;
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
if (typeof globalThis.__esri === 'undefined') {
  globalThis.__esri = {};
}
