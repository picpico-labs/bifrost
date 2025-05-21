import { WebRTCAdapter } from '@picpico-labs/bifrost-core/adapters';
import { randomString } from '@picpico-labs/bifrost-core/lib';

export class NativeAdapter implements WebRTCAdapter {
  createWebSocket(url: string, protocol: string): WebSocket {
    return new WebSocket(url, protocol);
  }

  randomString(length: number): string {
    return randomString(length);  
  }
}
