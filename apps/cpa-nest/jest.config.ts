/* eslint-disable */
export default {
  displayName: 'cpa-nest',

  globals: {},
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/cpa-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
