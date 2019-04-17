const path = require('path');
const deployPlugin = require('rekit-studio/lib/deployPlugin');

const root = path.join(__dirname, '..');
deployPlugin(root);
