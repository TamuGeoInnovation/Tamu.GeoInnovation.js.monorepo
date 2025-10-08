/* eslint-disable */
export default {
  displayName: 'ues-recycling-common-entities',

  globals: {},
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../../coverage/libs/ues/recycling/common/entities',
  preset: '../../../../../jest.preset.js'
};
