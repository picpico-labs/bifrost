import { createContext, useContext } from 'react';
import { BifrostEngine } from '@picpico-labs/bifrost-core';

interface BifrostContextValue {
  engine: BifrostEngine;
}

export const BifrostContext = createContext<BifrostContextValue | null>(null);

export function useBifrostContext() {
  const context = useContext(BifrostContext);

  if (context === null) {
    throw new Error('useBifrostContext must be used within a BifrostProvider');
  }

  return context;
}
