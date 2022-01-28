module.exports = {
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/apps/trees-angular',

  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {
    'ts-jest': {
      stringifyContentPathRegex: '\\.(html|svg)$',

      tsconfig: '<rootDir>/tsconfig.spec.json'
    }
  },
  displayName: 'trees-angular',
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment'
  ],
  transform: {
    '^.+.(ts|mjs|js|html)$': 'jest-preset-angular'
  },
  transformIgnorePatterns: ['node_modules/(?!.*.mjs$)']
};
