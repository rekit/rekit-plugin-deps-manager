const path = require('path');
const undeployPlugin = require('rekit-studio/lib/undeployPlugin');

const root = path.join(__dirname, '..');
undeployPlugin(root);
