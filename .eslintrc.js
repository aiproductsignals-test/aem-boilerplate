module.exports = {
  root: true,
  extends: 'airbnb-base',
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
  },
  overrides: [
    {
      // Build machinery, not shipped code: runs in CI on Node, not in a browser.
      files: ['tools/**/*.mjs'],
      env: { browser: false, node: true, es2022: true },
      rules: {
        'no-await-in-loop': 'off', // fragments are fetched in order, on purpose
        'no-restricted-syntax': 'off', // for..of over a small file list is the clearest form
      },
    },
  ],
};
