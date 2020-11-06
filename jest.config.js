const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  testMatch: ['**/+(*.)+(spec).+(ts|js)?(x)'],
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest'
  },
  resolver: '@nrwl/jest/plugins/resolver',
  moduleFileExtensions: ['ts', 'js', 'html'],
  collectCoverage: true,
  coverageReporters: ['html', 'lcov', 'text'],
  repoters: ['default', 'jest-junit'],
  verbose: true
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
    }
  };

  module.exports.setupFilesAfterEnv = [`${path}/src/test-setup.ts`];
}
