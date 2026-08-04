/* eslint-disable */
export default {
  displayName: 'aggiemap-ngx-popups',

  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {},
  coverageDirectory: '../../../../coverage/libs/aggiemap/ngx/popups',
  moduleNameMapper: {
    '^lightgallery/angular/13$': '<rootDir>/src/testing/lightgallery.mock.ts'
  },
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

        tsconfig: '<rootDir>/tsconfig.spec.json'
      }
    ]
  },
  transformIgnorePatterns: ['node_modules/(?!.*.mjs$)'],
  preset: '../../../../jest.preset.js'
};
