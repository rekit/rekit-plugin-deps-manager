const packageJson = require('package-json');
const _ = require('lodash');
const resolveFrom = require('resolve-from');
const fs = require('fs-extra');
const chokidar = require('chokidar');

let pkgCache = {};
let allDeps;
let watcher;

// Clear cache every 2 hours.
setInterval(() => {
  pkgCache = {};
}, 7200000);

const flushLatestVersions = _.throttle(io => {
  io.emit({
    type: 'PLUGIN_DEPS_MANAGER_LATEST_VERSIONS',
    data: _.mapValues(pkgCache, json => json.version),
  });
}, 1000);

function startWatch(io) {
  if (watcher) return;
  const { paths } = rekit.core;
  watcher = chokidar.watch(
    [paths.map('package.json'), paths.map('package-lock.json'), paths.map('yarn.lock')],
    {
      persist: true,
    },
  );
  watcher.on('all', _.debounce((...a) => refresh(io), 100));
}

function refresh(io) {
  allDeps = null;
  pkgCache = {};
  fetchAllDeps(io);
}

const DEP_TYPES = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
  'bundledDependencies',
];

const fetchAllDeps = _.debounce(io => {
  const { paths, config } = rekit.core;
  const pkgJson = config.getPkgJson(true);
  if (!pkgJson) {
    return;
  }

  allDeps = {};

  const prjRoot = paths.getProjectRoot();
  DEP_TYPES.forEach(type => {
    const obj = pkgJson[type];
    if (!obj) return;
    Object.keys(obj).forEach(key => {
      let installedVersion = '--';
      try {
        installedVersion = fs.readJsonSync(resolveFrom(prjRoot, `${key}/package.json`)).version;
      } catch (e) {
        // Do nothing if failed to get local installed version
        // This happens if module not installed.
      }
      if (allDeps[key]) {
        if (allDeps[key].duplicated) allDeps[key].duplicated.push(type);
        else allDeps[key].duplicated = [type];
      } else {
        allDeps[key] = {
          name: key,
          requiredVersion: obj[key],
          installedVersion,
          type: type.replace(/dependencies/i, ''),
        };
      }
    });
  });
  fetchLatestVersions(io);
  io.emit({
    type: 'PLUGIN_DEPS_MANAGER_FETCH_ALL_DEPS_SUCCESS',
    data: allDeps,
  });
}, 100);

function fetchLatestVersions(io) {
  if (!allDeps) return;
  Object.keys(allDeps).forEach(name => {
    if (pkgCache[name]) flushLatestVersions(io);
    else
      packageJson(name)
        .then(json => {
          pkgCache[name] = json;
          flushLatestVersions(io);
        })
        .catch(() => {
          rekit.core.logger.warn('Failed to get package info: ' + name);
        });
  });
}

function config(server, app, args) {
  app.get('/api/plugin-deps-manager/refresh-deps', (req, res) => {
    refresh(args.io);
    res.send(JSON.stringify({ success: true }));
  });

  app.get('/api/plugin-deps-manager/deps', (req, res) => {
    startWatch(args.io);
    fetchAllDeps(args.io);
    res.send(JSON.stringify({ success: true }));
  });

  app.post('/api/plugin-deps-manager/exec-npm-cmd', (req, res) => require('./execNpmCmd')(req, res, args));
}

module.exports = { config };
