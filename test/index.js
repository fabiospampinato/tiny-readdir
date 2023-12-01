
/* IMPORT */

import {describe} from 'fava';
import fs from 'node:fs';
import path from 'node:path';
import readdir from '../dist/index.js';

/* HELPERS */

const toBasename = filePath => path.basename ( filePath );

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
      directoriesNames: new Set ( [folder1Path, folder2Path, folder1DeepPath, root2Path].map ( toBasename ) ),
      files: [file1aPath, file1bPath, file2Path, fileDeep1Path],
      filesNames: new Set ( [file1aPath, file1bPath, file2Path, fileDeep1Path].map ( toBasename ) ),
      symlinks: [symlink1FromPath, symlink2FromPath],
      symlinksNames: new Set ( [symlink1FromPath, symlink2FromPath].map ( toBasename ) ),
      map: {
        [root1Path]: {
          directories: [folder1Path, folder2Path],
          directoriesNames: new Set ( [folder1Path, folder2Path].map ( toBasename ) ),
          files: [],
          filesNames: new Set (),
          symlinks: [symlink1FromPath],
          symlinksNames: new Set ( [symlink1FromPath].map ( toBasename ) )
        },
        [root2Path]: {
          directories: [],
          directoriesNames: new Set (),
          files: [],
          filesNames: new Set (),
          symlinks: [symlink2FromPath],
          symlinksNames: new Set ( [symlink2FromPath].map ( toBasename ) )
        },
        [folder1Path]: {
          directories: [folder1DeepPath],
          directoriesNames: new Set ( [folder1DeepPath].map ( toBasename ) ),
          files: [file1aPath, file1bPath],
          filesNames: new Set ( [file1aPath, file1bPath].map ( toBasename ) ),
          symlinks: [],
          symlinksNames: new Set ()
        },
        [folder2Path]: {
          directories: [],
          directoriesNames: new Set (),
          files: [file2Path],
          filesNames: new Set ( [file2Path].map ( toBasename ) ),
          symlinks: [],
          symlinksNames: new Set ()
        },
        [folder1DeepPath]: {
          directories: [],
          directoriesNames: new Set (),
          files: [fileDeep1Path],
          filesNames: new Set ( [fileDeep1Path].map ( toBasename ) ),
          symlinks: [],
          symlinksNames: new Set ()
        },
        [symlink1FromPath]: {
          directories: [root2Path],
          directoriesNames: new Set ( [root2Path].map ( toBasename ) ),
          files: [],
          filesNames: new Set (),
          symlinks: [],
          symlinksNames: new Set ()
        },
        [symlink2FromPath]: {
          directories: [],
          directoriesNames: new Set (),
          files: [],
          filesNames: new Set (),
          symlinks: [],
          symlinksNames: new Set ()
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
      directoriesNames: new Set ( [folder1Path, folder2Path].map ( toBasename ) ),
      files: [],
      filesNames: new Set (),
      symlinks: [symlink1FromPath],
      symlinksNames: new Set ( [symlink1FromPath].map ( toBasename ) ),
      map: {
        [root1Path]: {
          directories: [folder1Path, folder2Path],
          directoriesNames: new Set ( [folder1Path, folder2Path].map ( toBasename ) ),
          files: [],
          filesNames: new Set (),
          symlinks: [symlink1FromPath],
          symlinksNames: new Set ( [symlink1FromPath].map ( toBasename ) )
        },
        [folder1Path]: {
          directories: [],
          directoriesNames: new Set (),
          files: [],
          filesNames: new Set (),
          symlinks: [],
          symlinksNames: new Set ()
        },
        [folder2Path]: {
          directories: [],
          directoriesNames: new Set (),
          files: [],
          filesNames: new Set (),
          symlinks: [],
          symlinksNames: new Set ()
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

  it ( 'does not freeze the main thread', async t => {

    return new Promise ( resolve => {

      let count = 0;
      let start = Date.now ();

      const aborter = new AbortController ();
      const signal = aborter.signal;

      const intervalId = setInterval ( () => {
        count += 1;
        console.log ( 'tick', count );
        if ( count !== 100 ) return;
        clearInterval ( intervalId );
        const end = Date.now ();
        const elapsed = end - start;
        console.log ( 'elapsed', elapsed );
        console.log ( elapsed );
        if ( elapsed > 1500 ) {
          t.fail ();
        } else {
          t.pass ();
        }
        aborter.abort ();
        resolve ();
      }, 10 );

      readdir ( '/', { signal } );

    });

  });

});
