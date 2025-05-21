import { assign, setup, fromPromise } from 'xstate';

import { BifrostEngine } from '../engine';

export interface BifrostContext {
  sessionId: string | null;
  handleId: string | null;
  error: string | null;
  plugin: string;
  janusResponse: any; // last response from Janus
}

export type BifrostEvent =
  | { type: 'CONNECT' }
  | { type: 'ATTACH'; plugin?: string }
  | { type: 'PING' }
  | { type: 'DISCONNECT' };

export type JanusPlugin = 'janus.plugin.videoroom'; // | 'janus.plugin.audiobridge' | 'janus.plugin.streaming';

export interface BifrostInput {
  defaultPlugin?: JanusPlugin;
}

export function createBifrostMachine(engine: BifrostEngine) {
  return setup({
    types: {
      context: {} as BifrostContext,
      events: {} as BifrostEvent,
      input: {} as BifrostInput,
    },

    // TODO: we need correct type for engine responses
    actors: {
      connectToJanus: fromPromise<string, void>(async () => {
        return await engine.connect();
      }),

      pingJanus: fromPromise<any, void>(async () => {
        return await engine.ping();
      }),

      attachPlugin: fromPromise<any, { plugin: string }>(async ({ input }) => {
        return await engine.attach(input.plugin);
      }),

      disconnectFromJanus: fromPromise<void, void>(async () => {
        await engine.disconnect();
      }),
    },

    guards: {
      hasSession: ({ context }) => context.sessionId !== null,
      hasHandle: ({ context }) => context.handleId !== null,
    },

    actions: {
      logStateTransition: ({ context, event }) => {
        console.log(
          `State transition: Event ${event.type}, SessionId: ${context.sessionId}, HandleId: ${context.handleId}`
        );
      },

      clearError: assign({
        error: null,
      }),
    },
  }).createMachine({
    id: 'bifrost',
    initial: 'disconnected',

    context: ({ input }) => ({
      sessionId: null,
      handleId: null,
      error: null,
      plugin: input?.defaultPlugin || 'janus.plugin.videoroom',
      janusResponse: null,
    }),

    states: {
      disconnected: {
        entry: [
          assign({
            sessionId: null,
            handleId: null,
            error: null,
            janusResponse: null,
          }),
          () => {
            console.log('Bifrost disconnected');
          },
        ],
        on: {
          CONNECT: { target: 'connecting' },
        },
      },

      connecting: {
        entry: ['clearError', 'logStateTransition'],
        invoke: {
          src: 'connectToJanus',
          onDone: {
            target: 'attaching',
            actions: assign({
              sessionId: ({ event }) => event.output,
              janusResponse: ({ event }) => event.output,
            }),
          },
          onError: {
            target: 'failed',
            actions: assign({
              error: ({ event }) => `Connection failed: ${event.error}`,
            }),
          },
        },
      },

      attaching: {
        entry: ['logStateTransition'],
        invoke: {
          src: 'attachPlugin',
          input: ({ context }) => ({
            plugin: context.plugin,
          }),
          onDone: {
            target: 'attached',
            actions: assign({
              handleId: ({ event }) => event.output.data.id,
              janusResponse: ({ event }) => event.output,
            }),
          },
          onError: {
            target: 'connected',
            actions: assign({
              error: ({ event }) => `Plugin attachment failed: ${event.error}`,
              janusResponse: ({ event }) => event.error,
            }),
          },
        },
      },

      connected: {
        entry: ['logStateTransition'],
        on: {
          ATTACH: {
            target: 'attaching',
            actions: assign({
              plugin: ({ event, context }) => event.plugin || context.plugin,
            }),
          },
          PING: { target: 'pinging' },
          DISCONNECT: { target: 'disconnecting' },
        },
        always: [
          {
            guard: 'hasHandle',
            target: 'attached',
          },
        ],
      },

      attached: {
        entry: ['logStateTransition'],
        on: {
          PING: { target: 'pinging' },
          DISCONNECT: { target: 'disconnecting' },
          ATTACH: {
            target: 'attaching',
            actions: assign({
              plugin: ({ event, context }) => event.plugin || context.plugin,
            }),
          },
        },
      },

      pinging: {
        entry: ['logStateTransition'],
        invoke: {
          src: 'pingJanus',
          onDone: {
            target: 'connected',
            actions: assign({
              janusResponse: ({ event }) => event.output,
            }),
          },
          onError: {
            target: 'connected',
            actions: assign({
              error: ({ event }) => `Ping failed: ${event.error}`,
            }),
          },
        },
      },

      disconnecting: {
        entry: ['logStateTransition'],
        invoke: {
          src: 'disconnectFromJanus',
          onDone: {
            target: 'disconnected',
          },
          onError: {
            target: 'failed',
            actions: assign({
              error: ({ event }) => `Disconnection failed: ${event.error}`,
            }),
          },
        },
      },

      failed: {
        entry: ({ context }) => {
          console.error('Bifrost failed:', context.error);
        },
        on: {
          CONNECT: { target: 'connecting' },
        },
      },
    },
  });
}
