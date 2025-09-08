module.exports = {
  displayName: 'ues-operations-nest',

  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/ues-operations-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.ts'
};
