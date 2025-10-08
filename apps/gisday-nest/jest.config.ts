/* eslint-disable */
export default {
  displayName: 'gisday-nest',

  globals: {},
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/gisday-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
