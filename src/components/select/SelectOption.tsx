'use client';

import { Select as BaseSelect } from '@base-ui/react/select';

import { CheckIcon } from '../../internal/icons';
import { ListboxOptionContent } from '../../internal/listbox/ListboxOption';
import {
  type ListboxItem,
  type ListboxItemNote,
  type ListboxItemNoteKind,
  useListboxOption,
} from '../../internal/listbox/use-listbox-option';

/**
 * 選択肢に付く文の種類（design/adr/0044）
 * reason: 選べない理由。キャプションと同じ灰色の文字だけ（アイコンなし）。disabled の選択肢に付ける
 * warning: 選べるが、選ぶ前に知っておくこと。本体の下の警告の行と同じ三角とオリーブ色の文字
 */
export type SelectItemNoteKind = ListboxItemNoteKind;

/** 選択肢に付く文（ラベルの下の2行目）。文は呼び出し側が渡す。部品は文を組み立てない */
export type SelectItemNote = ListboxItemNote;

/** Select の選択肢。label・value に、disabled（選べない）と note（ラベルの下の2行目）を付けられる */
export type SelectItem = ListboxItem;

// 選択肢の1項目。見た目は選択肢の一覧で共有する（src/internal/listbox）
export function SelectOption({ item }: { item: SelectItem }) {
  const { itemProps, labelProps, indicatorProps, noteId } = useListboxOption(item);
  return (
    <BaseSelect.Item value={item.value} disabled={item.disabled} {...itemProps}>
      <ListboxOptionContent
        note={item.note}
        noteId={noteId}
        indicator={
          <BaseSelect.ItemIndicator {...indicatorProps}>
            <CheckIcon />
          </BaseSelect.ItemIndicator>
        }
      >
        <BaseSelect.ItemText {...labelProps}>{item.label}</BaseSelect.ItemText>
      </ListboxOptionContent>
    </BaseSelect.Item>
  );
}
