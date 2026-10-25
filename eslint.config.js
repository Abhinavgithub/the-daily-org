// What `npm run lint` checks: the mistakes a type check does not catch, in the pipeline and the site's code.
import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', '.astro/', '.wrangler/', 'node_modules/', 'public/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // The pages and components: their front matter and their scripts.
  ...astro.configs.recommended,
  // An empty catch is how this code says a failure there does not matter (storage a browser refuses, say).
  { rules: { 'no-empty': ['error', { allowEmptyCatch: true }] } },
  // Config files run in Node.
  { files: ['*.mjs', '*.js'], languageOptions: { globals: { process: 'readonly', URL: 'readonly' } } },
  // The tests match YAML, where the run of spaces is the indentation being checked.
  { files: ['**/*.test.ts'], rules: { 'no-regex-spaces': 'off' } },
);
