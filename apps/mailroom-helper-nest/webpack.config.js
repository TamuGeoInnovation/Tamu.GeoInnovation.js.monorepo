const { composePlugins, withNx } = require('@nx/webpack');

// Nx 17 builds each app from its own webpack config (isolatedConfig); without one the build fails
// with 'Using "isolatedConfig" without a "webpackConfig" is not supported' (#1365).
module.exports = composePlugins(withNx(), (config) => config);
