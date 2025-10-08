/* eslint-disable */
export default {
  displayName: 'two-valup-nest',

  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/two-valup-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
