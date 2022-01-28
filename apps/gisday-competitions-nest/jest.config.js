module.exports = {
  displayName: 'gisday-competitions-nest',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/gisday-competitions-nest',
  testEnvironment: 'node'
};
