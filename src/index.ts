
/* IMPORT */

import fs from 'node:fs';
import path from 'node:path';
import {isFunction, makeCounterPromise} from './utils';
import type {Options, ResultDirectory, ResultDirectories, Result} from './types';

/* MAIN */

const readdir = ( rootPath: string, options?: Options ): Promise<Result> => {

  const followSymlinks = options?.followSymlinks ?? false;
  const maxDepth = options?.depth ?? Infinity;
  const maxPaths = options?.limit ?? Infinity;
  const ignore = options?.ignore ?? (() => false);
  const isIgnored = isFunction ( ignore ) ? ignore : ( targetPath: string ) => ignore.test ( targetPath );
  const signal = options?.signal ?? { aborted: false };
  const directories: string[] = [];
  const directoriesNames: Set<string> = new Set ();
  const files: string[] = [];
  const filesNames: Set<string> = new Set ();
  const symlinks: string[] = [];
  const symlinksNames: Set<string> = new Set ();
  const map: ResultDirectories = {};
  const visited = new Set<string> ();
  const resultEmpty: Result = { directories: [], directoriesNames: new Set (), files: [], filesNames: new Set (), symlinks: [], symlinksNames: new Set (), map: {} };
  const result: Result = { directories, directoriesNames, files, filesNames, symlinks, symlinksNames, map };
  const {promise, increment, decrement} = makeCounterPromise ();

  let foundPaths = 0;

  const handleDirectory = ( dirmap: ResultDirectory, subPath: string, name: string, depth: number ): void => {

    if ( visited.has ( subPath ) ) return;

    if ( foundPaths >= maxPaths ) return;

    foundPaths += 1;
    dirmap.directories.push ( subPath );
    dirmap.directoriesNames.add ( name );
    directories.push ( subPath );
    directoriesNames.add ( name );
    visited.add ( subPath );

    if ( depth >= maxDepth ) return;

    if ( foundPaths >= maxPaths ) return;

    populateResultFromPath ( subPath, depth + 1 );

  };

  const handleFile = ( dirmap: ResultDirectory, subPath: string, name: string ): void => {

    if ( visited.has ( subPath ) ) return;

    if ( foundPaths >= maxPaths ) return;

    foundPaths += 1;
    dirmap.files.push ( subPath );
    dirmap.filesNames.add ( name );
    files.push ( subPath );
    filesNames.add ( name );
    visited.add ( subPath );

  };

  const handleSymlink = ( dirmap: ResultDirectory, subPath: string, name: string, depth: number ): void => {

    if ( visited.has ( subPath ) ) return;

    if ( foundPaths >= maxPaths ) return;

    foundPaths += 1;
    dirmap.symlinks.push ( subPath );
    dirmap.symlinksNames.add ( name );
    symlinks.push ( subPath );
    symlinksNames.add ( name );
    visited.add ( subPath );

    if ( !followSymlinks ) return;

    if ( depth >= maxDepth ) return;

    if ( foundPaths >= maxPaths ) return;

    populateResultFromSymlink ( subPath, depth + 1 );

  };

  const handleStat = ( dirmap: ResultDirectory, rootPath: string, name: string, stat: fs.Stats, depth: number ): void => {

    if ( signal.aborted ) return;

    if ( isIgnored ( rootPath ) ) return;

    if ( stat.isDirectory () ) {

      handleDirectory ( dirmap, rootPath, name, depth );

    } else if ( stat.isFile () ) {

      handleFile ( dirmap, rootPath, name );

    } else if ( stat.isSymbolicLink () ) {

      handleSymlink ( dirmap, rootPath, name, depth );

    }

  };

  const handleDirent = ( dirmap: ResultDirectory, rootPath: string, dirent: fs.Dirent, depth: number ): void => {

    if ( signal.aborted ) return;

    const separator = ( rootPath === path.sep ) ? '' : path.sep;
    const name = dirent.name;
    const subPath = `${rootPath}${separator}${name}`;

    if ( isIgnored ( subPath ) ) return;

    if ( dirent.isDirectory () ) {

      handleDirectory ( dirmap, subPath, name, depth );

    } else if ( dirent.isFile () ) {

      handleFile ( dirmap, subPath, name );

    } else if ( dirent.isSymbolicLink () ) {

      handleSymlink ( dirmap, subPath, name, depth );

    }

  };

  const handleDirents = ( dirmap: ResultDirectory, rootPath: string, dirents: fs.Dirent[], depth: number ): void => {

    for ( let i = 0, l = dirents.length; i < l; i++ ) {

      handleDirent ( dirmap, rootPath, dirents[i], depth );

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

      const dirmap = map[rootPath] = { directories: [], directoriesNames: new Set (), files: [], filesNames: new Set (), symlinks: [], symlinksNames: new Set () };

      handleDirents ( dirmap, rootPath, dirents, depth );

      decrement ();

    });

  };

  const populateResultFromSymlink = async ( rootPath: string, depth: number ): Promise<void> => {

    increment ();

    fs.realpath ( rootPath, ( error, realPath ) => {

      if ( error ) return decrement ();

      if ( signal.aborted ) return decrement ();

      fs.stat ( realPath, async ( error, stat ) => {

        if ( error ) return decrement ();

        if ( signal.aborted ) return decrement ();

        const name = path.basename ( realPath );
        const dirmap = map[rootPath] = { directories: [], directoriesNames: new Set (), files: [], filesNames: new Set (), symlinks: [], symlinksNames: new Set () };

        handleStat ( dirmap, realPath, name, stat, depth );

        decrement ();

      });

    });

  };

  const getResult = async ( rootPath: string, depth: number = 1 ): Promise<Result> => {

    rootPath = path.normalize ( rootPath );

    visited.add ( rootPath );

    populateResultFromPath ( rootPath, depth );

    await promise;

    if ( signal.aborted ) return resultEmpty;

    return result;

  };

  return getResult ( rootPath );

};

/* EXPORT */

export default readdir;
