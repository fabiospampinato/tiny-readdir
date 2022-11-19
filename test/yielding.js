
/* IMPORT */

import readdir from '../dist/index.js';

/* MAIN */

const main = async () => {

  let count = 0;
  let start = Date.now ();

  setInterval ( () => {
    count += 1;
    console.log ( 'tick', count );
    if ( count < 100 ) return;
    const end = Date.now ();
    const elapsed = end - start;
    console.log ( 'elapsed', elapsed );
    if ( elapsed > 1500 ) {
      process.exit ( 1 ); // Fail
    } else {
      process.exit ( 0 ); // Success
    }
  }, 10 );

  await readdir ( '/' );

  process.exit ( 1 ); // Fail

};

/* RUNNING */

await main ();
