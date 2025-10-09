/* eslint-disable */
export default {
  displayName: 'ues-effluent-data-api-nest',

  globals: {},
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/ues-effluent-data-api-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
