/* eslint-disable */
export default {
  displayName: 'gisday-platform-data-api',

  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/gisday/platform/data-api',
  preset: '../../../../jest.preset.js'
};
