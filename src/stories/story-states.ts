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

/** 状態を固定する列。parameters.pseudo のセレクタが [data-preview="…"] で参照する */
export type PreviewState = 'hover' | 'active' | 'focus';

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
    ...(hover && { hover: [at('hover', hover), ...(active ? [at('active', hover)] : [])] }),
    ...(active && { active: [at('active', active)] }),
    ...(focusVisible && { focusVisible: [at('focus', focusVisible)] }),
    ...(focusWithin && { focusWithin: [at('focus', focusWithin)] }),
  };
}
