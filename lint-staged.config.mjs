import { relative } from "path";

/**
 * Based on Next.js documentation for ESLint with lint-staged
 * @link https://nextjs.org/docs/app/building-your-application/configuring/eslint#lint-staged
 */
const buildEslintCommand = (filenames) =>
   `next lint --fix --file ${filenames.map((f) => relative(process.cwd(), f)).join(" --file ")}`;

const buildVitestCommand = (filenames) => {
   return `vitest related --run ${filenames.map((f) => relative(process.cwd(), f)).join(" ")}`;
};

const buildPrettierCommand = (filenames) =>
   `prettier --write ${filenames.map((f) => relative(process.cwd(), f)).join(" ")}`;

const config = {
   "*.{js,jsx,ts,tsx}": [buildEslintCommand, buildVitestCommand, buildPrettierCommand],
   "*.{css,scss}": [buildPrettierCommand],
};

export default config;
