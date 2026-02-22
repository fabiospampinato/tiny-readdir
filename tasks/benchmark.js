
/* IMPORT */

import benchmark from 'benchloop';
import fs from 'node:fs/promises';
import path from 'node:path';
import readdir from '../dist/index.js';

/* HELPERS */

const rootPath = path.resolve ( 'tasks/babel' );

/* MAIN */

benchmark.config ({
  iterations: 1
});

benchmark ({
  name: 'tiny-readdir',
  fn: async () => {
    await readdir ( rootPath, { followSymlinks: true } );
  }
});

benchmark ({
  name: 'fs.readdir',
  fn: async () => {
    await fs.readdir ( rootPath, { recursive: true } );
  }
});
