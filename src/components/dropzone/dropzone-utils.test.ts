import { describe, expect, it, vi } from 'vitest';

import { evaluateFiles } from './dropzone-utils';

const file = (name: string, size = 1, type = 'image/png') =>
  new File(['x'.repeat(size)], name, { type });

const reasons = (result: ReturnType<typeof evaluateFiles>) =>
  result.rejected.map((r) => [r.file.name, r.reason, r.message]);

describe('evaluateFiles の validateFile', () => {
  it('返した文で弾き、reason: custom と message で伝える', () => {
    const result = evaluateFiles([file('a b.png'), file('ab.png')], {
      multiple: true,
      validateFile: (f) => (f.name.includes(' ') ? '空白は使えません' : null),
      currentCount: 0,
    });
    expect(result.accepted.map((f) => f.name)).toEqual(['ab.png']);
    expect(reasons(result)).toEqual([['a b.png', 'custom', '空白は使えません']]);
  });

  it('空文字・undefined は受け付ける', () => {
    const result = evaluateFiles([file('a.png'), file('b.png')], {
      multiple: true,
      validateFile: (f) => (f.name === 'a.png' ? '' : undefined),
      currentCount: 0,
    });
    expect(result.accepted).toHaveLength(2);
  });

  it('種類と大きさで弾いたファイルは確かめない', () => {
    const validateFile = vi.fn(() => null);
    evaluateFiles([file('a.txt', 1, 'text/plain'), file('big.png', 10)], {
      accept: 'image/*',
      maxSize: 5,
      multiple: true,
      validateFile,
      currentCount: 0,
    });
    expect(validateFile).not.toHaveBeenCalled();
  });

  it('弾いたファイルは数の上限に数えない', () => {
    const result = evaluateFiles([file('ng.png'), file('ok1.png'), file('ok2.png')], {
      multiple: true,
      maxFiles: 2,
      validateFile: (f) => (f.name.startsWith('ng') ? 'だめ' : null),
      currentCount: 1,
    });
    expect(result.accepted.map((f) => f.name)).toEqual(['ok1.png']);
    expect(reasons(result)).toEqual([
      ['ng.png', 'custom', 'だめ'],
      ['ok2.png', 'maxFiles', undefined],
    ]);
  });

  it('1 つだけ選ぶ欄でも、弾いたファイルの次のファイルを受け付ける', () => {
    const result = evaluateFiles([file('ng.png'), file('ok.png')], {
      multiple: false,
      validateFile: (f) => (f.name.startsWith('ng') ? 'だめ' : null),
      currentCount: 0,
    });
    expect(result.accepted.map((f) => f.name)).toEqual(['ok.png']);
  });
});
