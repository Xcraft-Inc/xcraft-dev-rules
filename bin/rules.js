#!/usr/bin/env node
'use strict';

const path = require('path');
const fse = require('fs-extra');

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
  {
    file: 'hooks/pre-commit',
    outDir: 'hooks',
    type: 'git',
  },
];

files.forEach(item => {
  let options = null;

  /* special git stuff */
  if (item.type === 'git') {
    options = {mode: 0o755};
    const gitDir = path.join(root, '.git');
    try {
      const st = fse.statSync(gitDir);
      if (st && st.isFile()) {
        /* search for the real .git directory */
        const data = fse.readFileSync(gitDir);
        if (data) {
          item.outDir = path.join(
            data
              .toString()
              .replace(/^gitdir: /, '')
              .replace('\n', ''),
            item.outDir
          );
        }
      } else if (st && st.isDirectory()) {
        item.outDir = path.join('.git', item.outDir);
      } else {
        throw {code: 'ENOENT'};
      }
    } catch (ex) {
      if (ex.code !== 'ENOENT') {
        throw ex;
      }
      console.log('skip hook deploy because we are not in a git repository');
      return;
    }
  }

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
