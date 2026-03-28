#!/usr/bin/env node
/**
 * esbuild-check.js — Build health check script for WildArc frontend
 *
 * Rationale: Vite's production build requires @rollup/rollup-linux-arm64-gnu,
 * a native binary that is NOT persisted across FUSE mount sessions and cannot
 * be re-downloaded when the npm registry is blocked. This script uses the
 * esbuild 0.27.3 binary already present in the backend node_modules (which
 * IS persisted) to verify the frontend bundles without errors.
 *
 * Usage: node scripts/esbuild-check.js
 * Or:    cd frontend && npm run build:check
 *
 * This is the primary build health check for automated agents (steward,
 * watchdog). The full `npm run build` (Vite + Rollup) is for deployment
 * and should be run from Yogesh's laptop where node_modules persists.
 */

'use strict';

const { execFileSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const FRONTEND_SRC = path.join(ROOT, 'frontend', 'src', 'main.tsx');

// Candidate esbuild binary locations (in priority order)
const ESBUILD_CANDIDATES = [
  path.join(ROOT, 'node_modules', '@esbuild', 'linux-arm64', 'bin', 'esbuild'),
  '/usr/local/lib/node_modules_global/lib/node_modules/tsx/node_modules/@esbuild/linux-arm64/bin/esbuild',
];

function findEsbuild() {
  for (const candidate of ESBUILD_CANDIDATES) {
    if (fs.existsSync(candidate)) {
      try {
        const result = spawnSync(candidate, ['--version'], { encoding: 'utf8', timeout: 5000 });
        if (result.status === 0) return candidate;
      } catch (_) {}
    }
  }
  return null;
}

const esbuildBin = findEsbuild();

if (!esbuildBin) {
  console.error('❌ No working esbuild binary found. Cannot run build check.');
  console.error('   Checked:', ESBUILD_CANDIDATES.join('\n           '));
  process.exit(1);
}

console.log(`✓ Using esbuild at: ${esbuildBin}`);
console.log(`  Version: ${spawnSync(esbuildBin, ['--version'], { encoding: 'utf8' }).stdout.trim()}`);
console.log(`  Bundling: ${FRONTEND_SRC}`);

const outfile = path.join(os.tmpdir(), `wildarc-build-check-${Date.now()}.js`);

const args = [
  FRONTEND_SRC,
  '--bundle',
  '--loader:.tsx=tsx',
  '--loader:.ts=ts',
  '--loader:.svg=dataurl',
  '--loader:.png=dataurl',
  '--loader:.jpg=dataurl',
  '--loader:.jpeg=dataurl',
  '--loader:.gif=dataurl',
  '--loader:.webp=dataurl',
  '--loader:.woff=dataurl',
  '--loader:.woff2=dataurl',
  '--loader:.css=css',
  '--platform=browser',
  '--format=esm',
  '--jsx=automatic',
  '--jsx-import-source=react',
  '--target=es2020',
  `--outfile=${outfile}`,
  '--log-level=warning',
];

const start = Date.now();
const result = spawnSync(esbuildBin, args, {
  encoding: 'utf8',
  timeout: 120000,
  cwd: path.join(ROOT, 'frontend'),
});

// Clean up output file
try { fs.unlinkSync(outfile); } catch (_) {}
try { fs.unlinkSync(outfile.replace('.js', '.css')); } catch (_) {}

const elapsed = ((Date.now() - start) / 1000).toFixed(1);

if (result.status !== 0) {
  console.error(`❌ Build check FAILED after ${elapsed}s`);
  if (result.stderr) console.error(result.stderr);
  if (result.stdout) console.error(result.stdout);
  process.exit(1);
}

if (result.stderr && result.stderr.trim()) {
  console.warn('⚠️  Build warnings:');
  console.warn(result.stderr);
}

console.log(`✅ Build check PASSED in ${elapsed}s — frontend bundles without errors`);
process.exit(0);
