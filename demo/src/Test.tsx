import { useBifrost } from '@picpico-labs/bifrost-react';

export const Test = () => {
  const { ping, connect, attach, state, context, disconnect } = useBifrost();

  return (
    <div>
      <h2>Test</h2>
      <h3>State: {state}</h3>
      <h3>Context:</h3>
      <div>
        {JSON.stringify(context)
          .split(',')
          .map(r => (
            <h4 key={r}>{r}</h4>
          ))}
      </div>

      <h3>Actions:</h3>

      <button onClick={() => connect()}>connect</button>
      <button onClick={() => ping()}>ping</button>
      <button onClick={() => attach()}>attach</button>
      <button onClick={() => disconnect()}>disconnect</button>
    </div>
  );
};
