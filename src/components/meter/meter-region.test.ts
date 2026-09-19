import { describe, expect, it } from 'vitest';

import { meterRegion } from './meter-region';

const range = { min: 0, max: 100 };

describe('meterRegion', () => {
  it('low・high がなければ範囲を分けない', () => {
    expect(meterRegion({ ...range, value: 50 })).toBeUndefined();
  });

  it('optimum が低い範囲（少ないほどよい）', () => {
    const bounds = { ...range, low: 60, high: 85, optimum: 0 };
    expect(meterRegion({ ...bounds, value: 40 })).toBe('optimum');
    expect(meterRegion({ ...bounds, value: 72 })).toBe('suboptimum');
    expect(meterRegion({ ...bounds, value: 93 })).toBe('even-less-good');
  });

  it('optimum が高い範囲（多いほどよい）', () => {
    const bounds = { ...range, low: 20, high: 50, optimum: 100 };
    expect(meterRegion({ ...bounds, value: 80 })).toBe('optimum');
    expect(meterRegion({ ...bounds, value: 35 })).toBe('suboptimum');
    expect(meterRegion({ ...bounds, value: 10 })).toBe('even-less-good');
  });

  it('optimum が真ん中の範囲なら、どちらに外れても suboptimum', () => {
    const bounds = { ...range, low: 30, high: 70 };
    expect(meterRegion({ ...bounds, value: 50 })).toBe('optimum');
    expect(meterRegion({ ...bounds, value: 10 })).toBe('suboptimum');
    expect(meterRegion({ ...bounds, value: 90 })).toBe('suboptimum');
  });
});
