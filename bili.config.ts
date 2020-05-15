import { Config } from 'bili'

const config: Config = {
  input: {
    index: 'src/index.tsx',
  },
  output: {
    format: ['cjs', 'umd', 'umd-min', 'esm'],
    moduleName: 'ReactEasyCrop',
    sourceMap: true,
    extractCSS: false,
  },
  globals: {
    react: 'React',
  },
  plugins: {
    postcss: {
      inject: false,
    },
  },
  extendConfig(config, { format }) {
    if (format.startsWith('umd')) {
      config.output.fileName = 'umd/react-easy-crop[min].js'
    }
    if (format === 'esm') {
      config.output.fileName = '[name].module.js'
    }
    return config
  },
  env: {
    NODE_ENV: 'production',
  },
}

export default config
