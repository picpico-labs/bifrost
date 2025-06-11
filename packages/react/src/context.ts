import { BifrostEngine, createBifrostMachine, type WebRTCAdapter } from '@picpico-labs/bifrost-core';
import { createActorContext } from '@xstate/react';

interface Props {
  adapter: WebRTCAdapter;
  server: string;
  debug?: boolean;
}

function createBifrostContext({ adapter, server, debug }: Props) {
  const engine = new BifrostEngine(adapter, {
    server,
    debug,
  });

  const machine = createBifrostMachine(engine);

  return createActorContext(machine);
}

let BifrostContext: ReturnType<typeof createBifrostContext> | null = null;

export function initBifrost(props: Props) {
  if (!BifrostContext) {
    BifrostContext = createBifrostContext(props);
  }
}

export function getBifrostContext() {
  if (!BifrostContext) {
    throw new Error('BifrostContext is not initialized. Please call initBifrost first.');
  }

  return BifrostContext;
}
