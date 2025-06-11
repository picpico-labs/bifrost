import type { PropsWithChildren } from 'react';

import { getBifrostContext } from './context';

export function BifrostProvider({ children }: PropsWithChildren) {
  const BifrostContext = getBifrostContext();

  return <BifrostContext.Provider>{children}</BifrostContext.Provider>;
}
