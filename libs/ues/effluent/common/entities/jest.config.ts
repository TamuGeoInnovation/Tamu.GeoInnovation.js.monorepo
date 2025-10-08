/* eslint-disable */
export default {
  displayName: 'ues-effluent-common-entities',

  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../../coverage/libs/ues/effluent/common/entities',
  preset: '../../../../../jest.preset.js'
};
