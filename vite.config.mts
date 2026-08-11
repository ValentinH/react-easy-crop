import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    babel({
      // Keep the demo/Cypress runtime identical to the published Compiler contract.
      presets: [reactCompilerPreset({ target: '19', panicThreshold: 'all_errors' })],
    }),
  ],
})
