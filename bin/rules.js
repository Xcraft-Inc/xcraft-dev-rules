#!/usr/bin/env node
'use strict';

const path = require('path');
const {fse} = require('xcraft-core-fs');

const root = __dirname.replace(/(.*?)[\\/]node_modules[\\/].*/, '$1');
if (!root.length || root === __dirname) {
  process.exit(0);
}

const files = [
  {
    file: '.editorconfig',
    outDir: '.',
  },
  {
    file: '.eslintrc.js',
    outDir: '.',
  },
];

files.forEach((item) => {
  let options = null;

  if (!path.isAbsolute(item.outDir)) {
    item.outDir = path.join(root, item.outDir);
  }

  const src = path.join(__dirname, '..', item.file);
  const dst = path.join(item.outDir, path.basename(item.file));

  console.log(`try to copy ${item.file} to ${dst}`);

  if (fse.existsSync(dst)) {
    console.warn(
      `your current ${path.basename(item.file)} will be overwritten`
    );
  }

  fse.mkdirpSync(path.dirname(dst));

  /* FIXME: use streams */
  const fileNorm = require('file-normalize');
  fse.writeFileSync(
    dst,
    fileNorm.normalizeEOL(fse.readFileSync(src).toString()),
    options
  );
});

/* Copy the prettier dependency to the package.json project file */

const inPackageJson = path.join(__dirname, '../package.json');
const inPackageDef = fse.readFileSync(inPackageJson);
const inDef = JSON.parse(inPackageDef);

const outPackageJson = path.join(root, 'package.json');
const outPackageDef = fse.readFileSync(outPackageJson);
const outDef = JSON.parse(outPackageDef);

if (!outDef.devDependencies) {
  outDef.devDependencies = {};
}

if (outDef.dependencies && outDef.dependencies.prettier) {
  outDef.dependencies.prettier = inDef.dependencies.prettier;
  outDef.dependencies['xcraft-dev-prettier'] =
    inDef.dependencies['xcraft-dev-prettier'];
} else if (
  outDef.devDependencies.prettier ||
  (!(outDef.dependencies && outDef.dependencies.prettier) &&
    !outDef.devDependencies.prettier)
) {
  outDef.devDependencies.prettier = inDef.dependencies.prettier;
  outDef.devDependencies['xcraft-dev-prettier'] =
    inDef.dependencies['xcraft-dev-prettier'];
}
outDef.prettier = 'xcraft-dev-prettier';

fse.writeFileSync(outPackageJson, JSON.stringify(outDef, null, 2));
console.log('inject prettier in the package.json file');
