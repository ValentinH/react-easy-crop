const { defineConfig } = require('cypress')

module.exports = defineConfig({
  projectId: 'ie9fhh',
  e2e: {
    baseUrl: 'http://localhost:3001',
    specPattern: 'cypress/integration/**/*.js',
    supportFile: 'cypress/support/index.js',
    setupNodeEvents(on) {
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-gpu-rasterization')
        }

        return launchOptions
      })
    },
  },
})
