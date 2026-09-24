import { defineConfig } from 'vitest/config'

// The package's specs run on the node environment and opt into jsdom where
// they need a DOM: the panel spec carries its own "@vitest-environment jsdom"
// docblock, exactly as it did inside the dsh-web monorepo. The setup file is
// the family's shared one - it installs the browser-module loader and repairs
// the storage global Node 25 leaves behind; shared/vitest.setup.ts has the
// mechanism.
export default defineConfig({
  // npm SDK packages reference sourcemaps that are not published (files
  // exclude *.map); do not attempt to load them during transform.
  server: {
    sourcemapIgnoreList: () => true,
  },
  test: {
    include: ['tests/**/*.spec.{ts,tsx}'],
    pool: 'forks',
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    // @deepseek-ai SDK packages ship browser bundles (CSS imports included);
    // keep them vite-transformed instead of node-externalized.
    server: {
      deps: {
        inline: [/@deepseek-ai\//],
      },
    },
  },
})
