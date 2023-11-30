
/* HELPERS */

type Callback = () => void;

/* MAIN */

type Options = {
  depth?: number,
  limit?: number,
  followSymlinks?: boolean,
  ignore?: (( targetPath: string ) => boolean) | RegExp,
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

export type {Callback, Options, ResultDirectory, ResultDirectories, Result};
