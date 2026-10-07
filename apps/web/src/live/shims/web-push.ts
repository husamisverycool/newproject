/** `web-push` in the in-Claude build: no Web Push there (see empty.ts). */
export default {
  generateVAPIDKeys: () => ({ publicKey: '', privateKey: '' }),
  setVapidDetails: () => undefined,
  sendNotification: async () => undefined,
};
