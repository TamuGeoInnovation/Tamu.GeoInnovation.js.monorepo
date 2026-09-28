const nxPreset = require('@nx/jest/preset').default;
const { compilerOptions } = require('./tsconfig.base.json');

module.exports = {
  ...nxPreset,
  // Absolute path: <rootDir> in a preset resolves per-project, not to the workspace root.
  setupFiles: [require.resolve('./test/jest.polyfills.js')],
  // 88 projects legitimately have no specs after the scaffold removal. Without this, Jest
  // exits non-zero on "No tests found", turning an empty project into a failing one.
  passWithNoTests: true,
  testMatch: ['**/+(*.)+(spec).+(ts|js)?(x)'],
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest'
  },
  resolver: '@nx/jest/plugins/resolver',
  moduleFileExtensions: ['ts', 'js', 'html'],
  collectCoverage: true,
  coverageReporters: ['html', 'lcov', 'text'],
  // `reporters`, not `repoters`. It was misspelled here, so Jest silently ignored it and no report
  // was ever produced - and `jest-junit` was not installed either. See #1070.
  //
  // The output directory comes from the environment rather than a path relative to `<rootDir>`:
  // `<rootDir>` resolves per project, and projects sit at different depths (`libs/a/b/c` against
  // `apps/x`), so a relative hop lands somewhere different for each one. The first attempt at this
  // wrote into `libs/test-results`.
  //
  // 88 projects write into one directory, so each file needs a distinct name. `uniqueOutputName`
  // does that by naming the file after the *run* - `junit.xml-3b9c52a0-bb59-11f1-...` - which made
  // the CI summary table a list of random ids with no way to tell which project each row was.
  //
  // Nx sets `NX_TASK_TARGET_PROJECT` for every forked task, so the file can be named after the
  // project instead and the summary can label rows from the filename alone. The fallback keeps the
  // old unique naming when that is missing - a run outside an Nx task, where every project would
  // otherwise overwrite one `junit.xml`. See #1070.
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: process.env.JEST_JUNIT_OUTPUT_DIR || 'test-results/junit',
        ...(process.env.NX_TASK_TARGET_PROJECT
          ? { outputName: `${process.env.NX_TASK_TARGET_PROJECT}.xml` }
          : { uniqueOutputName: 'true' }),
        suiteName: process.env.NX_TASK_TARGET_PROJECT || 'jest tests',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' > ',
        addFileAttribute: 'true'
      }
    ]
  ],
  verbose: true,
  /* TODO: Update to latest Jest snapshotFormat
   * By default Nx has kept the older style of Jest Snapshot formats
   * to prevent breaking of any existing tests with snapshots.
   * It's recommend you update to the latest format.
   * You can do this by removing snapshotFormat property
   * and running tests with --update-snapshot flag.
   * Example: "nx affected --targets=test --update-snapshot"
   * More info: https://jestjs.io/docs/upgrading-to-jest29#snapshot-format
   */
  snapshotFormat: { escapeString: true, printBasicPrototype: true }
};

if (process.env.IDE) {
  const fs = require('fs');
  let path = '<rootDir>';

  try {
    if (fs.existsSync(process.cwd() + '/src/test-setup.ts')) {
      path = process.cwd();
    }
  } catch (e) {}

  module.exports.globals = {
    'ts-jest': {
      tsConfig: './test/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$',
      astTransformers: [require.resolve('jest-preset-angular/InlineHtmlStripStylesTransformer')],
      diagnostics: {
        ignoreCodes: [151001]
      }
    },
    /* TODO: Update to latest Jest snapshotFormat
     * By default Nx has kept the older style of Jest Snapshot formats
     * to prevent breaking of any existing tests with snapshots.
     * It's recommend you update to the latest format.
     * You can do this by removing snapshotFormat property
     * and running tests with --update-snapshot flag.
     * Example: "nx affected --targets=test --update-snapshot"
     * More info: https://jestjs.io/docs/upgrading-to-jest29#snapshot-format
     */
    snapshotFormat: { escapeString: true, printBasicPrototype: true }
  };

  module.exports.setupFilesAfterEnv = [`${path}/src/test-setup.ts`];
}
