module.exports = {
  displayName: 'two-data-api-nest',

  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/two-data-api-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.ts'
};
