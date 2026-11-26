import { vitestConfig } from '../../../../vitest.preset.mjs';

// Popup dates are College Station's, so these specs run in its zone wherever they run, CI's UTC included (#3551): a
// date shown a day early only shows behind UTC. Set here, before the test workers start, as aggiemap-ngx-core does.
process.env.TZ = 'America/Chicago';

export default vitestConfig(import.meta.dirname);
