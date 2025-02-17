# Tiny Readdir

A simple promisified recursive readdir function.

## Install

```sh
npm install tiny-readdir
```

## Usage

```ts
import readdir from 'tiny-readdir';

// Let's recursively read into a directory

const aborter = new AbortController ();
const result = await readdir ( '/foo/bar', {
  depth: 20, // Maximum depth to look at
  limit: 1_000_000, // Maximum number of files explored, useful as a stop gap in some edge cases
  followSymlinks: true, // Whether to follow symlinks or not
  ignore: targetPath => /node_modules/.test ( targetPath ), // Function that if returns true will ignore this particular file or a directory and its descendants
  signal: aborter.signal, // Optional abort signal, useful for aborting potentially expensive operations
  onDirents: dirents => console.log ( dirents ) // Optional callback that will be called as soon as new dirents are available, useful for example for discovering ".gitignore" files while searching
});

// This is how we would abort the reactive read after 10s

setTimeout ( () => aborter.abort (), 10_000 ); // Aborting if it's going to take longer than 10s

// This is the basic information we'll get

result.directories; // => Array of absolute paths pointing to directories
result.files; // => Array of absolute paths pointing to files
result.symlinks; // => Array of absolute paths pointing to symlinks

// This is more advanced information we'll get, which is useful in some cases

result.directoriesNames; // => Set of directories names found
result.filesNames; // => Set of files name found
result.symlinksNames; // => Set of symlinks names found

result.directoriesNamesToPaths; // => Record of directories names found to their paths
result.filesNamesToPaths; // => Record of files names found to their paths
result.symlinksNamesToPaths; // => Record of symlinks names found to their paths
```

## License

MIT © Fabio Spampinato
