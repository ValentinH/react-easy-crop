import { reactCompilerPreset } from '@vitejs/plugin-react'

export const createReactCompilerBabelConfig = () => ({
  // Keep every runtime aligned with the published Compiler contract.
  presets: [reactCompilerPreset({ target: '19', panicThreshold: 'all_errors' })],
})
