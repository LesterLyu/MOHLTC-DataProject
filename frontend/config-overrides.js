const WorkerPlugin = require('worker-plugin');
const {FormulaParser} = require("fast-formula-parser/grammar/hooks");
const allTokenNames = FormulaParser.allTokens.map(tokenType => tokenType.name);
const TerserPlugin = require('terser-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const {DuplicatesPlugin} = require("inspectpack/plugin");

module.exports = {
  webpack: function (config, env) {
    config.stats = {
      reasons: true,
    };
    config.plugins.push(new WorkerPlugin());
    config.plugins.push(new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      defaultSizes: 'parsed',
      reportFilename: 'webpack-report.html',
    }));
    // config.plugins.push(new DuplicatesPlugin({
    //   // Emit compilation warning or error? (Default: `false`)
    //   emitErrors: false,
    //   // Display full duplicates information? (Default: `false`)
    //   verbose: false
    // }));
    config.externals = ['child_process', 'worker_threads'];

    config.optimization.minimizer[0] = new TerserPlugin({
      terserOptions: {
        parse: {
          // we want terser to parse ecma 8 code. However, we don't want it
          // to apply any minfication steps that turns valid ecma 5 code
          // into invalid ecma 5 code. This is why the 'compress' and 'output'
          // sections only apply transformations that are ecma 5 safe
          // https://github.com/facebook/create-react-app/pull/4234
          ecma: 8,
        },
        compress: {
          ecma: 5,
          warnings: false,
          // Disabled because of an issue with Uglify breaking seemingly valid code:
          // https://github.com/facebook/create-react-app/issues/2376
          // Pending further investigation:
          // https://github.com/mishoo/UglifyJS2/issues/2011
          comparisons: false,
          // Disabled because of an issue with Terser breaking valid code:
          // https://github.com/facebook/create-react-app/issues/5250
          // Pending futher investigation:
          // https://github.com/terser-js/terser/issues/120
          inline: 2,
        },
        mangle: {
          reserved: allTokenNames,
          safari10: true,
        },
        output: {
          ecma: 5,
          comments: false,
          // Turned on because emoji and regex is not minified properly using default
          // https://github.com/facebook/create-react-app/issues/2488
          ascii_only: true,
        },
      },
      // Use multi-process parallel running to improve the build speed
      // Default number of concurrent runs: os.cpus().length - 1
      parallel: true,
      // Enable file caching
      cache: true,
      sourceMap: true,
    });

    // console.log(config.optimization.minimizer[0].options.terserOptions.reserved)
    return config;
  },
  jest: function (config) {
    config.verbose = true;
    return config;
  },
};

