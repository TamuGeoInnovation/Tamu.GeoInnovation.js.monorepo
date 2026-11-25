/**
 * The one Vitest configuration every project on Vitest shares (#1479). A project's own
 * `vitest.config.mts` is a single call:
 *
 *     export default vitestConfig(import.meta.dirname);
 *
 * and the `@nx/vitest` plugin in nx.json gives every project with that file a `test` target.
 *
 * Angular projects are compiled by Analog's Vite plugin and get a zoneless TestBed from
 * test/vitest-setup-angular.ts (`{ zone: true }` for one that still needs zone.js); plain TypeScript
 * projects (`{ angular: false }`) skip both.
 */
import angular from '@analogjs/vite-plugin-angular';
import { join, relative } from 'node:path';
import { defineConfig } from 'vitest/config';

const workspaceRoot = import.meta.dirname;

export interface VitestPresetOptions {
  /** Compile with the Angular compiler and set up the TestBed. Default true. */
  angular?: boolean;
  /** Default `jsdom`; `node` for server-side projects. */
  environment?: 'jsdom' | 'node';
  /**
   * Load zone.js and give the TestBed zone-based change detection. Default false: Angular projects
   * test zoneless (#1478). Only for specs that still use `waitForAsync` or `fakeAsync`.
   */
  zone?: boolean;
}

export function vitestConfig(
  projectRoot: string,
  { angular: isAngular = true, environment = 'jsdom', zone = false }: VitestPresetOptions = {}
) {
  const fromRoot = relative(workspaceRoot, projectRoot);
  // Nx sets this for every task, so each project's JUnit file is named after it, as jest-junit's
  // were (#1070). CI points JEST_JUNIT_OUTPUT_DIR at one directory for both runners.
  const project = process.env.NX_TASK_TARGET_PROJECT ?? fromRoot.replace(/[\\/]/g, '-');
  const junitDir = process.env.JEST_JUNIT_OUTPUT_DIR ?? join(workspaceRoot, 'test-results/junit');

  return defineConfig({
    root: projectRoot,
    cacheDir: join(workspaceRoot, 'node_modules/.vite', fromRoot),
    plugins: isAngular ? [angular({ tsconfig: join(projectRoot, 'tsconfig.spec.json') })] : [],
    // The workspace's `@tamu-gisc/*` paths from tsconfig.base.json, read by Vite itself.
    resolve: { tsconfigPaths: true },
    test: {
      globals: true,
      environment,
      // Jest's jsdom page address. Vitest's own is http://localhost:3000, and specs that build share
      // links from the page address expect the one they were written against.
      environmentOptions: { jsdom: { url: 'http://localhost/' } },
      include: ['src/**/*.spec.ts'],
      setupFiles: [
        join(workspaceRoot, 'test/polyfills.ts'),
        ...(isAngular && zone ? ['@analogjs/vitest-angular/setup-zone'] : []),
        ...(isAngular ? [join(workspaceRoot, 'test/vitest-setup-angular.ts')] : [])
      ],
      // Many projects legitimately have no specs; an empty one is not a failing one.
      passWithNoTests: true,
      // Vitest's default is 5 s, which for an Angular project is a budget for Analog compiling the component
      // under test inside `TestBed.configureTestingModule`. Nobody chose it, and it is a statement about how
      // fast the machine is rather than about the test: a full check runs `--parallel=8`, and on this team three
      // sessions share one machine, so checks overlap by design. On 24 November 2026 two unrelated specs failed
      // that way within an hour - `all-maps.campus-order.spec.ts` (#3522), which takes 0.57 s on a quiet machine,
      // and `button-colours.spec.ts` (#3518), which takes 7.5 s - each on a pull request that touched neither.
      //
      // Raising it hides nothing: a test that never finishes still fails, just later. What stops failing is a
      // test that was only ever slow. A plain TypeScript project keeps the 5 s default, because it compiles no
      // components and nothing has been seen to need more.
      ...(isAngular ? { testTimeout: 30_000 } : {}),
      reporters: ['default', 'junit'],
      outputFile: { junit: join(junitDir, `${project}.xml`) },
      coverage: { provider: 'v8', reportsDirectory: join(workspaceRoot, 'coverage', fromRoot) }
    }
  });
}
