module.exports = {
  build: {
    env: require('./prod.env'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/'
  },
  dev: {
    env: require('./dev.env'),
    port: {
      'http': 9180,
      'https': 9143
    },
    autoOpenBrowser: true,
    proxyTable: {
    },
  }
}
