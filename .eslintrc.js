module.exports = {
  'env': {
    'commonjs': true,
    'es6': true,
    'node': true,
    'mocha': true
  },
  'extends': 'standard',
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly'
  },
  'parserOptions': {
    'ecmaVersion': 2018
  },
  'rules': {
    'space-before-function-paren': ['error', 'never'],
    'handle-callback-err': ['warn', 'always'],
    'no-unused-vars': ['warn'],
    'no-trailing-spaces': ['warn']
  }
}
