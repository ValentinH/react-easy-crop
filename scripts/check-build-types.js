// Compile representative consumers against dist to catch broken CJS or ESM type exports.
/* eslint-disable no-console, import/no-extraneous-dependencies */
const assert = require('assert')
const { execFileSync } = require('child_process')
const fs = require('fs')
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

function checkPublishedBuild(file) {
  const code = fs.readFileSync(path.join(projectPath, 'dist', file), 'utf8')
  const hookStart = code.indexOf('function useCropper(')

  assert.match(
    code.slice(0, 200),
    /(?:^|\n)["']use client["'];/,
    `${file} must preserve the client boundary`
  )
  assert.match(
    code,
    /react\/compiler-runtime/,
    `${file} must externalize the React Compiler runtime`
  )
  assert.notStrictEqual(hookStart, -1, `${file} must contain useCropper`)
  assert.match(
    code.slice(hookStart, hookStart + 250),
    /const \$ = (?:c|\(0, [^)]+\.c\))\(/,
    `${file} must compile useCropper with React Compiler`
  )
}

try {
  fse.copySync(fixturePath, buildFixturePath)
  typeCheck(path.join(buildFixturePath, 'cjs/index.tsx'), ['--jsx', 'react-jsx'])
  typeCheck(path.join(buildFixturePath, 'esm/index.mts'))
  checkPublishedBuild('index.js')
  checkPublishedBuild('index.module.mjs')

  const packageData = require(path.join(projectPath, 'dist/package.json'))
  assert.deepStrictEqual(
    packageData.peerDependencies,
    { react: '^19.2.0' },
    'the published package must only peer-depend on React 19.2'
  )
} finally {
  fse.removeSync(buildFixturePath)
}
