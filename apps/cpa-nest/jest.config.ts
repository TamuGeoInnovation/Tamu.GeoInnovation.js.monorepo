/* eslint-disable */
export default {
  displayName: 'cpa-nest',

  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/cpa-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
