// Export plugin here if it extends rekit-core or rekit-studio.
const fs = require('fs');

module.exports = {
  studio: require('./studio'),
  app: require('./app'),
  shouldUse: () => fs.existsSync(rekit.core.paths.map('package.json'))
};
