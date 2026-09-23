/* eslint-disable */
export default {
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../../../coverage/libs/common/utils/geometry',
  globals: {},
  displayName: 'common-utils-geometry',
  // This project owns no specs of its own -- `esri/` and `generic/` are separate Nx
  // projects with their own tsconfigs. Without this, the parent sweeps up its children's
  // specs and compiles them against ITS tsconfig.spec.json, which lacks the arcgis types,
  // so common-utils-geometry-esri.spec.ts failed here while passing in its own project.
  testPathIgnorePatterns: ['<rootDir>/esri/', '<rootDir>/generic/'],
  preset: '../../../../jest.preset.js'
};
