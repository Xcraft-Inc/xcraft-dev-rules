'use strict';

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    mocha: true,
    node: true,
    es6: true,
  },
  parser: 'babel-eslint',
  plugins: ['react', 'babel', 'jsdoc'],
  extends: [
    'prettier',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jsdoc/recommended',
  ],
  rules: {
    // Other rules
    'no-console': 'off',
    'eqeqeq': 'error',
    'react/display-name': 'off',
  },
};
