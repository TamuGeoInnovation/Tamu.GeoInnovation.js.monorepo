/* eslint-disable */
export default {
  displayName: 'veoride-data-compiler-node',

  globals: {},
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/veoride-data-compiler-node',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
