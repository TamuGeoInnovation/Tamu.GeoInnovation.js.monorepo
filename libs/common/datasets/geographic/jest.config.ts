/* eslint-disable */
export default {
  displayName: 'common-datasets-geographic',

  globals: {},
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json'
      }
    ]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/common/datasets/geographic',
  preset: '../../../../jest.preset.js'
};
