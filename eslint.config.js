// @ts-nocheck
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginPromise from "eslint-plugin-promise";
import * as tsParser from "@typescript-eslint/parser";
import globals from "globals";

const prettierConfig = {
  trailingComma: "none",
  semi: true,
  singleQuote: false,
  printWidth: 100,
  tabWidth: 2
};

export default [
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021
      }
    },
    plugins: {
      import: eslintPluginImport,
      promise: eslintPluginPromise
    },
    rules: {
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
  {
    files: ["scripts/**/*.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node
      }
    }
  },
  {
    ignores: ["dist/", "node_modules/", "**/*.min.js", "eslint.config.js", "rollup.config.js"]
  }
];
