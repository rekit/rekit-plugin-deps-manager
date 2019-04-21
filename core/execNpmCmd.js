const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

module.exports = (req, res, args) {
let cmd;
  if (rekit.core.utils.useYarn()) cmd = `yarn add ${name}@latest --colors`;
  else cmd = `npm install ${name}@latest --colors --save`;
  return runTask(io, cmd, 'install-package', { name });
}