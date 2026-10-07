'use client';

import { createContext, type ReactElement, use } from 'react';

// Toolbar の中に置いた欄（SelectControl・TextFieldControl）を、ツールバーの矢印キーの並び（ロービングタブインデックス）に入れる口
//   欄の本体は部品の中で組むので、使う側は Base UI の Toolbar.Button・Toolbar.Input の render を書けない。
//   そこで Toolbar がこの口を配り、欄は自分の本体を渡して包んでもらう
//   Base UI の Toolbar を欄の側で import しないよう、包む要素は Toolbar の側で作る（Toolbar を使わない利用者の配布物を太らせない）
export interface ToolbarSlots {
  /** 帯（Toolbar）かまとまり（ToolbarGroup）ごと押せないか。Field が読み、中の欄を押せなくする */
  disabled: boolean;
  /** 押して開く本体（Select の Trigger）を、ツールバーの項目として包む。押せない本体は矢印キーで飛ばす */
  button: (element: ReactElement, disabled: boolean) => ReactElement;
  /** 文字を打つ欄の input を描く要素（Base UI の Toolbar.Input）。Field.Control の render に渡す */
  input: (disabled: boolean) => ReactElement;
}

export const ToolbarSlotContext = createContext<ToolbarSlots | null>(null);

/** Toolbar の中なら、項目として包む口を返す。外なら null */
export function useToolbarSlots() {
  return use(ToolbarSlotContext);
}
