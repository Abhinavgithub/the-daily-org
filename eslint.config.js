// What `npm run lint` checks: the mistakes a type check does not catch, in the pipeline and the site's code.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', '.astro/', 'node_modules/', 'public/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Config files run in Node.
  { files: ['*.mjs', '*.js'], languageOptions: { globals: { process: 'readonly', URL: 'readonly' } } },
  // The tests match YAML, where the run of spaces is the indentation being checked.
  { files: ['**/*.test.ts'], rules: { 'no-regex-spaces': 'off' } },
);
