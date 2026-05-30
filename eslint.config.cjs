module.exports = [
  // ignore common build/output folders
  {
    ignores: ['node_modules/**', 'dist/**', 'public/**', '*.tsbuildinfo', 'vite.config.*'],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      react: require('eslint-plugin-react'),
      'react-hooks': require('eslint-plugin-react-hooks'),
      'jsx-a11y': require('eslint-plugin-jsx-a11y'),
    },
    rules: {
      'no-debugger': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error', 'debug'] }],
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
    },
    settings: { react: { version: 'detect' } },
  },
];
