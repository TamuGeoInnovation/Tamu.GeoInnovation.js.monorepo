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
        project: ['apps/oidc-admin-nest/tsconfig.*?.json']
      }
    }
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {}
  }
];
