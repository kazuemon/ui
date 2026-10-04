'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ReactNode } from 'react';

import { CaretDownIcon, CheckMarkIcon, XIcon } from '../icons';
import type { NormalizedListboxGroup } from '../listbox/listbox-items';
import {
  type GroupLabelStyle,
  listboxEmptyClass,
  listboxGroupLabel,
  listboxSeparatorClass,
} from '../listbox/listbox-styles';
import type { ListboxItem, ListboxValue } from '../listbox/use-listbox-option';
import { sheetCloseButton } from '../sheet/sheet-styles';
import { comboboxEmptyClass } from './combobox-popup-styles';

// 打って選ぶ入力欄（Combobox・Autocomplete・TagsInput）の、浮かぶ選択肢の中の部品 — ADR-0214・0221

/**
 * シートの見出しの閉じるボタンのアイコン
 * check は ✓（選び終えた）、x は ×、chevron は下向きの矢印（下げる）、null はアイコンなし
 */
export type ComboboxSheetCloseIcon = 'check' | 'x' | 'chevron' | null;

const CLOSE_ICONS = { check: CheckMarkIcon, chevron: CaretDownIcon, x: XIcon };

/**
 * シートの見出しの閉じるボタン。選んだ内容は選んだ時点で反映されているので、閉じるだけ（キーボードでは Esc でも閉じる）
 * 欄の中の消去 ×（値を消す）と見分けるため、アイコンと文字の組み合わせを選べる
 */
export function ComboboxSheetClose({
  icon,
  text,
  onClose,
}: {
  icon: ComboboxSheetCloseIcon;
  /** そのまま見える文字。読み上げの名前にもなる。null はアイコンだけ */
  text: string | null;
  onClose: () => void;
}) {
  // どちらも出さない指定のときは、× だけを出す（閉じる手段がなくならないように）
  const kind = icon === null && text === null ? 'x' : icon;
  const Icon = kind === null ? null : CLOSE_ICONS[kind];
  const hasText = text !== null;
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={hasText ? undefined : '閉じる'}
      onClick={onClose}
      className={sheetCloseButton({ withText: hasText })}
    >
      {Icon && <Icon standalone />}
      {hasText && text}
    </button>
  );
}

/**
 * 当たる選択肢がないときの行（Base UI の Empty）
 * 読み上げにも知らせる箱なので、文がなくても要素は残す
 */
export function ComboboxEmpty({ children }: { children?: ReactNode }) {
  return (
    <BaseCombobox.Empty className={comboboxEmptyClass}>
      {children ? <div className={listboxEmptyClass}>{children}</div> : null}
    </BaseCombobox.Empty>
  );
}

/**
 * 選択肢のまとまり（design/adr/0214）。見出しと、その中の選択肢を並べる
 * 2 つ目以降のまとまりの前に、区切り線を引ける
 */
export function ComboboxGroupSection<Value extends ListboxValue>({
  group,
  separator,
  labelStyle,
  children,
}: {
  group: NormalizedListboxGroup<Value>;
  /** 前のまとまりとのあいだに区切り線を引くか（先頭のまとまりでは false を渡す） */
  separator: boolean;
  labelStyle: GroupLabelStyle;
  children: (item: ListboxItem<Value>) => ReactNode;
}) {
  return (
    <BaseCombobox.Group items={group.items} className="block">
      {separator && <BaseCombobox.Separator className={listboxSeparatorClass} />}
      <BaseCombobox.GroupLabel className={listboxGroupLabel({ style: labelStyle })}>
        {group.label}
      </BaseCombobox.GroupLabel>
      <BaseCombobox.Collection>{children}</BaseCombobox.Collection>
    </BaseCombobox.Group>
  );
}
