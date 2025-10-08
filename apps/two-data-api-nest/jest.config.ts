/* eslint-disable */
export default {
  displayName: 'two-data-api-nest',

  globals: {},
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/two-data-api-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
