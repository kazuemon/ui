import type { ReactNode } from 'react';

// 見本のページ 1 つ分の形。Storybook の Controls にあたる切り替えを、ページの右下のボタンから開く

/** 密度。auto は入力方式に合わせる（既定）、coarse は指、fine はマウスに固定する */
export type Density = 'auto' | 'coarse' | 'fine';

/** いまの環境。auto の選択肢が、どちらに倒れているかを出すのに使う（描くまでは分からないので undefined） */
export interface Environment {
  /** 指で操作しているか（pointer: coarse） */
  coarse?: boolean;
  /** 重なる面が、いまシートになるか（指で操作していて画面が狭い） */
  sheet?: boolean;
  /** いまの向きで、シートに切り替わる画面の幅（px） */
  sheetWidth?: number;
  /** 画面が、その幅より狭いか */
  narrow?: boolean;
}

/** 「いまは○○（指・768px 未満）」の、かっこの中。判定の理由を短く書く */
export function environmentNote({ coarse, sheetWidth, narrow }: Environment) {
  if (coarse === undefined) return '';
  return coarse ? `指・${sheetWidth}px ${narrow ? '未満' : '以上'}` : 'マウス';
}

export interface ControlOption {
  value: string;
  label: string;
  /** 選択肢の下に置く説明。関数を渡すと、いまの環境から作る */
  caption?: string | ((environment: Environment) => string | undefined);
}

/** 切り替えられる props 1 つ分。caption は、切り替えが効く場面を補うとき（選ぶものと入り切りだけ） */
export type ControlDef =
  | {
      name: string;
      label: string;
      caption?: string;
      type: 'radio' | 'select';
      options: ControlOption[];
    }
  | { name: string; label: string; caption?: string; type: 'switch' };

export type ExampleArgs = Record<string, string | boolean>;

/**
 * 押すと、その状態になる値をまとめて当てるもの。
 * 見た目の props（controls）と分ける: こちらは「読み込み中」「サーバーが失敗する」のような、画面の状態
 */
export interface Preset {
  label: string;
  /** 当てる値。ここにないものは、いまの値のまま */
  args: ExampleArgs;
}

export interface Example {
  /** /examples/<slug> の名前 */
  slug: string;
  /** 一覧とページの題 */
  title: string;
  /** 一覧に出す 1 行の説明 */
  description: string;
  /** 切替画面に並べる、見た目の props。空なら密度だけを出す */
  controls: ControlDef[];
  /** 切替画面の上に並べる、状態を再現するボタン */
  presets?: Preset[];
  /**
   * 開いたときの状態を表す言葉。状態のボタンの中に、この文言で「その状態に戻す」ボタンを置く
   * @default 'はじめの表示'
   */
  initialLabel?: string;
  /** 切替の初めの値 */
  defaults: ExampleArgs;
  /** 画面。SamplePage で包むところまでを持つ */
  Screen: (props: { args: ExampleArgs; density: Density }) => ReactNode;
}
