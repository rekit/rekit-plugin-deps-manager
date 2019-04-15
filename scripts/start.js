const path = require('path');
const start = require('rekit-studio/lib/startDevServer');

const root = path.join(__dirname, '..');
start({
  // The project Rekit Studio manages, change it if you don't want Rekit Studio to load the plugin project itself.
  projectRoot: path.join(__dirname, '../../rekit-app'),
  pluginDir: root,
  noDevDll: true,
  port: require('../rekit.json').devPort,
});
