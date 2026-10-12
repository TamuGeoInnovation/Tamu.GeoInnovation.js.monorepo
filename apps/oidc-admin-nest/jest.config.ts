/* eslint-disable */
module.exports = {
  displayName: 'oidc-admin-nest',

  globals: {},
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/oidc-admin-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
