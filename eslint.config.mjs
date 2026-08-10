import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Artefactos generados por OpenNext/wrangler
      ".open-next/**",
      "bundled/**",
      ".wrangler/**",
      "cloudflare-env.d.ts",
      // Skills de agentes instaladas con `npx skills add` (herramientas, no código de la app)
      ".agents/**",
      ".claude/**",
    ],
  },
];

export default eslintConfig;
