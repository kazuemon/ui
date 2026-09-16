import type { CSSProperties } from 'react';

/** 選んだ項目の印の色。primary・secondary は利用者が選ぶ色、neutral は色を持たない（グレー）— 原則6、design/adr/0047 */
export type SelectColor = 'primary' | 'secondary' | 'neutral';

// 選んだ項目の印の色（design/adr/0047）。face は淡い面、ink は文字とチェック
// neutral の面は、hover のグレー（入力欄の塗り）と見分けられる濃さのグレー（--color-select-neutral-selected）
// focus は、フォーカスの枠線と線を部品の色に従わせるとき（--focus-follow-color: 1 — 後半の軸 41）の色。線なので、ピンクは前景用
//   neutral は持たない（--color-focus のまま）。本体には OWN_FOCUS のクラスで、浮かぶ部分（シートの × など）には style で置く
const TONES: Record<SelectColor, { face: string; ink: string; focus?: string }> = {
  primary: {
    face: 'var(--color-primary-subtle)',
    ink: 'var(--color-on-primary-subtle)',
    focus: 'var(--color-primary)',
  },
  secondary: {
    face: 'var(--color-secondary-subtle)',
    ink: 'var(--color-on-secondary-subtle)',
    focus: 'var(--color-fg-secondary)',
  },
  neutral: { face: 'var(--color-select-neutral-selected)', ink: 'var(--color-fg)' },
};

// 本体（Trigger）に置く --color-own-focus。TONES の focus と同じ値（Tailwind が読めるよう、クラスは文字列のまま書く）
export const OWN_FOCUS: Record<SelectColor, string> = {
  primary: '[--color-own-focus:var(--color-primary)]',
  secondary: '[--color-own-focus:var(--color-fg-secondary)]',
  neutral: '',
};

// 選んだ項目の見た目を、部品の色から作る（ADR-0053: 淡い面＋部品の色の文字とチェック）。浮かぶ部分（Popup）に置き、項目のクラスが読む
type TokenStyle = CSSProperties & Record<`--${string}`, string>;

export function selectedTokens(color: SelectColor): TokenStyle {
  const { face, ink, focus } = TONES[color];
  return {
    ...(focus ? { '--color-own-focus': focus } : {}),
    '--color-select-item-selected': face,
    // 選んだ項目の hover。面を一段濃く（文字の色を 8% 混ぜる）
    '--color-select-item-selected-highlight': `color-mix(in oklab, ${face}, ${ink} 8%)`,
    '--color-on-select-item-selected': ink,
    '--color-select-check': ink,
  };
}
