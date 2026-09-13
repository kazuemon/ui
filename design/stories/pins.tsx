import type { CSSProperties, ReactNode } from 'react';

// 比べたあとで変わった部品の見た目を、比べたときの形に戻す（同じ比較を再現する）

// トグル（軸 29 より前に比べたもの）
//   押せないときのラベル: いまはほかの押せない文字と同じグレー（--color-switch-label-disabled）。比べたときは本文の色
//   トラックの縦の位置: いまはラベルの行の中央（--switch-track-rows: 1 / 2）。比べたときはラベルとキャプションのまとまりの中央
//   トラックの左右は、各ストーリーで togglePlacement="end" を付けて戻している
const switchAsCompared: CSSProperties & Record<`--${string}`, string> = {
  '--color-switch-label-disabled': 'var(--color-fg)',
  '--switch-track-rows': '1 / -1',
};

/** トグルを、比べたときの見た目（押せないラベルは本文の色、トラックはまとまりの中央）に戻す */
export const keepSwitchAsCompared = (Story: () => ReactNode) => (
  <div style={switchAsCompared}>
    <Story />
  </div>
);
