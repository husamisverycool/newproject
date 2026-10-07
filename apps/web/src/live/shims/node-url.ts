/** `node:url` for the in-Claude build. */
export const fileURLToPath = (u: string | URL) => String(u).replace(/^file:\/\//, '') || '/';
export default { fileURLToPath };
