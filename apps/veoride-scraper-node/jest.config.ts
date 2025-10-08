/* eslint-disable */
export default {
  displayName: 'veoride-scraper-node',

  globals: {},
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/veoride-scraper-node',
  testEnvironment: 'node',
  preset: '../../jest.preset.js'
};
