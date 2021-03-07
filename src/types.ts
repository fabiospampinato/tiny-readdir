
/* HELPERS */

type Promisable<T> = T | Promise<T>;

/* TYPES */

type Options = {
  depth?: number,
  followSymlinks?: boolean,
  ignore?: ( targetPath: string ) => boolean,
  signal?: { aborted: boolean }
};

type Result = {
  directories: string[],
  files: string[],
  symlinks: string[]
};

/* EXPORT */

export {Promisable, Options, Result};
