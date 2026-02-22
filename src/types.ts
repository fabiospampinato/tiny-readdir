
/* HELPERS */

type Callback = () => void;

type ArrayMaybe<T> = T[] | T;

type PromiseMaybe<T> = Promise<T> | T;

/* MAIN */

type DirentLike = {
  isFile: () => boolean,
  isDirectory: () => boolean,
  isBlockDevice: () => boolean,
  isCharacterDevice: () => boolean,
  isSymbolicLink: () => boolean,
  isFIFO: () => boolean,
  isSocket: () => boolean
};

type Dirent = DirentLike & {
  name: string,
  path: string
};

type Options = {
  depth?: number,
  limit?: number,
  followSymlinks?: boolean,
  ignore?: ArrayMaybe<(( targetPath: string, targetContext: DirentLike ) => boolean) | RegExp>,
  signal?: { aborted: boolean },
  onDirents?: ( dirents: Dirent[] ) => PromiseMaybe<undefined>
};

type Result = {
  directories: string[],
  files: string[],
  symlinks: string[]
};

/* EXPORT */

export type {Callback, PromiseMaybe, DirentLike, Dirent, Options, Result};
