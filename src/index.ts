
/* IMPORT */

import fs from 'node:fs';
import path from 'node:path';
import Limiter from 'promise-concurrency-limiter';
import type {Promisable, Options, ResultDirectory, ResultDirectories, Result} from './types';

/* HELPERS */

const limiter = new Limiter ({ concurrency: 500 });

/* MAIN */

const readdir = ( rootPath: string, options?: Options ): Promise<Result> => {

  const followSymlinks = options?.followSymlinks ?? false;
  const maxDepth = options?.depth ?? Infinity;
  const isIgnored = options?.ignore ?? (() => false);
  const signal = options?.signal ?? { aborted: false };
  const directories: string[] = [];
  const files: string[] = [];
  const symlinks: string[] = [];
  const map: ResultDirectories = {};
  const visited = new Set<string> ();
  const resultEmpty: Result = { directories: [], files: [], symlinks: [], map: {} };
  const result: Result = { directories, files, symlinks, map };

  const handleDirectory = ( dirmap: ResultDirectory, subPath: string, depth: number ): Promisable<void> => {

    if ( visited.has ( subPath ) ) return;

    dirmap.directories.push ( subPath );
    directories.push ( subPath );
    visited.add ( subPath );

    if ( depth >= maxDepth ) return;

    return limiter.add ( () => populateResultFromPath ( subPath, depth + 1 ) );

  };

  const handleFile = ( dirmap: ResultDirectory, subPath: string ): void => {

    if ( visited.has ( subPath ) ) return;

    dirmap.files.push ( subPath );
    files.push ( subPath );
    visited.add ( subPath );

  };

  const handleSymlink = ( dirmap: ResultDirectory, subPath: string, depth: number ): Promisable<void> => {

    if ( visited.has ( subPath ) ) return;

    dirmap.symlinks.push ( subPath );
    symlinks.push ( subPath );
    visited.add ( subPath );

    if ( !followSymlinks ) return;

    if ( depth >= maxDepth ) return;

    return limiter.add ( () => populateResultFromSymlink ( subPath, depth + 1 ) );

  };

  const handleStat = ( dirmap: ResultDirectory, rootPath: string, stat: fs.Stats, depth: number ): Promisable<void> => {

    if ( signal.aborted ) return;

    if ( isIgnored ( rootPath ) ) return;

    if ( stat.isDirectory () ) {

      return handleDirectory ( dirmap, rootPath, depth );

    } else if ( stat.isFile () ) {

      return handleFile ( dirmap, rootPath );

    } else if ( stat.isSymbolicLink () ) {

      return handleSymlink ( dirmap, rootPath, depth );

    }

  };

  const handleDirent = ( dirmap: ResultDirectory, rootPath: string, dirent: fs.Dirent, depth: number ): Promisable<void> => {

    if ( signal.aborted ) return;

    const subPath = `${rootPath}${path.sep}${dirent.name}`;

    if ( isIgnored ( subPath ) ) return;

    if ( dirent.isDirectory () ) {

      return handleDirectory ( dirmap, subPath, depth );

    } else if ( dirent.isFile () ) {

      return handleFile ( dirmap, subPath );

    } else if ( dirent.isSymbolicLink () ) {

      return handleSymlink ( dirmap, subPath, depth );

    }

  };

  const handleDirents = ( dirmap: ResultDirectory, rootPath: string, dirents: fs.Dirent[], depth: number ): Promise<void[]> => {

    return Promise.all ( dirents.map ( ( dirent ): Promisable<void> => {

      return handleDirent ( dirmap, rootPath, dirent, depth );

    }));

  };

  const populateResultFromPath = async ( rootPath: string, depth: number ): Promise<void> => {

    if ( signal.aborted ) return;

    if ( depth > maxDepth ) return;

    const dirents = await fs.promises.readdir ( rootPath, { withFileTypes: true } ).catch ( () => [] );

    if ( signal.aborted ) return;

    const dirmap = map[rootPath] = { directories: [], files: [], symlinks: [] };

    if ( !dirents.length ) return;

    await handleDirents ( dirmap, rootPath, dirents, depth );

  };

  const populateResultFromSymlink = async ( rootPath: string, depth: number ): Promise<void> => {

    try {

      const realPath = await fs.promises.realpath ( rootPath );
      const stat = await fs.promises.stat ( realPath );
      const dirmap = map[rootPath] = { directories: [], files: [], symlinks: [] };

      await handleStat ( dirmap, realPath, stat, depth );

    } catch {}

  };

  const getResult = async ( rootPath: string, depth: number = 1 ): Promise<Result> => {

    rootPath = path.normalize ( rootPath );

    visited.add ( rootPath );

    await populateResultFromPath ( rootPath, depth );

    if ( signal.aborted ) return resultEmpty;

    return result;

  };

  return getResult ( rootPath );

};

/* EXPORT */

export default readdir;
