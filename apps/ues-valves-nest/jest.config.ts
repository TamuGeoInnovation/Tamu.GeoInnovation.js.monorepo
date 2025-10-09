/* eslint-disable */
export default {
  displayName: 'ues-valves-nest',

  globals: {},
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/ues-valves-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
