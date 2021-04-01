
/* IMPORT */

import * as fs from 'fs';
import * as path from 'path';
import Limiter from 'promise-concurrency-limiter';
import {Promisable, Options, ResultDirectory, ResultDirectories, Result} from './types';

/* HELPERS */

const limiter = new Limiter ({ concurrency: 500 });

/* TINY READDIR */

const readdir = ( rootPath: string, options?: Options ): Promise<Result> => {

  const followSymlinks = options?.followSymlinks ?? false,
        maxDepth = options?.depth ?? Infinity,
        isIgnored = options?.ignore ?? (() => false),
        signal = options?.signal ?? { aborted: false },
        directories: string[] = [],
        files: string[] = [],
        symlinks: string[] = [],
        map: ResultDirectories = {},
        resultEmpty: Result = { directories: [], files: [], symlinks: [], map: {} },
        result: Result = { directories, files, symlinks, map };

  const handleDirectory = ( dirmap: ResultDirectory, subPath: string, depth: number ): Promisable<void> => {

    dirmap.directories.push ( subPath );
    directories.push ( subPath );

    if ( depth >= maxDepth ) return;

    return limiter.add ( () => populateResultFromPath ( subPath, depth + 1 ) );

  };

  const handleFile = ( dirmap: ResultDirectory, subPath: string ): void => {

    dirmap.files.push ( subPath );
    files.push ( subPath );

  };

  const handleSymlink = ( dirmap: ResultDirectory, subPath: string, depth: number ): Promisable<void> => {

    dirmap.symlinks.push ( subPath );
    symlinks.push ( subPath );

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

      const realPath = await fs.promises.realpath ( rootPath ),
            stat = await fs.promises.stat ( realPath ),
            dirmap = map[rootPath] = { directories: [], files: [], symlinks: [] };

      await handleStat ( dirmap, realPath, stat, depth );

    } catch {}

  };

  const getResult = async ( rootPath: string, depth: number = 1 ): Promise<Result> => {

    rootPath = path.normalize ( rootPath );

    await populateResultFromPath ( rootPath, depth );

    if ( signal.aborted ) return resultEmpty;

    return result;

  };

  return getResult ( rootPath );

};

/* EXPORT */

export default readdir;
