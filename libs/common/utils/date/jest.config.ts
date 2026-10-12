/* eslint-disable */
module.exports = {
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../../../coverage/libs/common/utils/date',
  globals: {},
  displayName: 'common-utils-date',
  // Date tests run in College Station's time zone. CI runs in UTC, where #1298 cannot happen.
  globalSetup: '<rootDir>/jest.global-setup.js',
  preset: '../../../../jest.preset.js'
};
