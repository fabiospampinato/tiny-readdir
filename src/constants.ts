
/* MAIN */

const NOOP_PROMISE_LIKE = {
  then: ( onResolve: () => void, _onReject: ( error: unknown ) => void ) => {
    onResolve ();
  }
};

/* EXPORT */

export {NOOP_PROMISE_LIKE};
