/** `node:path` for the in-Claude build (POSIX joins only; the server only builds file paths it never opens there). */
const norm = (p: string) => p.replace(/\/+/g, '/');
const path = {
  sep: '/',
  join: (...parts: string[]) => norm(parts.filter(Boolean).join('/')),
  resolve: (...parts: string[]) => norm(`/${parts.filter(Boolean).join('/')}`),
  dirname: (p: string) => p.replace(/\/[^/]*$/, '') || '/',
  basename: (p: string, ext?: string) => {
    const b = p.split('/').pop() ?? '';
    return ext && b.endsWith(ext) ? b.slice(0, -ext.length) : b;
  },
  extname: (p: string) => /\.[^./]*$/.exec(p)?.[0] ?? '',
  normalize: norm,
};
export default path;
export const { join, resolve, dirname, basename, extname, normalize, sep } = path;
