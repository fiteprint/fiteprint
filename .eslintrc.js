module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'jest',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
  ],
  rules: {
    'semi': ['error', 'always'],
    'indent': ['error', 2],
    'space-before-function-paren': ['error', 'never'],
    'space-before-blocks': ['error', 'always'],
    'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
    'comma-dangle': ['error', 'always-multiline'],
    'object-curly-spacing': ['error', 'always'],
    'key-spacing': ['error', { 'beforeColon': false, 'afterColon': true }],
  },
}