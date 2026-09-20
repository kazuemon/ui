'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';

import { CheckIcon } from '../../internal/icons';
import { ListboxOptionContent } from '../../internal/listbox/ListboxOption';
import { useListboxOption } from '../../internal/listbox/use-listbox-option';
import type { ComboboxItem } from './combobox-items';

// 選択肢の1項目。見た目は選択肢の一覧で共有する（src/internal/listbox）
// Select と違い、ラベルは素の span（Base UI の Combobox には ItemText がない）
export function ComboboxOption({ item }: { item: ComboboxItem }) {
  const { itemProps, labelProps, indicatorProps, noteId } = useListboxOption(item);
  return (
    <BaseCombobox.Item value={item.value} disabled={item.disabled} {...itemProps}>
      <ListboxOptionContent
        note={item.note}
        noteId={noteId}
        indicator={
          <BaseCombobox.ItemIndicator {...indicatorProps}>
            <CheckIcon />
          </BaseCombobox.ItemIndicator>
        }
      >
        <span {...labelProps}>{item.label}</span>
      </ListboxOptionContent>
    </BaseCombobox.Item>
  );
}
