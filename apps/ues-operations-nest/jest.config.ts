/* eslint-disable */
export default {
  displayName: 'ues-operations-nest',

  globals: {},
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/ues-operations-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
