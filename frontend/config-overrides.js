const WorkerPlugin = require('worker-plugin');
const FormulaParser = require("fast-formula-parser");
const allTokenNames = FormulaParser.allTokens.map(tokenType => tokenType.name);

module.exports = {
  webpack: function (config, env) {
    config.plugins.push(
      new WorkerPlugin()
    );

    config.optimization.minimizer[0].options.terserOptions.reserved = allTokenNames;
    // console.log(config.optimization.minimizer[0].options.terserOptions.reserved)
    return config;
  },
  jest: function (config) {
    config.verbose = true;
    return config;
  },
};

