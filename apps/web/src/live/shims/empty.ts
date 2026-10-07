/**
 * Stand-in for Node-only packages in the in-Claude build: `ws` (no sockets; events travel through the
 * shared log and the room), `web-push` (no Web Push; the in-app inbox and toasts remain) and the
 * Anthropic SDK (the game master asks the viewer's own Claude instead, see platform.askJson).
 */
export class WebSocketServer {
  constructor() {
    throw new Error('WebSocketServer is not available in the page');
  }
}
export const WebSocket = { OPEN: 1 };
const webpush = {
  generateVAPIDKeys: () => ({ publicKey: '', privateKey: '' }),
  setVapidDetails: () => undefined,
  sendNotification: async () => undefined,
};
export class APIError extends Error {
  status = 0;
}
export default class Anthropic {
  static APIError = APIError;
  constructor() {
    throw new Error('The Anthropic SDK is not bundled in the page');
  }
}
export const betaZodOutputFormat = () => ({});
export { webpush };
