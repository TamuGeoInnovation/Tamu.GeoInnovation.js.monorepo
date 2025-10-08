/* eslint-disable */
export default {
  displayName: 'veoride-data-compiler-node',

  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/veoride-data-compiler-node',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
