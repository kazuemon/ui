import { defineConfig } from 'tsdown';

// 配布物の JS と型（dist/）。ファイルを分けたまま出す（ツリーシェイクと、ファイルごとの 'use client' を残すため）
export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  platform: 'neutral',
  target: 'es2023',
  unbundle: true,
  tsconfig: 'tsconfig.build.json',
  dts: true,
  // npm のパッケージはすべて外に置く（使う側で解決する）
  deps: { neverBundle: true },
});
