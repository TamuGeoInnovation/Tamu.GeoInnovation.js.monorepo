import { vitestConfig } from '../../../vitest.preset.mjs';

// The library had no test target, so its specs never ran, locally or in CI (#3013).
export default vitestConfig(import.meta.dirname, { angular: false });
