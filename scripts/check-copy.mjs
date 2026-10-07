#!/usr/bin/env node
// Enforces "every visible string comes from a source deck" (packages/shared/src/sources).
//  1. Every top-level entry in a deck has a JSDoc with a provenance tag.
//  2. UI code (apps/web/src) renders no inline copy: JSX text and copy-bearing props must come from decks.
//  3. Server code passes no inline copy to push(), messages or game state titles.
// Usage: node scripts/check-copy.mjs [--list]   (exit 1 on violations)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createRequire } from 'node:module';

const root = new URL('..', import.meta.url).pathname;
const TAG = /\[(I|I-partial|V|V-weak|B-high|B-med|B-med-high|B-low|B-low-med|HIG|S|DEMO)\]/;
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

// 2. Web UI: inline copy, found on the TypeScript AST (no false positives from generics).
const require = createRequire(import.meta.url);
const ts = require('typescript');
const COPY_ATTRS = new Set(['placeholder', 'title', 'label', 'aria-label', 'alt', 'sub', 'body', 'hint', 'caption', 'heading', 'empty', 'message']);
const COPY_KEYS = new Set(['label', 'title', 'sub', 'body', 'message', 'placeholder', 'hint', 'caption']);
const wordy = (t) => /[A-Za-z]{2}/.test(t);
for (const file of walk(join(root, 'apps/web/src'), ['.tsx'])) {
  const src = readFileSync(file, 'utf8');
  const isDemo = rel(file).startsWith('apps/web/src/stage/');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const at = (n) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
  const flag = (n, kind, t) => problems.push(`${rel(file)}:${at(n)}  inline ${kind}${isDemo ? ' (demo harness)' : ''}: "${t.trim().slice(0, 60)}"`);
  const literalText = (e) => (e && (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) ? e.text : e && ts.isTemplateExpression(e) ? e.head.text + e.templateSpans.map((x) => x.literal.text).join(' ') : null);
  const visit = (n) => {
    if (ts.isJsxText(n) && wordy(n.text)) flag(n, 'JSX text', n.text);
    else if (ts.isJsxAttribute(n) && COPY_ATTRS.has(n.name.getText(sf))) {
      const init = n.initializer;
      const t = init && ts.isStringLiteral(init) ? init.text : init && ts.isJsxExpression(init) ? literalText(init.expression) : null;
      if (t && wordy(t)) flag(n, n.name.getText(sf), t);
    } else if (ts.isJsxExpression(n) && n.parent && (ts.isJsxElement(n.parent) || ts.isJsxFragment(n.parent))) {
      const t = literalText(n.expression);
      if (t && wordy(t)) flag(n, 'JSX text', t);
    } else if (ts.isPropertyAssignment(n) && COPY_KEYS.has(n.name.getText(sf))) {
      const t = literalText(n.initializer);
      if (t && wordy(t) && /\s|^[A-Z]/.test(t)) flag(n, `${n.name.getText(sf)}:`, t);
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
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
