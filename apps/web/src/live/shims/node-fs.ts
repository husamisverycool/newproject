/** `node:fs` for the in-Claude build: the server never touches the disk there (media go through live/media.ts). */
const missing = (p: unknown) => Object.assign(new Error(`ENOENT: ${String(p)}`), { code: 'ENOENT' });

const fs = {
  existsSync: () => false,
  mkdirSync: () => undefined,
  readFileSync: (p: unknown) => {
    throw missing(p);
  },
  writeFileSync: () => undefined,
  statSync: (p: unknown) => {
    throw missing(p);
  },
  readdirSync: () => [] as string[],
  createReadStream: (p: unknown) => {
    throw missing(p);
  },
  promises: {
    readFile: async (p: unknown) => {
      throw missing(p);
    },
    writeFile: async () => undefined,
  },
};

export default fs;
export const { existsSync, mkdirSync, readFileSync, writeFileSync, statSync, readdirSync, promises } = fs;
