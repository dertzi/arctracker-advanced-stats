// @ts-nocheck
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginPromise from "eslint-plugin-promise";
import eslintPluginPrettier from "eslint-plugin-prettier";
import * as tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser, // fixes fetch, console, URL, location, etc
        ...globals.es2021
      }
    },
    plugins: {
      import: eslintPluginImport,
      promise: eslintPluginPromise,
      prettier: eslintPluginPrettier
    },
    rules: {
      "prettier/prettier": "error",
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "off",
      "import/no-unresolved": "error",
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always"
        }
      ],
      "promise/always-return": "off",
      "promise/no-nesting": "warn",
      "promise/no-return-wrap": "error",
      "require-jsdoc": "off",
      "valid-jsdoc": "off",
      "spaced-comment": "off",
      "multiline-comment-style": "off"
    }
  },

  // ignore files we don't want linted
  {
    ignores: ["dist/", "node_modules/", "**/*.min.js", "eslint.config.js", "rollup.config.js"]
  }
];
