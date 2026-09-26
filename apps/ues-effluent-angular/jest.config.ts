/* eslint-disable */
export default {
  coverageDirectory: '../../coverage/apps/ues-effluent-angular',

  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {},
  displayName: 'ues-effluent-angular',
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment'
  ],
  transform: {
    '^.+.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        stringifyContentPathRegex: '\\.(html|svg)$',

        tsconfig: '<rootDir>/tsconfig.spec.json',
        // Report type errors only for files in THIS project. Otherwise a project with
        // `strict: true` type-checks the source of every library it imports under its own
        // settings, so a non-strict library fails as a dependency of a strict one while
        // compiling fine on its own and in the build. Each project owns its own types.
        diagnostics: { exclude: ['!<rootDir>/**'] },
      }
    ]
  },
  transformIgnorePatterns: ['node_modules/(?!(.*.mjs$|lightgallery))'],
  preset: '../../jest.preset.js'
};
