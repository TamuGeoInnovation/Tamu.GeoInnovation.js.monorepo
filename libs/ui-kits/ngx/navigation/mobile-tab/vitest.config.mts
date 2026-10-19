import { vitestConfig } from '../../../../../vitest.preset.mjs';

// Zone-based: these specs still use waitForAsync, and the project is not one #1478 made zoneless.
export default vitestConfig(import.meta.dirname, { zone: true });
