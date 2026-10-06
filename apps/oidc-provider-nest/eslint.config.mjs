import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    rules: {}
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {}
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    // Override or add rules here
    rules: {},
    languageOptions: {
      parserOptions: {
        project: ['apps/oidc-provider-nest/tsconfig.*?.json']
      }
    }
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {}
  },
  {
    // Nx runs ESLint from the workspace root, so a pattern relative to this folder no longer matches.
    ignores: ['**/src/assets/scripts/*.min.js']
  }
];
