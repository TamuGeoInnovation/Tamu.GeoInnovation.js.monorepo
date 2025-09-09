module.exports = {
  displayName: 'mailroom-nest',

  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/mailroom-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.ts'
};
