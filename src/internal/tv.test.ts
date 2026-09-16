import { extendTailwindMerge } from 'tailwind-merge';
import { expect, test } from 'vitest';

import tokens from '../../design/tokens.css?raw';
import { twMergeConfig } from './tv';

// tailwind-merge に知らせる名前（tv.ts）が、design/tokens.css の @theme と同じかを確かめる
// 部品の層（最後の :root）より前を読み、Tailwind のクラスになる名前空間の名前を拾う
const NAMESPACES = [
  'spacing',
  'text',
  'leading',
  'radius',
  'shadow',
  'ease',
  'animate',
  'font-weight',
] as const;
// tailwind-merge が既に知っている名前（角丸の t シャツの大きさ）
const KNOWN = /^(xs|sm|md|lg|xl|[2-4]xl)$/;

function themeNames() {
  const theme = tokens.slice(0, tokens.lastIndexOf(':root {')).replace(/\/\*[\s\S]*?\*\//g, '');
  const names: Record<string, Set<string>> = {};
  for (const [, namespace, key] of theme.matchAll(
    new RegExp(`--(${NAMESPACES.join('|')})-([a-z0-9-]+)\\s*:`, 'g')
  )) {
    if (key.includes('--') || (namespace === 'radius' && KNOWN.test(key))) continue;
    (names[namespace] ??= new Set()).add(key);
  }
  return names;
}

test('tailwind-merge に知らせる名前が tokens.css の @theme と同じ', () => {
  const names = themeNames();
  for (const namespace of NAMESPACES) {
    expect(new Set(twMergeConfig.extend.theme[namespace]), namespace).toEqual(
      names[namespace] ?? new Set()
    );
  }
});

test('ライブラリのクラスを、同じ種類のクラスとしてまとめる', () => {
  const merge = extendTailwindMerge(twMergeConfig);
  expect(merge('h-control h-full')).toBe('h-full');
  expect(merge('px-control-x px-2')).toBe('px-2');
  expect(merge('rounded-control rounded-lg')).toBe('rounded-lg');
  expect(merge('shadow-raised shadow-none')).toBe('shadow-none');
  expect(merge('text-label text-caption')).toBe('text-caption');
  // 文字の大きさと色は別の種類
  expect(merge('text-caption text-fg-subtle')).toBe('text-caption text-fg-subtle');
});
