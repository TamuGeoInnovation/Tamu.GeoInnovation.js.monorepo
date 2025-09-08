module.exports = {
  displayName: 'ues-valves-nest',

  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/ues-valves-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.ts'
};
