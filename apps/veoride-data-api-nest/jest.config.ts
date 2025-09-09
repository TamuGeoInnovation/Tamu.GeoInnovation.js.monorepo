/* eslint-disable */
export default {
  displayName: 'veoride-data-api-nest',

  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/veoride-data-api-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
