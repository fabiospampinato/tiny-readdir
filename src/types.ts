
/* HELPERS */

type Promisable<T> = Promise<T> | T;

/* MAIN */

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

export type {Promisable, Options, ResultDirectory, ResultDirectories, Result};
