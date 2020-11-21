# Tiny Readdir

A simple promisified recursive readdir function.

## Install

```sh
npm install --save tiny-readdir
```

## Usage

```ts
import readdir from 'tiny-readdir';

const result = await readdir ( '/foo/bar', {
  depth: 20, // Maximum depth to look at
  ignore: targetPath => /node_modules/.test ( targetPath ) // Function that if returns true will ignore this particular file or a directory and its descendants
});

console.log ( result.directories ); // => Array of absolute paths pointing to directories
console.log ( result.files ); // => Array of absolute paths pointing to files

```

## License

MIT © Fabio Spampinato
