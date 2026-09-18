import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'JSXAttribute[name.name="type"][value.value=/^(date|time|datetime-local)$/]',
          message:
            'Use the shared DatePicker or TimePicker. Native date/time inputs are forbidden.',
        },
        {
          selector:
            'JSXAttribute[name.name="type"] > JSXExpressionContainer > Literal[value=/^(date|time|datetime-local)$/]',
          message:
            'Use the shared DatePicker or TimePicker. Native date/time inputs are forbidden.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-datepicker',
              message:
                'Use the shared DatePicker or TimePicker; package imports belong inside their wrappers.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/**/components/ui/datePicker/**',
      'src/**/components/ui/timePicker/**',
      'src/**/components/ui/dateTimePicker/**',
    ],
    rules: { 'no-restricted-imports': 'off' },
  },
]);
