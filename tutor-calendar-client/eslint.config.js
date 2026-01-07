const tseslint = require('@typescript-eslint/eslint-plugin');
const angular = require('@angular-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
  // Core and adapters - relaxed rules
  {
    files: ['src/core/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      '@angular-eslint': angular,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'semi': ['error', 'always'],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@angular-eslint/prefer-inject': 'off',
    },
  },
  // Application code - strict rules
  {
    files: ['src/app/**/*.ts', 'src/main.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      '@angular-eslint': angular,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...angular.configs.recommended.rules,

      // Custom style rules
      'semi': ['error', 'always'],

      // Explicit accessibility modifiers for methods only
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          overrides: {
            constructors: 'no-public',
            accessors: 'off',
            properties: 'off', // Don't require on properties (including input signals)
            methods: 'explicit',
            parameterProperties: 'explicit',
          },
        },
      ],

      // Explicit return types for class methods only
      '@typescript-eslint/explicit-function-return-type': [
        'warn', // Warn instead of error
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
          allowedNames: ['ngOnInit', 'ngOnDestroy', 'ngAfterViewInit', 'ngOnChanges'], // Lifecycle hooks
        },
      ],

      // Relax some strict Angular rules
      '@angular-eslint/prefer-inject': 'warn', // Warn instead of error
      '@typescript-eslint/no-explicit-any': 'warn', // Warn for any types
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],

      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@angular/common',
              importNames: ['CommonModule'],
              message: 'CommonModule usage is prohibited.',
            },
          ],
        },
      ],
    },
  },
];
