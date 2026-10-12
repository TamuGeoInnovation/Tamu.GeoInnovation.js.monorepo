/* eslint-disable */
module.exports = {
  displayName: 'mailroom-nest',

  globals: {},
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/mailroom-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
