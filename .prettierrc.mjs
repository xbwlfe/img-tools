/** @type {import('prettier').Config} */
export default {
  plugins: ["prettier-plugin-astro"],
  singleQuote: true,
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
    {
      files: ["*.js", "*.jsx", "*.ts", "*.tsx", "*.mjs"],
      options: {
        singleQuote: true,
      },
    },
  ],
};
