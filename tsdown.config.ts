/**
 * Standalone build config for the preset center.
 *
 * Uses this repository's copy of the shared client-bundle preset
 * (shared/tsdown.client.ts): node-half lib/ plus the browser bundle
 * lib/client.js.
 */
import { clientBundle } from './shared/tsdown.client.ts'

export default clientBundle('@linxin666/dsh-client-ui-preset-center', ['src/index.ts'], {
  libExternal: [
    '@deepseek-ai/dsh-client-connection',
    '@deepseek-ai/dsh-client-locale',
    '@deepseek-ai/dsh-client-ui-slots',
  ],
})
