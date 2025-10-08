/* eslint-disable */
export default {
  displayName: 'gisday-bridge-nest',

  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json'
      }
    ]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/gisday-bridge-nest',
  preset: '../../jest.preset.js'
};
