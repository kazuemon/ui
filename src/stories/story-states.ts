import type { ReactNode } from 'react';

// ストーリーで共有する値と、状態を固定する指定。部品を並べる枠は story-parts.tsx

/** 行・列の見出しの文字 */
export const labelClass = 'text-xs font-bold text-fg-subtle';

/**
 * Show code に出すコード（parameters.docs.source）。状態を持つ例や、枠（Matrix など）の中身は
 * Storybook が作るコードに出ないので、写して使える形を手で書く。
 * 部分ごとに前後の空行と共通の字下げを除き、空行をはさんでつなぐ
 */
export function sourceCode(...parts: string[]) {
  return { code: parts.map(dedent).join('\n\n'), language: 'tsx' };
}

function dedent(text: string) {
  const lines = text.replace(/^\n+/, '').trimEnd().split('\n');
  const indent = Math.min(
    ...lines.filter((line) => line.trim()).map((line) => line.length - line.trimStart().length)
  );
  return lines.map((line) => line.slice(indent)).join('\n');
}

/**
 * 状態を固定する列。parameters.pseudo のセレクタが [data-preview="…"] で参照する
 * button-hover・button-focus は、欄の右端のボタン（開く口など）の hover・フォーカス（pickerFieldPseudo）
 */
export type PreviewState = 'hover' | 'active' | 'focus' | 'button-hover' | 'button-focus';

export interface MatrixColumn {
  label: ReactNode;
  /** この列の部品を hover・押下・フォーカスの見た目に固定する（statePseudo と組み合わせる） */
  state?: PreviewState;
}

/** 状態の列に、押せない列を足したもの */
export type StateColumn = MatrixColumn & { disabled?: boolean };

/** 押せる部品（ボタン・リンク）の状態の列 */
export const pressColumns: StateColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: '押下', state: 'active' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
  { label: '押せない', disabled: true },
];

/**
 * 押せる欄の本体。押せない欄（Field の data-disabled の中か、:disabled の本体）を外す。
 * 状態の一覧で、押せない行に hover・フォーカスの見た目を当てないために、hover・focusWithin の的に使う
 */
export const enabledControl = '[data-slot="control"]:not([data-disabled] *, :disabled)';

interface PseudoTargets {
  hover?: string;
  active?: string;
  focusVisible?: string;
  focusWithin?: string;
}

/**
 * storybook-addon-pseudo-states の指定（parameters.pseudo）を作る。値は状態を当てる要素のセレクタ
 * 押下の列には hover も当てる（押すときはポインタが上にあるため）
 */
export function statePseudo({ hover, active, focusVisible, focusWithin }: PseudoTargets) {
  const at = (state: PreviewState, target: string) => `[data-preview="${state}"] ${target}`;
  return {
    // 状態を当てる要素を探し始める場所。既定（#storybook-root）は Vitest のテストには無いので、
    // どちらの環境にもある body から探す（.storybook/visual-testing.md）
    rootSelector: 'body',
    ...(hover && { hover: [at('hover', hover), ...(active ? [at('active', hover)] : [])] }),
    ...(active && { active: [at('active', active)] }),
    ...(focusVisible && { focusVisible: [at('focus', focusVisible)] }),
    ...(focusWithin && { focusWithin: [at('focus', focusWithin)] }),
  };
}

/** 右端にボタンを付けた欄（DatePicker・TimePicker）の状態の列。欄と、右端のボタンの hover・フォーカスを並べる */
export const pickerFieldColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: '欄に hover', state: 'hover' },
  { label: '欄にフォーカス', state: 'focus' },
  { label: 'ボタンに hover', state: 'button-hover' },
  { label: 'ボタンにフォーカス（キーボード）', state: 'button-focus' },
];

/**
 * pickerFieldColumns の状態を当てる指定（parameters.pseudo）。押せない欄（enabledControl で外す）には当てない
 * 欄のフォーカスは、欄の中の区切り（segment の data-segment）に当てる。ボタンに載せたときは欄にも載っているので、欄の hover も当てる
 */
export function pickerFieldPseudo(segment: string) {
  const control = (state: PreviewState) => `[data-preview="${state}"] ${enabledControl}`;
  const button = (state: PreviewState) => `${control(state)} [data-slot="field-addon-button"]`;
  return {
    rootSelector: 'body',
    hover: [control('hover'), control('button-hover'), button('button-hover')],
    focusWithin: [control('focus'), control('button-focus')],
    focus: [`${control('focus')} [data-segment="${segment}"]`],
    focusVisible: [button('button-focus')],
  };
}
