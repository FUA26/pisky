const { FlatCompat } = require("@eslint/eslintrc");
const { dirname } = require("path");
const next = require("eslint-config-next");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  {
    ignores: [".next/", "node_modules/", "dist/", "build/"],
  },
  ...compat.extends("next/core-web-vitals", "prettier"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "off",
    },
  },
];
