/* eslint-disable */
export default {
  displayName: 'veoride-data-api-nest',

  globals: {},
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/veoride-data-api-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
