module.exports = (on, config) => {
  on('before:browser:launch', (browser = {}, args) => {
    if (browser.name === 'chrome') {
      args.push('--disable-gpu-rasterization') // fixes rendering issues on my computer (https://github.com/cypress-io/cypress/issues/1617)
      return args
    }
  })
}
