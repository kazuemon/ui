'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import { type CSSProperties, type ReactNode, useCallback, useState } from 'react';

import { Chip, ChipRemove } from '../chip/Chip';
import {
  comboboxChipClass,
  comboboxChipsClass,
} from '../../internal/combobox-base/combobox-control-styles';
import type { ListboxColor } from '../../internal/listbox/listbox-colors';
import { scrollAreaStyles } from '../../internal/scroll-area-styles';
import { SheetMoreCue } from '../../internal/sheet/SheetMoreCue';
import { useMoreCues } from '../../internal/sheet/use-more-cues';
import { useInlineCues } from '../../internal/use-inline-cues';

// 欄の中に並ぶタグのチップ。並びと大きさは複数選ぶ Combobox と同じ（ADR-0217・0219）
// TagsInput だけが持つのは、Backspace で選んだチップの見え方（軸 262）と、弾いたことの合図（軸 261）
//   選んだチップ: Base UI が DOM のフォーカスを当てるので、:focus で見せる。線と覆いはトークンで差し替える
//   弾いた合図: 同じ文字のタグを足そうとしたとき、すでにあるチップを一瞬だけ強調する
//
// タグが増えたときの伸び方（軸 260）は、チップを ScrollArea（軸 93）の枠に入れて決める
//   はみ出す案では、続きがあることを端の内側の影で見せ、つまみは載せたときとスクロール中に出す（ScrollArea と同じ見た目）
//   折り返す案（現行版）では、枠に上限がないのでスクロールは起きず、影もつまみも出ない
//   切り替えは --tags-input-wrap と --tags-input-max-height の上書きだけ。決まったら、この枠ごと畳める
//   打つ欄とチップは同じ流れの中に置いたままなので、打っているカーソルの位置へはブラウザが枠を送る

/** チップと打つ欄を並べる箱。並びと余白は Combobox と同じで、折り返すかどうかだけを差し替える */
const chipsClass = [comboboxChipsClass, '[flex-wrap:var(--tags-input-wrap)]!'].join(' ');

/** 欄の中のチップ。大きさは Combobox と同じで、選んだときと弾いたときの見た目を足す */
const chipClass = [
  comboboxChipClass,
  // 1 行で横に流す案（軸 260）では、チップを縮めずに枠からはみ出させる
  '[flex-shrink:var(--tags-input-chip-shrink)]',
  // 選んだチップ（Backspace の1回目・← で移ったとき）— 軸 262
  //   線の引き方・色の決め方・動く長さは、枠線（outline）のボタンのフォーカスと同じ（design/adr/0031・ADR-0071 の M）
  //   部品が自分の色を置いていれば（color="primary" など）その色に従い、置いていなければ --color-focus-ring
  //   チップは Tab では止まらず、Backspace や ← で移ったときだけ選ばれるので、focus-visible ではなく focus で出す
  '[outline-offset:var(--focus-ring-offset)] [outline-color:transparent]',
  '[--focus-ring-own:color-mix(in_srgb,var(--color-own-focus)_calc(var(--focus-follow-color)*100%),var(--color-focus-ring))]',
  'focus:[outline-style:solid] focus:[outline-width:var(--tags-input-chip-selected-ring-width)]',
  'focus:[outline-color:var(--focus-ring-own,var(--tags-input-chip-selected-ring-color))]',
  '[transition:outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press),background-color_var(--duration-press)_var(--ease-press)]',
  'motion-reduce:[transition:none]',
  'focus:[background-image:linear-gradient(var(--tags-input-chip-selected-veil),var(--tags-input-chip-selected-veil))]',
  // 弾いた合図（重複）— 軸 261
  'data-flash:[animation:tags-input-flash_var(--tags-input-flash-duration)_var(--ease-press)]',
  'motion-reduce:[animation:none]',
].join(' ');

