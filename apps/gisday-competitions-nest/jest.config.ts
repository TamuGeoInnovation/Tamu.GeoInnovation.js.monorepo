/* eslint-disable */
export default {
  displayName: 'gisday-competitions-nest',

  globals: {},
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/gisday-competitions-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
