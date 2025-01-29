/** @type {import("prettier").Config }*/
const config = {
   semi: true,
   singleQuote: false,
   trailingComma: "es5",
   printWidth: 100,
   useTabs: false,
   tabWidth: 3,
   bracketSpacing: true,
   bracketSameLine: false,
   arrowParens: "always",
   endOfLine: "lf",
   plugins: ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
   importOrder: [
      "^server-only$", // server-only first
      "^react$", // react imports first
      "^next(/.*)?$", // next imports then
      "^@?\\w", // external imports (including the ones with or without @)
      "^@/*", // aliased imports
      "^(.*)$", // other imports
   ],
   importOrderSeparation: true,
   importOrderSortSpecifiers: true,
   tailwindConfig: "./tailwind.config.ts",
};

export default config;
