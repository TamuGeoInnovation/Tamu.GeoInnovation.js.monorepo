module.exports = {
  displayName: 'veoride-scraper-node',

  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/veoride-scraper-node',
  testEnvironment: 'node',
  preset: '../../jest.preset.ts'
};
