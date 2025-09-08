module.exports = {
  displayName: 'oidc-provider-nest',

  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/oidc-provider-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.ts'
};
