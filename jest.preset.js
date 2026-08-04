const nxPreset = require('@nx/jest/preset').default;
const { compilerOptions } = require('./tsconfig.base.json');

module.exports = {
  ...nxPreset,
  testMatch: ['**/+(*.)+(spec).+(ts|js)?(x)'],
  moduleNameMapper: {
    '^lightgallery/angular/13$': require('path').resolve(__dirname, 'libs/aggiemap/ngx/popups/src/testing/lightgallery.mock.ts')
  },
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest'
  },
  resolver: '@nx/jest/plugins/resolver',
  moduleFileExtensions: ['ts', 'js', 'html'],
  collectCoverage: true,
  coverageReporters: ['html', 'lcov', 'text'],
  repoters: ['default', 'jest-junit'],
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
