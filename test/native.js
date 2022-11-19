
/* IMPORT */

import {describe} from 'fava';
import fs from 'node:fs';
import path from 'node:path';
import readdir from '../dist/index.js';

/* MAIN */

describe ( 'Tiny Readdir', it => {

  it ( 'finds folders, files and symlinks', async t => {

    const cwdPath = process.cwd ();
    const root1Path = path.join ( cwdPath, 'test', 'root1' );
    const root2Path = path.join ( cwdPath, 'test', 'root2' );
    const folder1Path = path.join ( root1Path, 'folder1' );
    const folder2Path = path.join ( root1Path, 'folder2' );
    const folder1DeepPath = path.join ( folder1Path, 'deep' );
    const file1aPath = path.join ( folder1Path, 'file1a.txt' );
    const file1bPath = path.join ( folder1Path, 'file1b.txt' );
    const file2Path = path.join ( folder2Path, 'file2.txt' );
    const fileDeep1Path = path.join ( folder1DeepPath, 'file1.txt' );
    const symlink1FromPath = path.join ( root1Path, 'symlink' );
    const symlink1ToPath = root2Path;
    const symlink2FromPath = path.join ( root2Path, 'symlink' );
    const symlink2ToPath = root1Path;

    fs.mkdirSync ( root1Path );
    fs.mkdirSync ( root2Path );
    fs.mkdirSync ( folder1Path );
    fs.mkdirSync ( folder2Path );
    fs.mkdirSync ( folder1DeepPath );
    fs.writeFileSync ( file1aPath, '' );
    fs.writeFileSync ( file1bPath, '' );
    fs.writeFileSync ( file2Path, '' );
    fs.writeFileSync ( fileDeep1Path, '' );
    fs.symlinkSync ( symlink1ToPath, symlink1FromPath );
    fs.symlinkSync ( symlink2ToPath, symlink2FromPath );

    const expected = {
      directories: [folder1Path, folder2Path, folder1DeepPath, root2Path],
      files: [file1aPath, file1bPath, file2Path, fileDeep1Path],
      symlinks: [symlink1FromPath, symlink2FromPath],
      map: {
        [root1Path]: {
          directories: [folder1Path, folder2Path],
          files: [],
          symlinks: [symlink1FromPath]
        },
        [root2Path]: {
          directories: [],
          files: [],
          symlinks: [symlink2FromPath]
        },
        [folder1Path]: {
          directories: [folder1DeepPath],
          files: [file1aPath, file1bPath],
          symlinks: []
        },
        [folder2Path]: {
          directories: [],
          files: [file2Path],
          symlinks: []
        },
        [folder1DeepPath]: {
          directories: [],
          files: [fileDeep1Path],
          symlinks: []
        },
        [symlink1FromPath]: {
          directories: [root2Path],
          files: [],
          symlinks: []
        },
        [symlink2FromPath]: {
          directories: [],
          files: [],
          symlinks: []
        }
      }
    };

    try {

      const result = await readdir ( root1Path, { followSymlinks: true } );

      t.deepEqual ( result, expected );

    } finally {

      fs.rmSync ( root1Path, { recursive: true } );
      fs.rmSync ( root2Path, { recursive: true } );

    }

  });

  it ( 'supports a limit option', async t => {

    const cwdPath = process.cwd ();
    const root1Path = path.join ( cwdPath, 'test', 'root1' );
    const root2Path = path.join ( cwdPath, 'test', 'root2' );
    const folder1Path = path.join ( root1Path, 'folder1' );
    const folder2Path = path.join ( root1Path, 'folder2' );
    const folder1DeepPath = path.join ( folder1Path, 'deep' );
    const file1aPath = path.join ( folder1Path, 'file1a.txt' );
    const file1bPath = path.join ( folder1Path, 'file1b.txt' );
    const file2Path = path.join ( folder2Path, 'file2.txt' );
    const fileDeep1Path = path.join ( folder1DeepPath, 'file1.txt' );
    const symlink1FromPath = path.join ( root1Path, 'symlink' );
    const symlink1ToPath = root2Path;
    const symlink2FromPath = path.join ( root2Path, 'symlink' );
    const symlink2ToPath = root1Path;

    fs.mkdirSync ( root1Path );
    fs.mkdirSync ( root2Path );
    fs.mkdirSync ( folder1Path );
    fs.mkdirSync ( folder2Path );
    fs.mkdirSync ( folder1DeepPath );
    fs.writeFileSync ( file1aPath, '' );
    fs.writeFileSync ( file1bPath, '' );
    fs.writeFileSync ( file2Path, '' );
    fs.writeFileSync ( fileDeep1Path, '' );
    fs.symlinkSync ( symlink1ToPath, symlink1FromPath );
    fs.symlinkSync ( symlink2ToPath, symlink2FromPath );

    const expected = {
      directories: [folder1Path, folder2Path],
      files: [],
      symlinks: [symlink1FromPath],
      map: {
        [root1Path]: {
          directories: [folder1Path, folder2Path],
          files: [],
          symlinks: [symlink1FromPath]
        },
        [folder1Path]: {
          directories: [],
          files: [],
          symlinks: []
        },
        [folder2Path]: {
          directories: [],
          files: [],
          symlinks: []
        }
      }
    };

    try {

      const result = await readdir ( root1Path, { limit: 3, followSymlinks: true } );

      t.deepEqual ( result, expected );

    } finally {

      fs.rmSync ( root1Path, { recursive: true } );
      fs.rmSync ( root2Path, { recursive: true } );

    }

  });

});
