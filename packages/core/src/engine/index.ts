import type { WebRTCAdapter } from '../adapters';

export interface BifrostOptions {
  server: string;
  debug?: boolean;
}

// TODO: we need correct type for response
export type BifrostCallback = (response: any, error?: string) => void;

export class BifrostEngine {
  private adapter: WebRTCAdapter;
  private server: string;
  private connected = false;
  private sessionId?: string;
  private websocket: WebSocket | null = null;
  private transactions = new Map<string, BifrostCallback>();
  private debug: boolean;

  constructor(adapter: WebRTCAdapter, options: BifrostOptions) {
    this.adapter = adapter;
    this.server = options.server;
    this.debug = options.debug || false;

    // Ensure server URL starts with ws:// or wss://
    if (this.server && !this.server.startsWith('ws')) {
      this.log('Warning: Server URL does not start with ws:// or wss://, WebSocket connection may fail');
    }

    this.log('BifrostEngine created with options:', options);
  }

  public async connect(): Promise<string> {
    this.log('Connecting to Janus server:', this.server);

    return new Promise((resolve, reject) => {
      try {
        this.log('Creating WebSocket connection');

        this.websocket = this.adapter.createWebSocket(this.server, 'janus-protocol');

        this.log('WebSocket connection created', this.websocket);

        this.websocket.onopen = () => {
          this.log('WebSocket connection established');
          this.createSession()
            .then(sessionId => resolve(sessionId))
            .catch(err => reject(err));
        };

        this.websocket.onmessage = (event: any) => {
          const json = JSON.parse(event.data);
          this.handleEvent(json);
        };

        this.websocket.onerror = (error: any) => {
          this.log('WebSocket error:', error);
          reject('WebSocket connection error');
        };

        this.websocket.onclose = () => {
          this.log('WebSocket connection closed');
          this.connected = false;
          this.sessionId = undefined;
        };
      } catch (error) {
        reject(`Failed to connect: ${error}`);
      }
    });
  }

  public async ping(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.connected || !this.sessionId || !this.websocket) {
        reject('Not connected to Janus server');
        return;
      }

      const transaction = this.adapter.randomString(12);
      const request = {
        janus: 'ping',
        transaction,
      };

      this.transactions.set(transaction, (response, error) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });

      this.log('Sending ping:', request);
      this.websocket.send(JSON.stringify(request));
    });
  }

  public async attach(plugin: string = 'janus.plugin.videoroom') {
    return new Promise((resolve, reject) => {
      if (!this.connected || !this.sessionId || !this.websocket) {
        reject('Not connected to Janus server');
        return;
      }

      const transaction = this.adapter.randomString(12);
      const request = {
        janus: 'attach',
        plugin,
        transaction,
        session_id: this.sessionId,
      };

      this.transactions.set(transaction, (response, error) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });

      this.log('Attaching to plugin:', plugin);
      this.websocket.send(JSON.stringify(request));
    });
  }

  public disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.connected || !this.sessionId || !this.websocket) {
        resolve();
        return;
      }

      const transaction = this.adapter.randomString(12);
      const request = {
        janus: 'destroy',
        session_id: this.sessionId,
        transaction,
      };

      this.transactions.set(transaction, (_response, error) => {
        if (error) {
          reject(error);
        } else {
          this.connected = false;
          this.sessionId = undefined;
          if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
          }
          resolve();
        }
      });

      this.log('Destroying session:', request);
      this.websocket.send(JSON.stringify(request));
    });
  }

  private async createSession(): Promise<string> {
    return new Promise((resolve, reject) => {
      const transaction = this.adapter.randomString(12);
      const request = {
        janus: 'create',
        transaction,
      };

      this.transactions.set(transaction, (response, error) => {
        if (error) {
          reject(error);
        } else {
          this.sessionId = (response.data.id || '') as string;
          this.connected = true;
          resolve(this.sessionId);
        }
      });

      this.log('Creating session:', request);
      this.websocket?.send(JSON.stringify(request));
    });
  }

  // TODO: define proper type for json
  private handleEvent(json: any) {
    this.log('Received event:', json);

    const transaction = json.transaction;
    if (transaction && this.transactions.has(transaction)) {
      const callback = this.transactions.get(transaction)!;
      if (json.janus === 'success') {
        callback(json);
      } else if (json.janus === 'error') {
        callback(null, `Janus error: ${json.error.code} ${json.error.reason}`);
      } else if (json.janus === 'ack' || json.janus === 'pong') {
        callback(json);
      }

      // Remove transaction once handled
      this.transactions.delete(transaction);
    } else if (json.janus === 'event') {
      // TODO: handle plugin events
      this.log('Plugin event:', json);
    } else if (json.janus === 'timeout') {
      // TODO: machine should handle this! consider using event emitter :/
      this.log('Session timeout');
      this.connected = false;
    } else {
      // TODO: handle other events
    }
  }

  private log(...args: any[]): void {
    if (this.debug) {
      console.log('[BifrostEngine]', ...args);
    }
  }
}
