
/* IMPORT */

import * as fs from 'fs';
import * as path from 'path';
import {Options, Result} from './types';

/* TINY READDIR */

const readdir = ( rootPath: string, options?: Options ): Promise<Result> => {

  const maxDepth = options?.depth ?? Infinity,
        isIgnored = options?.ignore ?? (() => false),
        signal = options?.signal ?? { aborted: false },
        directories: string[] = [],
        files: string[] = [],
        resultEmpty: Result = { directories: [], files: [] },
        result: Result = { directories, files };

  const populateResult = async ( rootPath: string, depth: number = 1 ): Promise<Result> => {

    if ( signal.aborted ) return resultEmpty;

    if ( depth > maxDepth ) return result;

    const dirents = await fs.promises.readdir ( rootPath, { withFileTypes: true } ).catch ( () => {} ) || [];

    if ( signal.aborted ) return resultEmpty;

    if ( !dirents.length ) return result;

    await Promise.all ( dirents.map ( ( dirent ): Promise<Result> | undefined => {

      if ( signal.aborted ) return;

      const subPath = path.resolve ( rootPath, dirent.name );

      if ( isIgnored ( subPath ) ) return;

      if ( dirent.isFile () ) {

        files.push ( subPath );

      } else if ( dirent.isDirectory () ) {

        directories.push ( subPath );

        if ( depth >= maxDepth ) return;

        return populateResult ( subPath, depth + 1 );

      }

    }));

    if ( signal.aborted ) return resultEmpty;

    return result;

  };

  return populateResult ( rootPath );

};

/* EXPORT */

export default readdir;
