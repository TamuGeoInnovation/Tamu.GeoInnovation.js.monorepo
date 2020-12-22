module.exports = {
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../../coverage/libs/oidc/provider-nestjs',
  globals: { 'ts-jest': { tsConfig: '<rootDir>/tsconfig.spec.json' } },
  displayName: 'oidc-provider-nestjs'
};
