import babel from '@rolldown/plugin-babel'
import { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    babel({
      exclude: [/[/\\]node_modules[/\\]/, /\.test\./],
      // Compile imported source, but keep test harnesses outside Compiler inference.
      presets: [reactCompilerPreset({ target: '19', panicThreshold: 'all_errors' })],
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
