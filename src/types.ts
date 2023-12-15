
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
  directoriesNames: Set<string>,
  directoriesNamesToPaths: Record<string, string[]>,
  files: string[],
  filesNames: Set<string>,
  filesNamesToPaths: Record<string, string[]>,
  symlinks: string[],
  symlinksNames: Set<string>,
  symlinksNamesToPaths: Record<string, string[]>
};

type ResultDirectories = {
  [path: string]: ResultDirectory
};

type Result = ResultDirectory & {
  map: ResultDirectories
};

/* EXPORT */

export type {Callback, Options, ResultDirectory, ResultDirectories, Result};
