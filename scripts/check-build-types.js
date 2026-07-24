/* eslint-disable no-console, import/no-extraneous-dependencies */
const { execFileSync } = require('child_process')
const path = require('path')
const fse = require('fs-extra')

const projectPath = path.resolve(__dirname, '..')
const fixturePath = path.join(projectPath, 'tests/build-types')
const buildFixturePath = path.join(projectPath, 'dist/__type-tests__')
const tscPath = require.resolve('typescript/bin/tsc')
const commonArgs = [
  tscPath,
  '--ignoreConfig',
  '--noEmit',
  '--module',
  'node16',
  '--moduleResolution',
  'node16',
  '--strict',
  '--skipLibCheck',
  '--target',
  'es2020',
]

function typeCheck(file, additionalArgs = []) {
  execFileSync(process.execPath, [...commonArgs, ...additionalArgs, file], {
    cwd: projectPath,
    stdio: 'inherit',
  })
}

try {
  fse.copySync(fixturePath, buildFixturePath)
  typeCheck(path.join(buildFixturePath, 'cjs/index.tsx'), ['--jsx', 'react-jsx'])
  typeCheck(path.join(buildFixturePath, 'esm/index.mts'))
} finally {
  fse.removeSync(buildFixturePath)
}
