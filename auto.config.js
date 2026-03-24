// not using TS anymore due to https://github.com/intuit/auto/issues/2248

const npmOptions = {
  publishFolder: './dist',
  // OIDC trusted publishing should not require NPM_TOKEN injection in .npmrc
  setRcToken: false,
}

module.exports = function rc() {
  return {
    shipit: {
      noChangelog: true,
    },
    plugins: [['npm', npmOptions], 'released', 'first-time-contributor', 'all-contributors'],
    author: 'Valentin Hervieu <valentin@hervi.eu>',
  }
}
