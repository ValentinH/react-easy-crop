/* eslint-disable no-console, import/no-extraneous-dependencies */
const path = require('path')
const fse = require('fs-extra')

async function copyFile(file) {
  const buildPath = path.resolve(__dirname, '../dist/', path.basename(file.to || file.from))
  await fse.copy(file.from, buildPath)
  console.log(`Copied ${file.from} to ${buildPath}`)
}

async function createPackageFile() {
  const packageData = await fse.readFile(path.resolve(__dirname, '../package.json'), 'utf8')
  const newPackageData = {
    ...JSON.parse(packageData),
    scripts: undefined,
    devDependencies: undefined,
    'lint-staged': undefined,
    main: './index.js',
    module: './index.module.mjs',
    types: './index.d.ts',
    exports: {
      '.': {
        types: './index.d.ts',
        import: './index.module.mjs',
        require: './index.js',
        default: './index.module.mjs',
      },
      './react-easy-crop.css': {
        import: './react-easy-crop.css',
        require: './react-easy-crop.css',
      },
    },
  }
  const buildPath = path.resolve(__dirname, '../dist/package.json')

  await fse.writeFile(buildPath, JSON.stringify(newPackageData, null, 2), 'utf8')
  console.log(`Created package.json in ${buildPath}`)

  return newPackageData
}

async function run() {
  await Promise.all(
    [
      { from: './README.md' },
      { from: './LICENSE' },
      { from: './src/styles.css', to: 'react-easy-crop.css' },
    ].map((file) => copyFile(file))
  )
  await createPackageFile()
}

run()
