
/* IMPORT */

import makeNakedPromise from 'promise-make-naked';
import type {Callback} from './types';

/* MAIN */

const castArray = <T> ( value: T[] | T ): T[] => {

  return Array.isArray ( value ) ? value : [value];

};

const isFunction = ( value: unknown ): value is Function => {

  return ( typeof value === 'function' );

};

const makeCounterPromise = (): { promise: Promise<void>, increment: Callback, decrement: Callback } => {

  const {promise, resolve} = makeNakedPromise<void> ();

  let counter = 0;

  const increment = (): void => {

    counter += 1;

  };

  const decrement = (): void => {

    counter -= 1;

    if ( counter ) return;

    resolve ();

  };

  const init = (): void => { // Accounting for no increment/decrement calls

    increment ();

    queueMicrotask ( decrement );

  };

  init ();

  return { promise, increment, decrement };

};

/* EXPORT */

export {castArray, isFunction, makeCounterPromise};
