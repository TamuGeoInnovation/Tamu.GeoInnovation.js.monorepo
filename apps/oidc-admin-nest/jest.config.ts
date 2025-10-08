/* eslint-disable */
export default {
  displayName: 'oidc-admin-nest',

  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/oidc-admin-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
