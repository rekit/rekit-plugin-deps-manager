const path = require('path');
const build = require('rekit-studio/lib/build');

build({ pluginDir: path.join(__dirname, '..') });
