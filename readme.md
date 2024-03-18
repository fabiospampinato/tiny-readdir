# Tiny Readdir

A simple promisified recursive readdir function.

## Install

```sh
npm install --save tiny-readdir
```

## Usage

```ts
import readdir from 'tiny-readdir';

const aborter = new AbortController ();

const result = await readdir ( '/foo/bar', {
  depth: 20, // Maximum depth to look at
  limit: 1_000_000, // Maximum number of files explored, useful as a stop gap in some edge cases
  followSymlinks: true, // Whether to follow symlinks or not
  ignore: targetPath => /node_modules/.test ( targetPath ), // Function that if returns true will ignore this particular file or a directory and its descendants
  signal: aborter.signal, // Optional abort signal, useful for aborting potentially expensive operations
  onDirents: dirents => console.log ( dirents ) // Optional callback that will be called as soon as new dirents are available, useful for example for discovering ".gitignore" files while searching
});

console.log ( result.directories ); // => Array of absolute paths pointing to directories
console.log ( result.files ); // => Array of absolute paths pointing to files
console.log ( result.symlinks ); // => Array of absolute paths pointing to symlinks

console.log ( result.directoriesNames ); // => Set of directories names found
console.log ( result.filesNames ); // => Set of files name found
console.log ( result.symlinksNames ); // => Set of symlinks names found

console.log ( result.directoriesNamesToPaths ); // => Record of directories names found to their paths
console.log ( result.filesNamesToPaths ); // => Record of files names found to their paths
console.log ( result.symlinksNamesToPaths ); // => Record of symlinks names found to their paths

setTimeout ( () => aborter.abort (), 10000 ); // Aborting if it's going to take longer than 10s
```

## License

MIT © Fabio Spampinato
