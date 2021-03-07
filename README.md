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
  followSymlinks: true, // Whether to follow symlinks or not
  ignore: targetPath => /node_modules/.test ( targetPath ), // Function that if returns true will ignore this particular file or a directory and its descendants
  signal: aborter.signal // Optional abort signal, useful for aborting potentially expensive operations
});

console.log ( result.directories ); // => Array of absolute paths pointing to directories
console.log ( result.files ); // => Array of absolute paths pointing to files
console.log ( result.symlinks ); // => Array of absolute paths pointing to symlinks

setTimeout ( () => aborter.abort (), 10000 ); // Aborting if it's going to take longer than 10s
```

## License

MIT © Fabio Spampinato
