import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*']
            }
          ]
        }
      ]
    }
  },
  ...nx.configs['flat/typescript'],
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-extra-semi': 'off'
    }
  },
  ...nx.configs['flat/typescript'],
  {
    files: ['src/**/**.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
      'no-extra-semi': 'off'
    }
  },
  ...nx.configs['flat/javascript'],
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {
      'no-extra-semi': 'off'
    }
  },
  // An unused variable, import or parameter fails lint (#2390). It was Nx's warning, which never fails `nx lint`, a check
  // or CI, so they accumulated: 86 across 20 projects on 25 November 2026. A parameter or a destructured key a
  // signature needs, but nothing reads, is named `_name`. Last, so no preset spread after it puts the warning back.
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  }
];
