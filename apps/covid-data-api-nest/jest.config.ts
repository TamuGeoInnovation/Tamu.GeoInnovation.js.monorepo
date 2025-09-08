module.exports = {
  displayName: 'covid-data-api-nest',

  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/covid-data-api-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.ts'
};
