const _ = require('lodash');

let term;
const managePackage = (req, res, args) => {
  const pty = require('node-pty');

  const { action, pkgName, version } = req.body;

  if (action === 'cancel') {
    if (term) term.kill();
    res.send(JSON.stringify({ success: true }));
    return;
  }
  const useYarn = rekit.core.utils.useYarn();

  let cmd;
  if (useYarn) cmd = process.platform === 'win32' ? 'yarn.cmd' : 'yarn';
  else cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  const params = [];
  if (term) return;
  if (action === 'update') {
    if (useYarn) params.push('upgrade', `${pkgName}@latest`);
    else params.push('install', `${pkgName}@latest`);
  } else if (action === 'update-in-range') {
    if (useYarn) params.push('upgrade', `${pkgName}`);
    else params.push('update', `${pkgName}`);
  } else if (action === 'uninstall') {
    if (useYarn) params.push('remove', pkgName);
    else params.push('uninstall', pkgName);
  } else {
    res.send('unknown action: ' + action);
    return;
  }

  term = pty.spawn(cmd, params, {
    name: 'xterm-color',
    cwd: rekit.core.paths.getProjectRoot(),
    env: process.env,
  });
  term.action = action;
  term.pkgName = pkgName;
  term.version = version;

  const arr = [];
  const flush = _.throttle(data => {
    args.io.emit({
      type: 'PLUGIN_PTY_OUTPUT',
      data: {
        id: `manage_package_term`,
        output: arr,
      },
    });
    arr.length = 0;
  }, 100);
  term.on('data', function(data) {
    arr.push(data);
    flush();
  });
  term.on('exit', () => {
    flush();
    args.io.emit({
      type: 'PLUGIN_DEPS_MANAGER_MANAGE_PACKAGE_EXIT',
      data: { name: pkgName },
    });
    term = null;
  });
  args.io.emit({
    type: 'PLUGIN_DEPS_MANAGER_MANAGE_PACKAGE_STARTED',
    data: {
      action: action,
      pkgName: pkgName,
      version: version,
    },
  });
  res.send(pkgName);
};
managePackage.getRunning = () => {
  if (!term) return null;
  return {
    action: term.action,
    pkgName: term.pkgName,
    version: term.pkgName.version,
  };
};
module.exports = managePackage;
