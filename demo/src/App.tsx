import { BifrostProvider } from '@picpico-labs/bifrost-react';
import { BrowserAdapter } from '@picpico-labs/bifrost-platforms';

import { Test } from './Test';

const JANUS_URL = 'ws://localhost:8188/janus';

const browserAdapter = new BrowserAdapter();

function App() {
  return (
    <BifrostProvider adapter={browserAdapter} server={JANUS_URL} debug>
      <h1>Bifrost Demo</h1>
      <Test />
    </BifrostProvider>
  );
}

export default App;
