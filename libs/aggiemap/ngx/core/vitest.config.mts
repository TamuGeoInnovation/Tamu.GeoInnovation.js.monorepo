import { vitestConfig } from '../../../../vitest.preset.mjs';

// Event dates are College Station's, so these specs run in its zone wherever they run, CI's UTC included (#3467). Set
// here, before the test workers start: a spec cannot change it, since Vitest gives each spec its own copy of process.env.
process.env.TZ = 'America/Chicago';

export default vitestConfig(import.meta.dirname);
