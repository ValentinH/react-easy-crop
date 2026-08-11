import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vitest/config'
import { createReactCompilerBabelConfig } from './react-compiler.config.mts'

export default defineConfig({
  plugins: [
    babel({
      exclude: [/[/\\]node_modules[/\\]/, /\.test\./],
      // Compile imported source, but keep test harnesses outside Compiler inference.
      ...createReactCompilerBabelConfig(),
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
