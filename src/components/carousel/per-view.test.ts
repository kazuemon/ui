import { describe, expect, it } from 'vitest';

import { perViewCounts } from './per-view';

describe('perViewCounts', () => {
  it('書かないときは複数枚にしない', () => {
    expect(perViewCounts(undefined)).toBeUndefined();
  });

  it('正の整数はそのまま', () => {
    expect(perViewCounts(3)).toEqual({ base: 3 });
    expect(perViewCounts({ base: 1, md: 3 })).toEqual({ base: 1, md: 3 });
  });

  it('小数は切り捨てる', () => {
    expect(perViewCounts(2.5)).toEqual({ base: 2 });
    expect(perViewCounts({ sm: 1.9, lg: 4.2 })).toEqual({ sm: 1, lg: 4 });
  });

  it('1 未満と数でない値の段は、渡していないものとして扱う', () => {
    expect(perViewCounts(0)).toBeUndefined();
    expect(perViewCounts(Number.NaN)).toBeUndefined();
    expect(perViewCounts({ base: 0.5, md: -2, lg: Infinity, xl: 3 })).toEqual({ xl: 3 });
  });
});
