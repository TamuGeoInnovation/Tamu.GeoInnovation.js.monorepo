const path = require('path');
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');

// The options the @nx/webpack:webpack executor used to pass in through withNx(), moved here by
// @nx/webpack:convert-to-inferred: Nx 24 removes both (#2168). NxAppWebpackPlugin builds from them under the
// inferred @nx/webpack/plugin target, and the configuration (production, development) picks its set.
// fileReplacements are absolute because the plugin resolves a relative one from the workspace root, not from here, and a
// replacement that names no file is skipped without a word: the production build then shipped environment.ts.
const configValues = {
  build: {
    default: {
      outputPath: '../../dist/apps/gisday-nest',
      main: './src/main.ts',
      // Absolute: the plugin turns './tsconfig.app.json' into a workspace-relative path, then reads it from this folder
      // (where the inferred target runs webpack), finds nothing, and so leaves tslib out of the generated package.json.
      tsConfig: path.join(__dirname, 'tsconfig.app.json'),
      assets: [
        './src/assets',
        './src/Dockerfile',
        './src/docker-compose.yml',
        { glob: '**/*', input: '../../libs/assets', output: './assets' }
      ],
      target: 'node',
      compiler: 'tsc',
      // What the executor's build came to when an option was not set. The plugin instead takes these from NODE_ENV, which
      // the executor always set to production and the inferred target sets per configuration, so they are written out.
      outputHashing: 'none',
      optimization: false,
      namedChunks: false,
      vendorChunk: false,
      sourceMap: true,
      devtool: 'source-map'
    },
    production: {
      optimization: true,
      extractLicenses: false,
      inspect: false,
      fileReplacements: [
        {
          replace: path.join(__dirname, 'src/environments/environment.ts'),
          with: path.join(__dirname, 'src/environments/environment.prod.ts')
        }
      ],
      generatePackageJson: true
    },
    development: {
      optimization: true,
      extractLicenses: false,
      inspect: false,
      fileReplacements: [
        {
          replace: path.join(__dirname, 'src/environments/environment.ts'),
          with: path.join(__dirname, 'src/environments/environment.dev.ts')
        }
      ],
      generatePackageJson: true
    }
  }
};

// Determine the correct configValue to use based on the configuration
const configuration = process.env.NX_TASK_TARGET_CONFIGURATION || 'default';

const buildOptions = {
  ...configValues.build.default,
  ...configValues.build[configuration]
};

// Source map paths name each module from the workspace root (webpack:///./apps/...), as they did when the executor ran
// webpack from there. The inferred target runs it from this folder, so the root is named outright rather than taken
// from process.cwd().
const workspaceRoot = path.join(__dirname, '../..');

// main.js exports what its entry exports, as the executor's build did (output.libraryTarget 'commonjs'). The plugin sets
// that from apply(), which is too late for webpack 5, so it is stated here.
module.exports = {
  output: {
    library: { type: 'commonjs' },
    devtoolModuleFilenameTemplate(info) {
      // Webpack's own runtime modules have a relative name (webpack/bootstrap), which stays as it is.
      const rel = path.isAbsolute(info.absoluteResourcePath)
        ? path.relative(workspaceRoot, info.absoluteResourcePath)
        : info.absoluteResourcePath;
      console.log('devtoolModuleFilenameTemplate called with:', info.absoluteResourcePath, '->', `webpack:///./${rel}`);
      return `webpack:///./${rel}`;
    }
  },
  plugins: [new NxAppWebpackPlugin(buildOptions)]
};
