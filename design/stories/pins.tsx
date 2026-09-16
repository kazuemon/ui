import type { CSSProperties, ReactNode } from 'react';

// 比べたあとで変わった部品の見た目を、比べたときの形に戻す（同じ比較を再現する）

// トグルの OFF と、チェックボックス・ラジオの選んでいない箱の色（軸 47 の D の色を既定にするより前に比べたもの）
//   いまは OFF のトラックも選んでいない箱も、入力欄の prefix・suffix と同じ一段濃いグレー（#E1E3E4）。
//   押せない OFF と押せない箱は、ふだんより薄い入力欄の塗りのグレー（#F2F4F4）
//   比べたときは、OFF はグレーのボタンの塗り（#EFF0F1）で、押せない OFF は #E1E3E4。
//   選んでいない箱は入力欄の塗り（#F2F4F4）、hover は入力欄の hover、エラーは入力欄のエラー、押せない箱は押せない入力欄（#E1E3E4）
//   色なし（neutral）の押せない ON のトラックと押せない選んだ箱: いまは押せない OFF・押せない箱と同じ #F2F4F4。
//   比べたときは押せないグレーのボタンの塗り（#E1E3E4）
//   色つきの押せない OFF のノブ: いまはグレー（軸 49 の A）。比べたときは白
//   エラーの箱: いまは塗りに内側の赤い線（軸 50 の A）。比べたときは塗りだけ
//   候補が値を明示している行（軸 40 の箱、軸 47 の行の中の OFF など）は、候補の値がこれより優先する
//   display: contents にして、包む箱が並びに入らないようにする（変数は中へ受け継がれる）
const toggleColorAsCompared: CSSProperties & Record<`--${string}`, string> = {
  display: 'contents',
  '--color-switch-off': 'var(--color-neutral)',
  '--color-switch-row-off': 'var(--color-neutral)',
  '--color-switch-off-disabled': 'var(--color-neutral-disabled)',
  '--color-switch-neutral-on-disabled': 'var(--color-neutral-disabled)',
  '--color-choice': 'var(--color-field)',
  '--color-choice-hover': 'var(--color-field-hover)',
  '--color-choice-invalid': 'var(--color-field-invalid)',
  '--color-choice-disabled': 'var(--color-field-disabled)',
  '--color-choice-neutral-on-disabled': 'var(--color-neutral-disabled)',
  '--color-switch-off-disabled-knob': 'var(--color-surface)',
  '--choice-invalid-line-width': '0px',
};

/** トグルの OFF とチェックボックス・ラジオの選んでいない箱を、比べたときの色（OFF #EFF0F1・箱 #F2F4F4）に戻す */
export const keepToggleColorAsCompared = (Story: () => ReactNode) => (
  <div style={toggleColorAsCompared}>
    <Story />
  </div>
);

// フォーカスの色（軸 41 の M を既定にするより前に比べたもの）
//   いまは、入力欄の枠線とキーボードの線が部品の色（色なしの部品と TextField は濃紺）。エラーの欄にフォーカスすると、赤い枠線の外に白と離した線
//   比べたときは、部品によらず青の1色で、エラーの欄は赤い枠線だけ
//   --color-focus-ring と淡い面のお知らせの線は :root で解決した値を受け継ぐので、ここで指し直す
//   .storybook/preview.tsx が、Design Review の 01〜focusComparedThrough に付ける。候補の行が値を明示していれば、行の値が優先する
const focusAsCompared: CSSProperties & Record<`--${string}`, string> = {
  display: 'contents',
  '--color-focus': 'var(--color-primary)',
  '--color-focus-ring': 'var(--color-focus)',
  '--color-notice-info-ring': 'var(--color-focus)',
  '--color-notice-success-ring': 'var(--color-focus)',
  '--color-notice-warning-ring': 'var(--color-focus)',
  '--color-notice-danger-ring': 'var(--color-focus)',
  '--focus-follow-color': 'initial',
  '--field-invalid-focus-ring': 'initial',
  '--field-invalid-focus-ring-inner-width': 'initial',
  '--color-focus-ring-inner': 'transparent',
};

/** フォーカスの色を、比べたときの見た目（部品によらず青の1色、エラーの欄は赤い枠線だけ）に戻す */
export const keepFocusAsCompared = (Story: () => ReactNode) => (
  <div style={focusAsCompared}>
    <Story />
  </div>
);

/** フォーカスの色を比べたときの形に戻す、最後の軸の番号（軸 41 の決定より前に作った比較） */
export const focusComparedThrough = 50;

// トグルのキャプションの置き方（軸 48 より前に比べたもの）
//   いまはトラックとラベルを部品の高さの1行に固定し、キャプションはその下（軸 48 の A）。囲みがあるとき、トラックは行の縦の中央
//   比べたときは1行に固定せず、ラベルとキャプションのまとまりを部品の高さの中央に置いていた（キャプションがあると、ラベルとトラックが上に寄る）
//   囲みがあるときのトラックは、いまと同じく行の縦の中央（格子の中央にそろえる）
const switchCaptionAsCompared: CSSProperties & Record<`--${string}`, string> = {
  '--switch-line': '0',
  '--switch-track-align': 'center',
  '--switch-label-align': 'center',
  '--switch-caption-column': 'label',
  '--switch-caption-row': '2',
  '--switch-caption-gap': '0px',
  '--switch-caption-hug': '0',
  '--color-switch-caption-surface': 'transparent',
  '--switch-caption-pad-x': '0px',
  '--switch-caption-pad-y': '0px',
  '--switch-caption-radius': '0px',
  '--switch-row-track-rows': '1 / -1',
  '--switch-row-track-align': 'center',
};

/** トグルのキャプションの置き方を、軸 48 より前に比べたときの形（1行に固定しない）に戻す */
export const keepSwitchCaptionAsCompared = (Story: () => ReactNode) => (
  <div style={switchCaptionAsCompared}>
    <Story />
  </div>
);

// トグル（軸 29 より前に比べたもの）。キャプションの置き方は上と同じく軸 48 より前の形
//   押せないときのラベル: いまはほかの押せない文字と同じグレー（--color-switch-label-disabled）。比べたときは本文の色
//   トラックの縦の位置: いまはラベルの行の中央（--switch-track-rows: 1 / 2）。比べたときはラベルとキャプションのまとまりの中央
//   トラックの左右は、各ストーリーで togglePlacement="end" を付けて戻している
const switchAsCompared: CSSProperties & Record<`--${string}`, string> = {
  ...switchCaptionAsCompared,
  '--color-switch-label-disabled': 'var(--color-fg)',
  '--switch-track-rows': '1 / -1',
};

/** トグルを、比べたときの見た目（押せないラベルは本文の色、トラックはまとまりの中央）に戻す */
export const keepSwitchAsCompared = (Story: () => ReactNode) => (
  <div style={switchAsCompared}>
    <Story />
  </div>
);

// お知らせの ×（軸 30 より前に比べたもの）
//   いまは部品の高さの角丸の四角。比べたときは行の高さ＋8px の丸
const noticeCloseAsCompared: CSSProperties & Record<`--${string}`, string> = {
  '--notice-close-to-control': '0',
  '--notice-close-radius': 'var(--radius-pill)',
};

/** お知らせの × を、比べたときの見た目（行の高さ＋8px の丸）に戻す */
export const keepNoticeCloseAsCompared = (Story: () => ReactNode) => (
  <div style={noticeCloseAsCompared}>
    <Story />
  </div>
);
