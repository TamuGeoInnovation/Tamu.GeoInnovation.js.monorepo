const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require("./tsconfig.json");

module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: "./test/tsconfig.spec.json",
      stringifyContentPathRegex: '\\.html$',
      astTransformers: [require.resolve('jest-preset-angular/InlineHtmlStripStylesTransformer')],
    }
  },
  "roots": [
    "<rootDir>/libs/"
  ],
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["./test/setupJest.ts"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' })
};
