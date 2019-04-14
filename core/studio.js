'use strict';

// const rekitCore = require('rekit-core');
const packageJson = require('package-json');
const _ = require('lodash');
const resolveFrom = require('resolve-from');
const fs = require('fs-extra');
// const helpers = require('../helpers');

// const tils = rekitCore.utils;

let latestVersionCache = {};
let pkgCache = {};
// Clear cache every 2 hours.
setInterval(() => {
  latestVersionCache = {};
}, 7200000);

function fetchLatestVersions(names, io) {
  const requests = names.map(name => () => pkgCache[name] ? Promise.resolve(pkgCache[name]) : packageJson(name));
  requests.reduce((promise, request) => {
    return promise
      .then(json => {
        if (json) {
          io.emit('DEPS_PLUGIN_LATEST_VERSION', {
            [json.name]: json.version,
          });
          pkgCache[json.name] = json;
        }
        return request();
      })
      .catch(err => request());
  }, Promise.resolve());
}
function config(server, app, args) {
  // const pkgJsonPath = paths.map('package.json');
  app.get('/api/plugin-deps-manager/deps', (req, res) => {
    const { paths, config } = rekit.core;
    const pkgJson = config.getPkgJson(true);
    if (!pkgJson) {
      res.send(JSON.stringify({ error: 'package.json not found.' }));
      return;
    }

    const allDeps = Object.assign(
      {},
      pkgJson.dependencies || {},
      pkgJson.devDependencies || {},
      pkgJson.peerDependencies || {},
    );

    const prjRoot = paths.getProjectRoot();
    Object.keys(allDeps).forEach(key => {
      let installedVersion = '--';
      try {
        installedVersion = fs.readJsonSync(resolveFrom(prjRoot, `${key}/package.json`)).version; //  helpers.forceRequire(`${key}/package.json`).version; // eslint-disable-line
      } catch (e) {} // eslint-disable-line
      allDeps[key] = {
        requiredVersion: allDeps[key],
        installedVersion,
        latestVersion: 'TODO',
      };
    });

    fetchLatestVersions(Object.keys(allDeps), args.io);

    res.send(JSON.stringify(allDeps));
  });
  function fetchDepsRemote() {
    return new Promise((resolve, reject) => {
      const prjRoot = rekitCore.utils.getProjectRoot();
      const prjPkgJson = helpers.forceRequire(rekitCore.utils.joinPath(prjRoot, 'package.json')); // eslint-disable-line
      const allDeps = Object.assign({}, prjPkgJson.dependencies, prjPkgJson.devDependencies);
      Object.keys(allDeps).forEach(key => {
        let installedVersion = '--';
        try {
          installedVersion = helpers.forceRequire(`${key}/package.json`).version; // eslint-disable-line
        } catch (e) {} // eslint-disable-line
        allDeps[key] = {
          requiredVersion: allDeps[key],
          installedVersion,
          latestVersion: 'TODO',
        };
      });
      Promise.all(
        Object.keys(allDeps).map(name => {
          if (latestVersionCache[name]) {
            allDeps[name].latestVersion = latestVersionCache[name];
            return Promise.resolve();
          }
          return packageJson(name).then(json => {
            allDeps[json.name].latestVersion = json.version;
            latestVersionCache[name] = json.version;
          });
        }),
      )
        .then(() => {
          resolve({
            deps: Object.keys(prjPkgJson.dependencies || {}),
            devDeps: Object.keys(prjPkgJson.devDependencies || {}),
            allDeps,
          });
        })
        .catch(() => {
          resolve({
            deps: Object.keys(prjPkgJson.dependencies || {}),
            devDeps: Object.keys(prjPkgJson.devDependencies || {}),
            allDeps,
            hasError: true,
          });
        });
    });
  }
}

module.exports = { config };
