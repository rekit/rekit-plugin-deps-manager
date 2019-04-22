const path = require('path');
const start = require('rekit-studio/lib/startDevServer');

const root = path.join(__dirname, '..');
start({
  // The project Rekit Studio manages, change it if you want Rekit Studio to load
  // another project rather than the plugin project itself.
  projectRoot: path.join(__dirname, '../../app1'),
  pluginDir: root,
  noDevDll: false,
  port: require('../rekit.json').devPort,
});
