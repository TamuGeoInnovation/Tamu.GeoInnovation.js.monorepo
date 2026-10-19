import { mergeConfig } from 'vitest/config';

import { vitestConfig } from '../../../../vitest.preset.mjs';

// Date tests run in College Station's time zone (#1298). The bug they guard against only exists in a
// time zone behind UTC, and CI runs in UTC. Set for the test workers before any test file loads.
export default mergeConfig(vitestConfig(import.meta.dirname, { angular: false }), {
  test: { env: { TZ: 'America/Chicago' } }
});
