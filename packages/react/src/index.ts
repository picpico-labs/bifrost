import { useBifrostContext } from './context';

export function useBifrost() {
  const { engine } = useBifrostContext();

  return {
    ping: () => engine.ping(),
    connect: () => engine.connect(),
    disconnect: () => engine.disconnect(),
    attach: () => engine.attach(),
  };
}

export * from './provider';
export * from './context';
