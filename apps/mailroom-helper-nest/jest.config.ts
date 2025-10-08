/* eslint-disable */
export default {
  displayName: 'mailroom-helper-nest',

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
  coverageDirectory: '../../coverage/apps/mailroom-helper-nest',
  preset: '../../jest.preset.js'
};
