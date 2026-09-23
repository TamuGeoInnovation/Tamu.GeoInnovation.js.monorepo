/* eslint-disable */
export default {
  displayName: 'mailroom-ngx',

  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {},
  coverageDirectory: '../../../coverage/libs/mailroom/ngx',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        // Report type errors only for files in THIS project. Otherwise a project with
        // `strict: true` type-checks the source of every library it imports under its own
        // settings, so a non-strict library fails as a dependency of a strict one while
        // compiling fine on its own and in the build. Each project owns its own types.
        diagnostics: { exclude: ['!<rootDir>/**'] },
        stringifyContentPathRegex: '\\.(html|svg)$'
      }
    ]
  },
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|lightgallery))'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment'
  ],
  preset: '../../../jest.preset.js'
};
