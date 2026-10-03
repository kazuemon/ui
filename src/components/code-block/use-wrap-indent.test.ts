import { describe, expect, test } from 'vitest';

import { leadingColumns } from './use-wrap-indent';

describe('leadingColumns（折り返しの字下げの桁数）', () => {
  test('半角の空白は 1 桁、タブは次のタブ位置まで', () => {
    expect(leadingColumns('    a', 4)).toBe(4);
    expect(leadingColumns('  \ta', 4)).toBe(4);
    expect(leadingColumns('\t\ta', 2)).toBe(4);
  });

  test('全角の空白は 2 桁', () => {
    expect(leadingColumns('　　本文', 4)).toBe(4);
    expect(leadingColumns(' 　a', 4)).toBe(3);
  });

  test('行の途中の空白とタブは数えない', () => {
    expect(leadingColumns('a\t b', 4)).toBe(0);
  });
});
