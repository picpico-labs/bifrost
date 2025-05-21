import { BifrostEngine, WebRTCAdapter } from '@picpico-labs/bifrost-core';
import { PropsWithChildren, useMemo } from 'react';
import { BifrostContext } from './context';

interface ProviderProps {
  adapter: WebRTCAdapter;
  server: string;
  debug?: boolean;
}

export function BifrostProvider({
  children,
  adapter,
  server,
  debug,
}: PropsWithChildren<ProviderProps>) {
  const engine = useMemo(
    () =>
      new BifrostEngine(adapter, {
        server,
        debug,
      }),
    [adapter]
  );

  const contextValue = useMemo(() => ({ engine }), [engine]);

  return <BifrostContext.Provider value={contextValue}>{children}</BifrostContext.Provider>;
}