interface TagsInputChipsProps {
  /** 値からラベルを引く表。候補から選んだタグは、候補のラベルで出す */
  labelOf: Map<string, string>;
  /** チップのまとまりの読み上げの名前 */
  chipsLabel: string;
  /** チップの × の読み上げの名前を作る関数 */
  chipRemoveLabel: (label: string) => string;
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
  chipsLabel,
  chipRemoveLabel,
  color,
  readOnly,
  disabled,
  chipStyle,
  flashTag,
  children,
}: TagsInputChipsProps) {
  const styles = scrollAreaStyles();
  // 続きがあることの影（上下は useMoreCues、左右は useInlineCues が枠に書く）
  const moreCues = useMoreCues();
  const inlineCues = useInlineCues();
  const [, setViewportElement] = useState<HTMLDivElement | null>(null);
  const setViewport = useCallback(
    (element: HTMLDivElement | null) => {
      moreCues(element);
      inlineCues(element);
      setViewportElement(element);
    },
    [moreCues, inlineCues]
  );
  return (
    <BaseCombobox.Value>
      {(values: string[]) => (
        <BaseScrollArea.Root
          data-slot="tags-input-scroll"
          className={styles.root({
            className: 'min-w-0 flex-1 [max-height:var(--tags-input-max-height)]',
          })}
        >
          {/* 枠そのものはキーボードの止まり先にしない（欄の中に、打つ欄とは別の止まり先を作らない）
              チップへは ← で移れて、移った先はブラウザが見える位置へ送る */}
          <BaseScrollArea.Viewport
            ref={setViewport}
            tabIndex={-1}
            data-slot="scroll-area-viewport"
            className={styles.viewport({ className: 'rounded-none' })}
          >
            {/* Base UI の既定（min-width: fit-content）は、折り返す案でも中身を最大の幅に広げてしまう。
                ふだんは枠の幅に収め、1 行で横に流す案だけ max-content にする（軸 260 のトークン） */}
            <BaseScrollArea.Content style={{ minWidth: 'var(--tags-input-content-min-width)' }}>
              <BaseCombobox.Chips
                aria-label={values.length > 0 ? chipsLabel : undefined}
                className={chipsClass}
              >
                {values.map((item) => {
                  const text = labelOf.get(item) ?? item;
                  return (
                    <BaseCombobox.Chip
                      key={item}
                      data-slot="tags-input-chip"
                      data-flash={flashTag === item ? '' : undefined}
                      render={
                        <Chip
                          color={color}
                          readOnly={readOnly}
                          disabled={disabled}
                          style={chipStyle}
                          className={chipClass}
                        />
                      }
                    >
                      <span className="min-w-0 truncate">{text}</span>
                      {!readOnly && (
                        <BaseCombobox.ChipRemove
                          render={<ChipRemove aria-label={chipRemoveLabel(text)} />}
                          disabled={disabled || undefined}
                        />
                      )}
                    </BaseCombobox.Chip>
                  );
                })}
                {children(values)}
              </BaseCombobox.Chips>
            </BaseScrollArea.Content>
          </BaseScrollArea.Viewport>
          {/* 続きがある端の内側の影（ScrollArea・シートと同じ描き方）。スクロールしないあいだは濃さが 0 */}
          <div className={styles.edges()}>
            <div className="absolute inset-x-0 top-0">
              <SheetMoreCue edge="top" sheet={false} sheetMoreCue="shadow" />
            </div>
            <div className="absolute inset-x-0 bottom-0">
              <SheetMoreCue edge="bottom" sheet={false} sheetMoreCue="shadow" />
            </div>
            <div
              aria-hidden
              className={styles.edgeX({ className: 'left-0 bg-linear-to-r' })}
              style={{ opacity: 'var(--cue-x-start)' }}
            />
            <div
              aria-hidden
              className={styles.edgeX({ className: 'right-(--cue-right) bg-linear-to-l' })}
              style={{ opacity: 'var(--cue-x-end)' }}
            />
          </div>
          <BaseScrollArea.Scrollbar orientation="vertical" className={styles.scrollbar()}>
            <BaseScrollArea.Thumb data-slot="scroll-area-thumb" className={styles.thumb()} />
          </BaseScrollArea.Scrollbar>
          <BaseScrollArea.Scrollbar orientation="horizontal" className={styles.scrollbar()}>
            <BaseScrollArea.Thumb data-slot="scroll-area-thumb" className={styles.thumb()} />
          </BaseScrollArea.Scrollbar>
        </BaseScrollArea.Root>
      )}
    </BaseCombobox.Value>
  );
}
