module.exports = {
  displayName: 'aggiemap-ngx-ui-shared',
  preset: '../../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {
    'ts-jest': {
      stringifyContentPathRegex: '\\.(html|svg)$',

      tsconfig: '<rootDir>/tsconfig.spec.json'
    }
  },
  coverageDirectory: '../../../../../coverage/libs/aggiemap/ngx/ui/shared',
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment'
  ],
  transform: { '^.+\\.(ts|js|html)$': 'jest-preset-angular' }
};
