const path = require('path');

module.exports = (config) => {
  console.log('Custom webpack config is being applied!');

  config.output.devtoolModuleFilenameTemplate = function (info) {
    const rel = path.relative(process.cwd(), info.absoluteResourcePath);
    console.log('devtoolModuleFilenameTemplate called with:', info.absoluteResourcePath, '->', `webpack:///./${rel}`);
    return `webpack:///./${rel}`;
  };

  // Explicitly set output path
  config.output.path = path.resolve(process.cwd(), 'dist/apps/gisday-nest');

  return config;
};