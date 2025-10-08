/* eslint-disable */
export default {
  displayName: 'ues-recycling-data-api-nest',

  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/ues-recycling-data-api-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
