export interface WebRTCAdapter {
  createWebSocket(url: string, protocol: string): WebSocket;
  randomString(length: number): string;
}
