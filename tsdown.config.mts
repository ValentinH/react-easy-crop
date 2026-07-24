/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { defineConfig } from 'tsdown'

const rawCssPlugin = () => ({
  name: 'raw-css',
  load(id: string) {
    if (!id.endsWith('.css?raw')) return null

    const css = readFileSync(id.replace(/\?raw$/, ''), 'utf8')
    return `export default ${JSON.stringify(css)}`
  },
})

const sharedConfig = {
  entry: 'src/index.ts',
  format: ['cjs', 'esm'] as Array<'cjs' | 'esm'>,
  dts: {
    sourcemap: true,
  },
  env: {
    NODE_ENV: 'production',
  },
  plugins: [rawCssPlugin()],
  sourcemap: true,
  target: 'es2015',
  outputOptions: {
    exports: 'named' as const,
  },
  outExtensions: () => ({
    js: '.js',
    dts: '.d.mts',
  }),
  deps: {
    neverBundle: ['react', 'normalize-wheel'],
  },
}

export default defineConfig({
  ...sharedConfig,
  outExtensions: ({ format }) => ({
    js: format === 'es' ? '.module.mjs' : '.js',
    dts: format === 'es' ? '.d.mts' : '.d.ts',
  }),
})
