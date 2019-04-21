const pty = require('node-pty');

module.exports = (req, res, args) => {
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  const term = pty.spawn(npmCmd, ['run', name], {
    name: 'xterm-color',
    cwd: rekit.core.paths.getProjectRoot(),
    env: process.env,
  });
  terms[name] = term;
  const arr = [];
  const flush = _.throttle(data => {
    args.io.emit({
      type: 'PLUGIN_PTY_OUTPUT',
      data: {
        id: `run_script_${name}`,
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
    console.log('term exit: ', name);
    flush();
    args.io.emit({
      type: 'PLUGIN_SCRIPTS_EXIT',
      data: { name },
    });
    delete terms[name];
  });

  res.send(name);
};
