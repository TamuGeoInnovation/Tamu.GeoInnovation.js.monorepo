/**
 * Globals that Node provides but jsdom does not.
 *
 * jsdom has never shipped TextEncoder/TextDecoder, and an increasing number of dependencies assume
 * they exist. Under Node 20 this surfaced as `ReferenceError: TextEncoder is not defined` across
 * 53 test suites -- all of which failed to even compile, so no assertion in them had run in years.
 *
 * Loaded via `setupFiles` in jest.preset.js, which runs before the test framework is installed and
 * therefore before any module under test is imported. Projects using `testEnvironment: 'node'`
 * already have these; the guards make this a no-op there.
 */
const { TextEncoder, TextDecoder } = require('util');

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder;
}

if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder;
}
