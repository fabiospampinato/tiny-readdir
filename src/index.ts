
/* IMPORT */

import fs from 'node:fs';
import path from 'node:path';
import makeCounterPromise from 'promise-make-counter';
import {NOOP_PROMISE_LIKE} from './constants';
import {castArray, isFunction} from './utils';
import type {Dirent, DirentLike, Options, Result} from './types';

/* MAIN */

const readdir = ( rootPath: string, options?: Options ): Promise<Result> => {

  const followSymlinks = options?.followSymlinks ?? false;
  const maxDepth = options?.depth ?? Infinity;
  const maxPaths = options?.limit ?? Infinity;
  const ignore = options?.ignore ?? [];
  const ignores = castArray ( ignore ).map ( ignore => isFunction ( ignore ) ? ignore : ( targetPath: string ) => ignore.test ( targetPath ) );
  const isIgnored = ( targetPath: string, targetContext: DirentLike ) => ignores.some ( ignore => ignore ( targetPath, targetContext ) );
  const signal = options?.signal ?? { aborted: false };
  const onDirents = options?.onDirents || (() => {});
  const directories: string[] = [];
  const files: string[] = [];
  const symlinks: string[] = [];
  const visited = new Set<string> ();
  const resultEmpty: Result = { directories: [], files: [], symlinks: [] };
  const result: Result = { directories, files, symlinks };
  const {promise, increment, decrement} = makeCounterPromise ();

  let foundPaths = 0;

  const handleDirectory = ( subPath: string, depth: number ): void => {

    if ( visited.has ( subPath ) ) return;

    if ( foundPaths >= maxPaths ) return;

    foundPaths += 1;

    directories.push ( subPath );
    visited.add ( subPath );

    if ( depth >= maxDepth ) return;

    if ( foundPaths >= maxPaths ) return;

    populateResultFromPath ( subPath, depth + 1 );

  };

  const handleFile = ( subPath: string ): void => {

    if ( visited.has ( subPath ) ) return;

    if ( foundPaths >= maxPaths ) return;

    foundPaths += 1;

    files.push ( subPath );
    visited.add ( subPath );

  };

  const handleSymlink = ( subPath: string, depth: number ): void => {

    if ( visited.has ( subPath ) ) return;

    if ( foundPaths >= maxPaths ) return;

    foundPaths += 1;

    symlinks.push ( subPath );
    visited.add ( subPath );

    if ( !followSymlinks ) return;

    if ( depth >= maxDepth ) return;

    if ( foundPaths >= maxPaths ) return;

    populateResultFromSymlink ( subPath, depth + 1 );

  };

  const handleStat = ( rootPath: string, stat: fs.Stats, depth: number ): void => {

    if ( signal.aborted ) return;

    if ( isIgnored ( rootPath, stat ) ) return;

    if ( stat.isDirectory () ) {

      handleDirectory ( rootPath, depth );

    } else if ( stat.isFile () ) {

      handleFile ( rootPath );

    } else if ( stat.isSymbolicLink () ) {

      handleSymlink ( rootPath, depth );
    }

  };

  const handleDirent = ( rootPath: string, dirent: fs.Dirent, depth: number ): void => {

    if ( signal.aborted ) return;

    const separator = ( rootPath === path.sep ) ? '' : path.sep;
    const name = dirent.name;
    const subPath = `${rootPath}${separator}${name}`;

    if ( isIgnored ( subPath, dirent ) ) return;

    if ( dirent.isDirectory () ) {

      handleDirectory ( subPath, depth );

    } else if ( dirent.isFile () ) {

      handleFile ( subPath );

    } else if ( dirent.isSymbolicLink () ) {

      handleSymlink ( subPath, depth );

    }

  };

  const handleDirents = ( rootPath: string, dirents: fs.Dirent[], depth: number ): void => {

    for ( let i = 0, l = dirents.length; i < l; i++ ) {

      handleDirent ( rootPath, dirents[i], depth );

    }

  };

  const populateResultFromPath = ( rootPath: string, depth: number ): void => {

    if ( signal.aborted ) return;

    if ( depth > maxDepth ) return;

    if ( foundPaths >= maxPaths ) return;

    increment ();

    fs.readdir ( rootPath, { withFileTypes: true }, ( error, dirents ) => {

      if ( error ) return decrement ();

      if ( signal.aborted ) return decrement ();

      if ( !dirents.length ) return decrement ();

      const promise = onDirents ( dirents ) || NOOP_PROMISE_LIKE;

      promise.then ( () => {

        handleDirents ( rootPath, dirents, depth );

        decrement ();

      });

    });

  };

  const populateResultFromSymlink = ( rootPath: string, depth: number ): void => {

    increment ();

    fs.realpath ( rootPath, ( error, realPath ) => {

      if ( error ) return decrement ();

      if ( signal.aborted ) return decrement ();

      fs.stat ( realPath, ( error, stat ) => {

        if ( error ) return decrement ();

        if ( signal.aborted ) return decrement ();

        handleStat ( realPath, stat, depth );

        decrement ();

      });

    });

  };

  const populateResultFromRoot = async ( rootPath: string, depth: number = 1 ): Promise<Result> => {

    rootPath = path.normalize ( rootPath );

    visited.add ( rootPath );

    populateResultFromPath ( rootPath, depth );

    await promise;

    if ( signal.aborted ) return resultEmpty;

    return result;

  };

  return populateResultFromRoot ( rootPath );

};

/* EXPORT */

export default readdir;
export type {Dirent, Options, Result};
