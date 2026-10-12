import nx from '@nx/eslint-plugin';
import eslintPluginNode from 'eslint-plugin-node';

export default [
  ...nx.configs['flat/base'],
  { plugins: { node: eslintPluginNode } },
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
  }
];
