const { getRunning } = require('./managePackage');
module.exports = {
  getProjectData() {
    return {
      pluginDepsManager: {
        running: getRunning(),
      },
    };
  },
};
