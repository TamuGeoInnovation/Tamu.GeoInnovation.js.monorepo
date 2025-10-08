/* eslint-disable */
export default {
  displayName: 'ues-recycling-data-api-nest',

  globals: {},
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/ues-recycling-data-api-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
