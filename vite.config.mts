import babel from '@rolldown/plugin-babel'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { createReactCompilerBabelConfig } from './react-compiler.config.mts'

export default defineConfig({
  plugins: [react(), babel(createReactCompilerBabelConfig())],
})
