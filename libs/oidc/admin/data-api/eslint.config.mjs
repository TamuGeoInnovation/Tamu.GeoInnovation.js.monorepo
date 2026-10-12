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
        project: ['libs/oidc/admin/data-api/tsconfig.*?.json']
      }
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    // Override or add rules here
    rules: {}
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {}
  }
];
