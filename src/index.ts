
/* IMPORT */

import * as fs from 'fs';
import * as path from 'path';
import Limiter from 'promise-concurrency-limiter';
import {Promisable, Options, Result} from './types';

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
        resultEmpty: Result = { directories: [], files: [], symlinks: [] },
        result: Result = { directories, files, symlinks };

  const handleDirectory = ( subPath: string, depth: number ): Promisable<void> => {

    directories.push ( subPath );

    if ( depth >= maxDepth ) return;

    return limiter.add ( () => populateResult ( subPath, depth + 1 ) );

  };

  const handleFile = ( subPath: string ): void => {

    files.push ( subPath );

  };

  const handleSymlink = ( subPath: string, depth: number ): Promisable<void> => {

    symlinks.push ( subPath );

    if ( !followSymlinks ) return;

    if ( depth >= maxDepth ) return;

    return limiter.add ( async () => {

      try {

        const realPath = await fs.promises.realpath ( subPath ),
              stat = await fs.promises.stat ( realPath );

        await handleStat ( realPath, stat, depth + 1 );

      } catch {}

    });

  };

  const handleStat = ( rootPath: string, stat: fs.Stats, depth: number ): Promisable<void> => {

    if ( signal.aborted ) return;

    if ( isIgnored ( rootPath ) ) return;

    if ( stat.isDirectory () ) {

      return handleDirectory ( rootPath, depth );

    } else if ( stat.isFile () ) {

      return handleFile ( rootPath );

    } else if ( stat.isSymbolicLink () ) {

      return handleSymlink ( rootPath, depth );

    }

  };

  const handleDirent = ( rootPath: string, dirent: fs.Dirent, depth: number ): Promisable<void> => {

    if ( signal.aborted ) return;

    const subPath = path.resolve ( rootPath, dirent.name );

    if ( isIgnored ( subPath ) ) return;

    if ( dirent.isDirectory () ) {

      return handleDirectory ( subPath, depth );

    } else if ( dirent.isFile () ) {

      return handleFile ( subPath );

    } else if ( dirent.isSymbolicLink () ) {

      return handleSymlink ( subPath, depth );

    }

  };

  const handleDirents = ( rootPath: string, dirents: fs.Dirent[], depth: number ): Promise<void[]> => {

    return Promise.all ( dirents.map ( ( dirent ): Promisable<void> => {

      return handleDirent ( rootPath, dirent, depth );

    }));

  };

  const populateResult = async ( rootPath: string, depth: number ): Promise<void> => {

    if ( signal.aborted ) return;

    if ( depth > maxDepth ) return;

    const dirents = await fs.promises.readdir ( rootPath, { withFileTypes: true } ).catch ( () => [] );

    if ( signal.aborted ) return;

    if ( !dirents.length ) return;

    await handleDirents ( rootPath, dirents, depth );

  };

  const getResult = async ( rootPath: string, depth: number = 1 ): Promise<Result> => {

    await populateResult ( rootPath, depth );

    if ( signal.aborted ) return resultEmpty;

    return result;

  };

  return getResult ( rootPath );

};

/* EXPORT */

export default readdir;
