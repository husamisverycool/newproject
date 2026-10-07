#!/usr/bin/env node
// Enforces "every visible string comes from a source deck" (packages/shared/src/sources).
//  1. Every top-level entry in a deck has a JSDoc with a provenance tag.
//  2. UI code (apps/web/src) renders no inline copy: JSX text and copy-bearing props must come from decks.
//  3. Server code passes no inline copy to push(), messages or game state titles.
// Usage: node scripts/check-copy.mjs [--list]   (exit 1 on violations)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const TAG = /\[(V|V-weak|B-high|B-med|B-med-high|B-low|B-low-med|HIG|S|DEMO)\]/;
const walk = (dir, ext) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (f === 'node_modules' || f === 'dist') return [];
    return statSync(p).isDirectory() ? walk(p, ext) : ext.some((e) => p.endsWith(e)) ? [p] : [];
  });
const problems = [];
const rel = (p) => relative(root, p);

// 1. Deck provenance
for (const file of walk(join(root, 'packages/shared/src/sources'), ['.ts'])) {
  if (file.endsWith('index.ts')) continue;
  const lines = readFileSync(file, 'utf8').split('\n');
  let depth = 0;
  lines.forEach((line, i) => {
    const before = depth;
    for (const ch of line.replace(/'[^']*'|"[^"]*"|`[^`]*`/g, '')) {
      if (ch === '{' || ch === '[' || ch === '(') depth++;
      if (ch === '}' || ch === ']' || ch === ')') depth--;
    }
    if (before !== 1) return;
    const m = line.match(/^\s{2}([A-Za-z_]\w*)\s*:/);
    if (!m) return;
    let j = i - 1;
    while (j >= 0 && lines[j].trim() === '') j--;
    const doc = [];
    if (lines[j]?.trim().endsWith('*/')) {
      while (j >= 0) {
        doc.unshift(lines[j]);
        if (lines[j].includes('/**')) break;
        j--;
      }
    }
    if (!TAG.test(doc.join(' '))) problems.push(`${rel(file)}:${i + 1}  deck entry "${m[1]}" has no provenance tag`);
  });
}

// 2. Web UI: inline copy
const COPY_PROPS = /\b(placeholder|title|label|aria-label|alt|sub|body|hint|caption|heading|empty)=("([^"]*[A-Za-z]{2}[^"]*)"|'([^']*[A-Za-z]{2}[^']*)'|\{`([^`]*[A-Za-z]{2}[^`]*)`\}|\{'([^']*[A-Za-z]{2}[^']*)'\}|\{"([^"]*[A-Za-z]{2}[^"]*)"\})/g;
const JSX_TEXT = />([^<>{}]*[A-Za-z]{2}[^<>{}]*)</g;
for (const file of walk(join(root, 'apps/web/src'), ['.tsx'])) {
  const src = readFileSync(file, 'utf8');
  const isDemo = rel(file).startsWith('apps/web/src/stage/');
  src.split('\n').forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line) || /^\s*import /.test(line)) return;
    for (const m of line.matchAll(JSX_TEXT)) {
      const t = m[1].trim();
      if (!t || /^[\w.]+$/.test(t) && !/\s/.test(t) && /[a-z][A-Z]|^[a-z]+$/.test(t) && false) continue;
      if (/=>|&&|\|\||\?\s|:\s*\w+\s*[;,)]|^\)|\(\w*\)\s*:/.test(t)) continue; // TS generics / expressions split by the regex
      problems.push(`${rel(file)}:${i + 1}  inline JSX text${isDemo ? ' (demo harness)' : ''}: "${t.slice(0, 60)}"`);
    }
    for (const m of line.matchAll(COPY_PROPS)) {
      const t = (m[3] ?? m[4] ?? m[5] ?? m[6] ?? m[7] ?? '').trim();
      problems.push(`${rel(file)}:${i + 1}  inline ${m[1]}${isDemo ? ' (demo harness)' : ''}: "${t.slice(0, 60)}"`);
    }
  });
}

// 3. Server: inline copy handed to users
const SERVER_COPY = /\b(title|body|text|line|intro|name|label)\s*:\s*(['"`])([^'"`]*[A-Za-z]{3,}\s[^'"`]*)\2/g;
for (const file of walk(join(root, 'apps/server/src'), ['.ts'])) {
  const r = rel(file);
  if (r.endsWith('seed.ts') || r.includes('/ai/image.ts') || r.includes('/ai/gm.ts') && false) continue;
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line) || /SELECT|INSERT|UPDATE|DELETE|CREATE/.test(line)) return;
    for (const m of line.matchAll(SERVER_COPY)) problems.push(`${r}:${i + 1}  inline server copy (${m[1]}): "${m[3].slice(0, 60)}"`);
  });
}

if (process.argv.includes('--list') || problems.length) for (const p of problems) console.log(p);
console.log(`\ncheck-copy: ${problems.length} problem(s)`);
process.exit(problems.length ? 1 : 0);
