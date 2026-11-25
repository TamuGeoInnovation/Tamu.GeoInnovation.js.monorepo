import baseConfig from '../../../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    rules: {}
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
    languageOptions: {
      parserOptions: {
        // A file is typed by the first of these that includes it: the library's code by tsconfig.lib.json, which has
        // strictNullChecks (#3495), and the specs and jest.config.ts by tsconfig.spec.json, which does not.
        project: [
          'libs/gisday/competitions/data-api/tsconfig.lib.json',
          'libs/gisday/competitions/data-api/tsconfig.spec.json'
        ]
      }
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    // Override or add rules here
    rules: {
      // Conditions that can never be false are bugs, not caution (#985); real now that strictNullChecks is on here (#3495).
      '@typescript-eslint/no-unnecessary-condition': 'error'
    }
  },
  {
    // The specs and jest.config.ts are typed without strictNullChecks (tsconfig.spec.json would report 12 errors in the
    // specs with it), and the rule cannot tell a condition that can never be false without it.
    files: ['**/*.spec.ts', 'jest.config.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off'
    }
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {}
  }
];
