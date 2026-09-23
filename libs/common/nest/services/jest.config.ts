/* eslint-disable */
export default {
  displayName: 'common-nest-services',

  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': [
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
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/common/nest/services',
  preset: '../../../../jest.preset.js'
};
