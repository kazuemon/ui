'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { MouseEventHandler } from 'react';

import { CheckIcon } from '../icons';
import { ListboxOptionContent } from './ListboxOption';
import { type ListboxItem, type ListboxValue, useListboxOption } from './use-listbox-option';

// 打って選ぶ部品（Combobox・Autocomplete・TagsInput）の選択肢 1 項目
//   行は Base UI の Combobox の Item（Autocomplete の Item は同じ部品）
//   ラベルは素の span（Base UI の Combobox には Select のような ItemText がない）
//   見た目は選択肢の一覧で共有する（src/internal/listbox）

interface ComboboxOptionProps<Value extends ListboxValue> {
  item: ListboxItem<Value>;
  /** Base UI に渡す値。書かないときは item.value（Autocomplete は候補そのものを渡す） */
  value?: unknown;
  /**
   * 選んだ印（チェック）を出すか。選んだ状態を持たない Autocomplete では出さない
   * @default true
   */
  indicator?: boolean;
  /** 押した・Enter で選んだとき。どの候補かを部品に伝える */
  onPress?: (item: ListboxItem<Value>) => void;
}

export function ComboboxOption<Value extends ListboxValue>({
  item,
  value,
  indicator = true,
  onPress,
}: ComboboxOptionProps<Value>) {
  const { itemProps, labelProps, indicatorProps, iconClassName, noteId } = useListboxOption(item);
  const handleClick: MouseEventHandler | undefined = onPress ? () => onPress(item) : undefined;
  return (
    <BaseCombobox.Item
      value={value === undefined ? item.value : value}
      disabled={item.disabled}
      onClick={handleClick}
      {...itemProps}
    >
      <ListboxOptionContent
        note={item.note}
        noteId={noteId}
        icon={item.icon}
        iconClassName={iconClassName}
        indicator={
          indicator ? (
            <BaseCombobox.ItemIndicator {...indicatorProps}>
              <CheckIcon />
            </BaseCombobox.ItemIndicator>
          ) : undefined
        }
      >
        <span {...labelProps}>{item.label}</span>
      </ListboxOptionContent>
    </BaseCombobox.Item>
  );
}
