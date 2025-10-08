/* eslint-disable */
export default {
  displayName: 'ues-recycling-common-entities',

  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../../coverage/libs/ues/recycling/common/entities',
  preset: '../../../../../jest.preset.js'
};
