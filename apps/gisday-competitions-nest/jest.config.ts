/* eslint-disable */
export default {
  displayName: 'gisday-competitions-nest',

  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/gisday-competitions-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
