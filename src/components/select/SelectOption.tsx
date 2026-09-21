'use client';

import { Select as BaseSelect } from '@base-ui/react/select';

import { CheckIcon } from '../../internal/icons';
import { ListboxOptionContent } from '../../internal/listbox/ListboxOption';
import { type ListboxItem, useListboxOption } from '../../internal/listbox/use-listbox-option';

// 選択肢の1項目。見た目は選択肢の一覧で共有する（src/internal/listbox）
export function SelectOption({ item }: { item: ListboxItem }) {
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
