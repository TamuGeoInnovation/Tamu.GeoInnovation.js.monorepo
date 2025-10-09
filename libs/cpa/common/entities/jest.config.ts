/* eslint-disable */
export default {
  displayName: 'cpa-common-entities',

  globals: {},
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/cpa/common/entities',
  preset: '../../../../jest.preset.js'
};
