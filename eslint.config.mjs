import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";
import next from "eslint-config-next";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default tseslint.config(
  {
    ignores: [".next/", "node_modules/", "dist/", "build/"],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // AI-friendly: relaxed rules
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",
    },
  }
);
