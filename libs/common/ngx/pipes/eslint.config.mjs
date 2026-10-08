import baseConfig from '../../../../eslint.config.mjs';
import nx from '@nx/eslint-plugin';

export default [
  ...baseConfig,
  ...nx.configs['flat/angular'],
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['libs/common/ngx/pipes/tsconfig.*?.json']
      }
    },
    rules: {
      '@angular-eslint/prefer-standalone': 'off',
      '@angular-eslint/prefer-inject': 'off',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'tamuGisc',
          style: 'camelCase'
        }
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'tamu-gisc',
          style: 'kebab-case'
        }
      ],
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      // A browser bundle cannot load `import x = require()` on the dev server (#1558).
      '@typescript-eslint/no-require-imports': 'error'
    }
  },
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.html'],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/alt-text': 'off',
      '@angular-eslint/template/mouse-events-have-key-events': 'off',
      '@angular-eslint/template/label-has-associated-control': 'off',
      '@angular-eslint/template/role-has-required-aria': 'off',
      '@angular-eslint/template/no-autofocus': 'off'
    }
  }
];
