'use client';

import { cloneElement, type ComponentProps, isValidElement, type ReactNode, useId } from 'react';

import { FieldLoadingBar, FieldSpinner, FieldSuccessMark } from './Field';
import { controlBox } from './field-styles';
import { FieldAddon } from '../../components/field-addon/FieldAddon';
import {
  type AddonShape,
  FieldAddonDisabled,
} from '../../components/field-addon/field-addon-context';
import type { LoadingIndicator } from '../../components/loading/Loading';

// 文字はグレーのラベルで包み、要素（FieldAddonButton など）はそのまま置く
// 文字（FieldAddon）は入力欄の説明（aria-describedby）につなぎ、文字そのものは読み上げから外す（aria-hidden — design/adr/0040）
//   Tab キーで入ったときに「https://」などが伝わり、前から順に読んでも1回だけ読まれる
//   ボタンはそれ自体にフォーカスが止まるので、つながない。FieldAddon に aria-hidden を渡したときは、読み上げは呼び出し側に任せ、つながない
function renderAddon(
  node: ReactNode,
  fallbackId: string
): { addon: ReactNode; describedBy?: string } {
  if (node == null || node === false) return { addon: null };
  if (typeof node === 'string' || typeof node === 'number') {
    return {
      addon: (
        <FieldAddon id={fallbackId} aria-hidden>
          {node}
        </FieldAddon>
      ),
      describedBy: fallbackId,
    };
  }
  if (
    isValidElement<ComponentProps<typeof FieldAddon>>(node) &&
    node.type === FieldAddon &&
    node.props['aria-hidden'] == null
  ) {
    const id = node.props.id ?? fallbackId;
    return { addon: cloneElement(node, { id, 'aria-hidden': true }), describedBy: id };
  }
  return { addon: node };
}

// 本体の内側の余白。枠線の内側から数える（input・区切り・印の端）
export const fieldInset = 'px-[calc(var(--spacing-control-x)-var(--field-border-width))]';
const fieldInsetEnd = 'pr-[calc(var(--spacing-control-x)-var(--field-border-width))]';

export interface FieldBoxProps {
  prefix?: ReactNode;
  suffix?: ReactNode;
  addonShape: AddonShape;
  readOnly?: boolean;
  disabled?: boolean;
  loading: boolean;
  loadingIndicator: LoadingIndicator;
  success?: ReactNode;
  successMark: boolean;
  error?: ReactNode;
  /** 呼び出し側から渡された aria-describedby */
  describedBy?: string;
  /** Field から受け取った、キャプションと本体の下の行の id */
  messageIds?: string;
  /** prefix・suffix の文字を押したときにフォーカスを移す先。既定は本体の中の最初の input */
  focusTarget?: (box: HTMLDivElement) => HTMLElement | null | undefined;
  className?: string;
  /** 入力欄。説明（aria-describedby）に渡す id を受け取る */
  children: (describedBy: string | undefined) => ReactNode;
}

/**
 * 文字を打つ欄の本体（controlBox）。prefix・suffix・待っているあいだの印・成功の印を並べる
 * TextField・NumberField・DateField などで共有する
 */
export function FieldBox({
  prefix,
  suffix,
  addonShape,
  readOnly,
  disabled,
  loading,
  loadingIndicator,
  success,
  successMark,
  error,
  describedBy,
  messageIds,
  focusTarget = (box) => box.querySelector('input'),
  className,
  children,
}: FieldBoxProps) {
  const id = useId();
  const before = renderAddon(prefix, `${id}prefix`);
  const after = renderAddon(suffix, `${id}suffix`);
  // 説明は prefix → suffix → 渡された説明 → キャプション → エラー → 警告 → 成功 → 情報の順（design/adr/0040・0041）
  // キャプションと本体の下の行の id は Field から見た目の順で受け取る（Base UI も後ろに足すが、重なった id は1回だけ）
  const describe =
    [before.describedBy, after.describedBy, describedBy, messageIds].filter(Boolean).join(' ') ||
    undefined;
  return (
    /* 余白は input 側に持たせ、欄のどこを押しても入力できるようにする（prefix・suffix の文字を押しても入力できる）
       待っているあいだの印（design/adr/0042）は input と suffix のあいだに置く。回る円は右端（suffix の前）、
       線は本体の下端（本体を位置の基準にする）。prefix・suffix が最初と最後の子のままになるよう、間に置く
       成功のチェック（軸 37）も、回る円と同じ場所に置く。待っているあいだは回る円を優先する */
    <div
      data-slot="control"
      data-addon-shape={addonShape}
      data-field-readonly={readOnly || undefined}
      className={controlBox({ className: ['gap-0 px-0', loading && 'relative', className] })}
      onMouseDown={(event) => {
        if (event.target instanceof Element && event.target.closest('[data-slot="field-addon"]')) {
          event.preventDefault();
          focusTarget(event.currentTarget)?.focus();
        }
      }}
    >
      <FieldAddonDisabled value={!!disabled}>
        {before.addon}
        {children(describe)}
        {loading && loadingIndicator === 'spinner' && <FieldSpinner className={fieldInsetEnd} />}
        {loading && loadingIndicator === 'bar' && <FieldLoadingBar />}
        {success && successMark && !error && !loading && (
          <FieldSuccessMark className={fieldInsetEnd} />
        )}
        {after.addon}
      </FieldAddonDisabled>
    </div>
  );
}
