import { BifrostProvider, initBifrost } from '@picpico-labs/bifrost-react';
import { BrowserAdapter } from '@picpico-labs/bifrost-platforms';

import { Test } from './Test';

const JANUS_URL = 'ws://localhost:8188/janus';
const adapter = new BrowserAdapter();

initBifrost({
  adapter,
  server: JANUS_URL,
  debug: true,
});

function App() {
  return (
    <BifrostProvider>
      <h1>Bifrost Demo</h1>
      <Test />
    </BifrostProvider>
  );
}

export default App;
