module.exports = {
  displayName: 'two-directory-nest',

  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' }
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/two-directory-nest',
  testEnvironment: 'node',
  preset: '../../jest.preset.ts'
};
