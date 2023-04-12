#!/usr/bin/env node
'use strict';

const path = require('path');
const xFs = require('xcraft-core-fs');

function completeDevDeps(bundlePath) {
  const packagePath = path.join(bundlePath, 'package.json');
  const packageDef = xFs.fse.readJSONSync(packagePath);
  const nodeModulesDir = path.join(bundlePath, 'node_modules');

  const devDeps = xFs.lsdir(nodeModulesDir, /^goblin-/).reduce(
    (deps, mod) => {
      const packPath = path.join(nodeModulesDir, mod, 'package.json');
      const _package = xFs.fse.readJSONSync(packPath);
      deps = {...deps, ..._package.devDependencies};
      return deps;
    },
    {...(packageDef.devDependencies || {})}
  );

  packageDef.devDependencies = Object.fromEntries(
    new Map([...Object.entries(devDeps)].sort())
  );
  xFs.fse.writeJSONSync(packagePath, packageDef, {spaces: 2});
}

function main(args) {
  completeDevDeps(args[args.length - 1]);
}

main(process.argv);
