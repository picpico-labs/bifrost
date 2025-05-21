import { core } from "@picpico-labs/bifrost-core";
import { useBifrost } from "@picpico-labs/bifrost-react";

function App() {
  return (
    <>
      <h1>Bifrost Demo</h1>
      <p>{core()}</p>
      <p>{useBifrost()}</p>
    </>
  );
}

export default App;
