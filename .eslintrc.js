// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    es2024: true,
    node: true,
  },
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:playwright/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'playwright', 'prettier'],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': 'error',
    'prettier/prettier': 'error',
    'playwright/no-conditional-in-test': 'warn',
    'playwright/no-page-pause': 'warn',
    'react/no-unescaped-entities': 'off',
    'react/display-name': 'off',
  },
  settings: {
    next: {
      rootDir: '.',
    },
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['**/*.config.ts', '**/*.config.js'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
