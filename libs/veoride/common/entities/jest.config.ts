/* eslint-disable */
export default {
  displayName: 'veoride-common-entities',

  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/veoride/common/entities',
  preset: '../../../../jest.preset.js'
};
