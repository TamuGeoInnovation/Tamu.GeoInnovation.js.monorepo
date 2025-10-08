/* eslint-disable */
export default {
  displayName: 'veoride-scraper',

  globals: {},
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/veoride/scraper',
  preset: '../../../jest.preset.js'
};
