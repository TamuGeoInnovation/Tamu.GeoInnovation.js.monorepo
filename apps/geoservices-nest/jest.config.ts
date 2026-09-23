/* eslint-disable */
export default {
  displayName: 'geoservices-nest',

  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        // Report type errors only for files in THIS project. Otherwise a project with
        // `strict: true` type-checks the source of every library it imports under its own
        // settings, so a non-strict library fails as a dependency of a strict one while
        // compiling fine on its own and in the build. Each project owns its own types.
        diagnostics: { exclude: ['!<rootDir>/**'] },
      }
    ]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/geoservices-nest',
  preset: '../../jest.preset.js'
};
