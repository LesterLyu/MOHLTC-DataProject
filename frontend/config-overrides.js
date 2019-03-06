const WorkerPlugin = require('worker-plugin');

module.exports = {
  webpack: function (config, env) {
    config.plugins.push(
      new WorkerPlugin()
    );
    return config;
  },
  jest: function (config) {
    config.verbose = true;
    return config;
  },
};

