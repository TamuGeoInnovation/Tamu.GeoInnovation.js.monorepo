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
      tsConfig: `${path}/tsconfig.spec.json`,
      stringifyContentPathRegex: '\\.html$',
      astTransformers: ['jest-preset-angular/InlineHtmlStripStylesTransformer']
    }
  };

  module.exports.setupFilesAfterEnv = [`${path}/src/test-setup.ts`];
}
