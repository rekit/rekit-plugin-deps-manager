'use strict';

// const rekitCore = require('rekit-core');
const packageJson = require('package-json');
const _ = require('lodash');
const resolveFrom = require('resolve-from');
const fs = require('fs-extra');
// const helpers = require('../helpers');

// const tils = rekitCore.utils;

let pkgCache = {};
// Clear cache every 2 hours.
setInterval(() => {
  pkgCache = {};
}, 7200000);

const flush = _.debounce((io) => {
  io.emit('DEPS_PLUGIN_LATEST_VERSION', _.mapValues(pkgCache, json => json.version));
}, 1000);

function fetchLatestVersions(names, io) {
  // const requests = names.map(name => () =>
  //   pkgCache[name] ? Promise.resolve(pkgCache[name]) : packageJson(name),
  // );
  names.forEach(name => {
    if (pkgCache[name]) flush(io);
    else packageJson(name).then(json => {
      pkgCache[name] = json;
      flush(io);
    });
  });
  // requests
  //   .reduce((promise, request) => {
  //     return promise
  //       .then(json => {
  //         if (json) {
  //           io.emit('DEPS_PLUGIN_LATEST_VERSION', {
  //             [json.name]: json.version,
  //           });
  //           pkgCache[json.name] = json;
  //         }
  //         return request();
  //       })
  //       .catch(err => request());
  //   }, Promise.resolve())
  //   .then(json => {
  //     if (json) {
  //       io.emit('DEPS_PLUGIN_LATEST_VERSION', {
  //         [json.name]: json.version,
  //       });
  //       pkgCache[json.name] = json;
  //     }
  //     return null;
  //   });
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
      };
    });

    fetchLatestVersions(Object.keys(allDeps), args.io);

    res.send(JSON.stringify(allDeps));
  });
}

module.exports = { config };
