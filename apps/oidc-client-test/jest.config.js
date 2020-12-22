module.exports = {
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/apps/oidc-client-test',
  globals: { 'ts-jest': { tsConfig: '<rootDir>/tsconfig.spec.json' } },
  displayName: 'oidc-client-test'
};
