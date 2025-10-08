/* eslint-disable */
export default {
  displayName: 'veoride-common-entities',

  globals: {},
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/veoride/common/entities',
  preset: '../../../../jest.preset.js'
};
