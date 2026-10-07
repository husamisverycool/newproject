import path from 'node:path';
import { ROOT } from './env.ts';

// librsvg (used by sharp for SVG overlays) resolves fonts through fontconfig; point it at the
// bundled OFL fonts before the first render.
process.env.FONTCONFIG_FILE ??= path.join(ROOT, 'apps/server/fonts/fonts.conf');
