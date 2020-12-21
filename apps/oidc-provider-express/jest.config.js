module.exports = {
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/apps/oidc-provider-express',
  globals: { 'ts-jest': { tsConfig: '<rootDir>/tsconfig.spec.json' } },
  displayName: 'oidc-provider-express',
};
