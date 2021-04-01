
/* HELPERS */

type Promisable<T> = T | Promise<T>;

/* TYPES */

type Options = {
  depth?: number,
  followSymlinks?: boolean,
  ignore?: ( targetPath: string ) => boolean,
  signal?: { aborted: boolean }
};

type ResultDirectory = {
  directories: string[],
  files: string[],
  symlinks: string[]
};

type ResultDirectories = {
  [path: string]: ResultDirectory
};

type Result = ResultDirectory & {
  map: ResultDirectories
};

/* EXPORT */

export {Promisable, Options, ResultDirectory, ResultDirectories, Result};
