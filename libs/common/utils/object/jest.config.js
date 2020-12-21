module.exports = {
  name: 'common-utils-object',
  preset: '../../../../jest.config.js',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../../../coverage/libs/common/utils/object',
  globals: { 'ts-jest': { tsConfig: '<rootDir>/tsconfig.spec.json' } },
};
