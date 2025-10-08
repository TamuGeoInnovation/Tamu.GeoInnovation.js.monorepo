/* eslint-disable */
export default {
  displayName: 'gisday-competitions-data-api',

  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/gisday/competitions/data-api',
  preset: '../../../../jest.preset.js'
};
