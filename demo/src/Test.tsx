import { useBifrost } from '@picpico-labs/bifrost-react';

export const Test = () => {
  const { ping, connect, attach } = useBifrost();

  return (
    <div>
      <button onClick={() => connect()}>connect</button>
      <button onClick={() => ping()}>ping</button>
      <button onClick={() => attach()}>attach</button>
    </div>
  );
};
