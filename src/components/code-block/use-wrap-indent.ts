'use client';

import { type RefObject, useLayoutEffect } from 'react';

// 折り返し（wrap）の続きの行を、その行のもとの字下げ（行頭の空白）と同じだけ下げる
// 行頭の空白の桁数を数え、行（.line）の --cb-line-indent に文字の数（ch）で書く。下げ方は CodeBlock の wrap のクラス
// 字下げのない行は 0 なので、続きの行は行の頭にそろう

/** 行頭の空白が何桁ぶんか。タブは次のタブ位置まで進める */
export function leadingColumns(text: string, tabSize: number) {
  let columns = 0;
  for (const char of text) {
    if (char === ' ') columns += 1;
    else if (char === '\t') columns += tabSize - (columns % tabSize);
    else break;
  }
  return columns;
}

/**
 * wrap のとき、root の中の pre の各行に、行頭の空白の桁数を --cb-line-indent として書く。
 * 中身（html・children）が変わると行が入れ替わるので、描くたびに書き直す
 */
export function useWrapIndent(rootRef: RefObject<HTMLElement | null>, wrap: boolean) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !wrap) return;
    const pre = root.querySelector('pre');
    if (!pre) return;
    const tabSize = Number.parseInt(getComputedStyle(pre).tabSize, 10) || 8;
    // 描くたびに走るので、値が変わった行だけに書く（コピーの押下などで中身が変わらないときは何も書かない）
    for (const line of root.querySelectorAll<HTMLElement>('pre .line')) {
      const indent = `${leadingColumns(line.textContent ?? '', tabSize)}ch`;
      if (line.style.getPropertyValue('--cb-line-indent') !== indent) {
        line.style.setProperty('--cb-line-indent', indent);
      }
    }
  });
}
