#!/usr/bin/env node
'use strict';

const root = __dirname.replace (/(.*)[\\/]node_modules[\\/].*/, '$1');
if (!root.length) {
  process.exit (0);
}

const path = require ('path');
const fse = require ('fs-extra');

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

files.forEach (item => {
  /* special git stuff */
  if (item.type === 'git') {
    const gitDir = path.join (root, '.git');
    const st = fse.statSync (gitDir);
    if (st && st.isFile ()) {
      /* search for the real .git directory */
      const data = fse.readFileSync (gitDir);
      if (data) {
        item.outDir = path.join (
          data.toString ().replace (/^gitdir: /, '').replace ('\n', ''),
          item.outDir
        );
      }
    }
  }

  const src = path.join (__dirname, '..', item.file);
  const dst = path.join (root, item.outDir, path.basename (item.file));

  console.log (`try to copy ${item.file} to ${dst}`);

  if (fse.existsSync (dst)) {
    console.warn (
      `your current ${path.basename (item.file)} will be overwritten`
    );
  }

  fse.copySync (src, dst);
});
