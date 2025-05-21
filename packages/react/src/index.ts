import { useCallback } from 'react';

import { getBifrostContext } from './context';


export function useBifrost() {
  const { useActorRef, useSelector } = getBifrostContext();

  const actorRef = useActorRef();

  const state = useSelector((state) => state.value);
  const context = useSelector((state) => state.context);
  const error = useSelector((state) => state.error);  

  const connect = useCallback(() => actorRef.send({ type: 'CONNECT' }), [actorRef]);
  const ping = useCallback(() => actorRef.send({ type: 'PING' }), [actorRef]);
  const attach = useCallback(() => actorRef.send({ type: 'ATTACH' }), [actorRef]);
  const disconnect = useCallback(() => actorRef.send({ type: 'DISCONNECT' }), [actorRef]);

  return {
    error,
    state,
    context,
    connect,
    ping,
    attach,
    disconnect,
  };
}

export * from './context';
export * from './provider';
