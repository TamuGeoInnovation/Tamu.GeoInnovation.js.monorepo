const path = require('path');
const { composePlugins, withNx } = require('@nx/webpack');

// Nx 17 builds from this file alone (isolatedConfig), so withNx() supplies the base config the
// function below adjusts; before, Nx passed it in (#1365).
module.exports = composePlugins(withNx(), (config) => {
  console.log('Custom webpack config is being applied!');

  config.output.devtoolModuleFilenameTemplate = function (info) {
    const rel = path.relative(process.cwd(), info.absoluteResourcePath);
    console.log('devtoolModuleFilenameTemplate called with:', info.absoluteResourcePath, '->', `webpack:///./${rel}`);
    return `webpack:///./${rel}`;
  };

  // Explicitly set output path
  config.output.path = path.resolve(process.cwd(), 'dist/apps/gisday-nest');

  return config;
});
