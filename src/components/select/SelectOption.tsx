import { Select as BaseSelect } from '@base-ui/react/select';
import { type ReactNode, useId } from 'react';

import { fieldStyles } from '../../internal/field/field-styles';
import { CheckIcon, WarningIcon } from '../icons/icons';

/**
 * 選択肢に付く文の種類（design/adr/0044）
 * reason: 選べない理由。キャプションと同じ灰色の文字だけ（アイコンなし）。disabled の選択肢に付ける
 * warning: 選べるが、選ぶ前に知っておくこと。本体の下の警告の行と同じ三角とオリーブ色の文字
 */
export type SelectItemNoteKind = 'reason' | 'warning';

/** 選択肢に付く文（ラベルの下の2行目）。文は呼び出し側が渡す。部品は文を組み立てない */
export interface SelectItemNote {
  kind: SelectItemNoteKind;
  text: ReactNode;
}

export interface SelectItem {
  label: string;
  value: string;
  /**
   * 選べない（design/adr/0044）。ラベルを押せない文字の色にし、押しても選ばれない
   * 矢印キーでは止まり、選べないこと（disabled）と note が読まれる。文字を打って探すときは飛ばす（Base UI のまま）
   */
  disabled?: boolean;
  /**
   * ラベルの下の2行目（design/adr/0044）。読み上げの名前はラベルだけで、この文は説明になる
   * 2行目のある選択肢だけ高くなる（指用 52px・マウス用 48px）
   */
  note?: SelectItemNote;
}

const styles = fieldStyles();

// 選択肢の2行目（design/adr/0044）。文の大きさと行の高さはキャプションと同じ
//   reason: 選べない理由。キャプションと同じ灰色（--color-fg-subtle）の文字だけ
//   warning: 本体の下の警告の行と同じ形（三角＋ --color-fg-warning）。選んだ項目の青い文字の中でも、警告の色のまま
function SelectItemNoteLine({ note, id }: { note: SelectItemNote; id: string }) {
  if (note.kind === 'reason')
    return (
      <span
        id={id}
        data-slot="select-item-note"
        data-kind="reason"
        className="text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle"
      >
        {note.text}
      </span>
    );
  return (
    <span
      id={id}
      data-slot="select-item-note"
      data-kind="warning"
      className={styles.message({ className: 'text-fg-warning' })}
    >
      <WarningIcon className={styles.messageIcon()} />
      <span className="min-w-0">{note.text}</span>
    </span>
  );
}

// 選択肢の1項目。見た目は design/tokens.css の --select-popup-*・--color-select-* で決める（design/adr/0036）
// note のある項目だけ、ラベルの下に2行目を出して高さを伸ばす（上下 6px。1行の項目は --spacing-control のまま）
//   読み上げの名前はラベルだけ（aria-labelledby）、2行目は説明（aria-describedby）
// 選べない項目（disabled — design/adr/0044）: ラベルは押せない文字の色。押しても選ばれない
//   マウスの hover では塗らない（押せないため）。矢印キーでは止まるので、キーボードで止まったとき（focus-visible）だけ、
//   ほかの項目と同じ hover の塗りで、いまの場所を見せる
export function SelectOption({ item }: { item: SelectItem }) {
  const id = useId();
  const { note } = item;
  const labelId = `${id}label`;
  const noteId = `${id}note`;
  return (
    <BaseSelect.Item
      value={item.value}
      disabled={item.disabled}
      aria-labelledby={note ? labelId : undefined}
      aria-describedby={note ? noteId : undefined}
      className={[
        'group/option flex min-h-(--spacing-control) cursor-pointer items-center gap-(--spacing-control-x) rounded-[calc(var(--radius-control)-var(--select-popup-padding))] px-[calc(var(--spacing-control-x)-var(--select-popup-padding))] outline-none select-none',
        note && 'py-1.5',
        // hover（キーボードで選んでいるときも同じ）は、選んだ項目の見た目より優先する
        'data-highlighted:bg-field',
        'data-selected:text-(color:--color-on-select-item-selected) data-selected:not-data-highlighted:bg-(color:--color-select-item-selected)',
        // 選んだ項目の hover（開いた直後は、選んだ項目が hover と同じ状態になる）
        'data-selected:data-highlighted:bg-(color:--color-select-item-selected-highlight)',
        // 選べない項目: hover の塗りを消し、キーボードで止まったとき（focus-visible）だけ付け直す
        // :not(:focus-visible) の形は使わない（Storybook の pseudo-states アドオンが書き換え、いつも塗りが消えていた）
        'data-disabled:cursor-not-allowed data-disabled:text-(color:--color-on-field-disabled) data-disabled:data-highlighted:bg-transparent',
        'data-disabled:data-highlighted:focus-visible:bg-field',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 選んだ項目のラベルの太さ（--select-item-selected-weight）。2行目（note）は変えない */}
        <BaseSelect.ItemText
          id={note ? labelId : undefined}
          className="group-data-selected/option:[font-weight:var(--select-item-selected-weight)]"
        >
          {item.label}
        </BaseSelect.ItemText>
        {note && <SelectItemNoteLine note={note} id={noteId} />}
      </div>
      <BaseSelect.ItemIndicator className="flex text-(color:--color-select-check)">
        <CheckIcon />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}
