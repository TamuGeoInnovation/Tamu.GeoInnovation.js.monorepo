/* eslint-disable */
export default {
  displayName: 'covid-data-api-nest',

  globals: {},
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/covid-data-api-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
