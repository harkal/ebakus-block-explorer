module.exports = {
  root: true,

  env: {
    "browser": true,
    "node": true,
    "es6": true
  },

  extends: ["plugin:vue/recommended", "@vue/prettier"],

  rules: {
    "no-console": "off",
    "no-debugger": "off"
  },

  parserOptions: {
    parser: "babel-eslint"
    // "ecmaVersion": 2017,
  },

  "globals": {
    "__DEV__": true,
    "__DISABLED_FEATURE__": true,
    "__dirname": true,
    "REMOVE_FROM_PRODUCTION": true,
    "require": true,
    "module": true,
    "process": true,
    // "web3": true
  },

  overrides: [
    {
      files: ["**/__tests__/*.{j,t}s?(x)"],
      env: {
        jest: true
      }
    }
  ]
};
