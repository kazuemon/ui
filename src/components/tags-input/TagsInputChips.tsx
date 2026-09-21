'use client';

import type { CSSProperties, ReactNode } from 'react';

import { ComboboxChips } from '../../internal/combobox-base/ComboboxChips';
import type { ListboxColor } from '../../internal/listbox/listbox-colors';
import { ScrollFrame } from '../../internal/ScrollFrame';

// 欄の中に並ぶタグのチップ。並びと大きさは複数選ぶ Combobox と同じで、箱も同じ部品（ComboboxChips）を使う
// TagsInput だけが持つのは、Backspace で選んだチップの見え方（ADR-0233）と、弾いたことの合図（ADR-0232）
//   選んだチップ: Base UI が DOM のフォーカスを当てるので、:focus で見せる
//   弾いた合図: 同じ文字のタグを足そうとしたとき、すでにあるチップを一瞬だけ強調する
//
// タグが増えたときの伸び方（ADR-0231）は、チップを ScrollArea（軸 93）の枠に入れて決める
//   行数を決めたとき（maxRows）は、続きがあることを端の内側の影で見せ、つまみは載せたときとスクロール中に出す
//   既定（折り返して伸びる）では、枠に上限がないのでスクロールは起きず、影もつまみも出ない
//   打つ欄とチップは同じ流れの中に置いたままなので、打っているカーソルの位置へはブラウザが枠を送る

/** 欄の中のチップ。Combobox のチップに、選んだときと弾いたときの見た目を足す */
const chipClass = [
  // 1 行のまま横に流すとき（maxRows={1}）は、チップを縮めずに枠からはみ出させる
  '[flex-shrink:var(--tags-input-chip-shrink)]',
  // 選んだチップ（Backspace の1回目・← で移ったとき）— ADR-0233
  //   線の引き方・色の決め方・動く長さは、枠線（outline）のボタンのフォーカスと同じ（design/adr/0031・ADR-0071 の M）
  //   部品が自分の色を置いていれば（color="primary" など）その色に従い、置いていなければ --color-focus-ring
  //   チップは Tab では止まらず、Backspace や ← で移ったときだけ選ばれるので、focus-visible ではなく focus で出す
  '[outline-offset:var(--focus-ring-offset)] [outline-color:transparent]',
  '[--focus-ring-own:color-mix(in_srgb,var(--color-own-focus)_calc(var(--focus-follow-color)*100%),var(--color-focus-ring))]',
  'focus:[outline-style:solid] focus:[outline-width:var(--focus-ring-width)]',
  'focus:[outline-color:var(--focus-ring-own,var(--color-focus-ring))]',
  '[transition:outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
  'motion-reduce:[transition:none]',
  // 弾いた合図（重複）— ADR-0232
  'data-flash:[animation:tags-input-flash_var(--tags-input-flash-duration)_var(--ease-press)]',
  'motion-reduce:[animation:none]',
].join(' ');

interface TagsInputChipsProps {
  /** 値からラベルを引く表。候補から選んだタグは、候補のラベルで出す */
  labelOf: Map<string, string>;
  /** チップのまとまりの読み上げの名前 */
  chipsName: string;
  /** チップの × の読み上げの名前を作る関数 */
  chipRemoveName: (label: string) => string;
  /** チップの色（原則6） */
  color: ListboxColor;
  /** 読み取り専用。× を出さない */
  readOnly?: boolean;
  /** 押せない（読み込み・送信中を含む） */
  disabled?: boolean;
  /** 最大幅と高さ（comboboxChipStyle） */
  chipStyle?: CSSProperties;
  /** 一瞬強調するタグ（同じ文字を足そうとしたとき） */
  flashTag?: string;
  /** チップの後ろに置く打つ欄。いまのタグの並びを受け取る（プレースホルダの出し分けに使う） */
  children: (values: string[]) => ReactNode;
}

/** 欄の中のチップと打つ欄（Base UI の Chips）。← でチップへ移れる */
export function TagsInputChips({
  labelOf,
  chipsName,
  chipRemoveName,
  color,
  readOnly,
  disabled,
  chipStyle,
  flashTag,
  children,
}: TagsInputChipsProps) {
  // チップを並べる箱を、はみ出した分をスクロールさせる枠に入れる（枠は ScrollArea と同じ中身）
  const wrap = (chips: ReactNode) => (
    <ScrollFrame
      slot="tags-input-scroll"
      className="[max-height:var(--tags-input-max-height)] min-w-0 flex-1"
      // 枠そのものはキーボードの止まり先にしない（欄の中に、打つ欄とは別の止まり先を作らない）
      // チップへは ← で移れて、移った先はブラウザが見える位置へ送る
      focusable={false}
      viewportClassName="rounded-none"
      // Base UI の既定（min-width: fit-content）は、折り返すときでも中身を最大の幅に広げてしまう。
      // ふだんは枠の幅に収め、1 行で横に流すときだけ max-content にする
      contentStyle={{ minWidth: 'var(--tags-input-content-min-width)' }}
    >
      {chips}
    </ScrollFrame>
  );
  return (
    <ComboboxChips
      labelOf={labelOf}
      chipsName={chipsName}
      chipRemoveName={chipRemoveName}
      color={color}
      readOnly={readOnly}
      disabled={disabled}
      chipStyle={chipStyle}
      className="[flex-wrap:var(--tags-input-wrap)]"
      chipClassName={chipClass}
      chipProps={(item) => ({
        'data-slot': 'tags-input-chip',
        'data-flash': flashTag === item ? '' : undefined,
      })}
      wrap={wrap}
    >
      {children}
    </ComboboxChips>
  );
}
