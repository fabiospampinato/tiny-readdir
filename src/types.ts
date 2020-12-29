
/* TYPES */

type Options = {
  depth?: number,
  ignore?: ( targetPath: string ) => boolean,
  signal?: { aborted: boolean }
};

type Result = {
  directories: string[],
  files: string[]
};

/* EXPORT */

export {Options, Result};
