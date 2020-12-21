module.exports = {
  name: 'common-utils-geometry-generic',
  preset: '../../../../../jest.config.js',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../../../../coverage/libs/common/utils/geometry/generic',
  globals: { 'ts-jest': { tsConfig: '<rootDir>/tsconfig.spec.json' } },
};
