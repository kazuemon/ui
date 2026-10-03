'use client';

import { Select as BaseSelect } from '@base-ui/react/select';

import { CheckIcon } from '../../internal/icons';
import type { NormalizedListboxGroup } from '../../internal/listbox/listbox-items';
import {
  type GroupLabelStyle,
  listboxGroupLabel,
  listboxSeparatorClass,
} from '../../internal/listbox/listbox-styles';
import { ListboxOptionContent } from '../../internal/listbox/ListboxOption';
import {
  type ListboxItem,
  type ListboxValue,
  useListboxOption,
} from '../../internal/listbox/use-listbox-option';

// 選択肢の1項目。見た目は選択肢の一覧で共有する（src/internal/listbox）
export function SelectOption<Value extends ListboxValue>({ item }: { item: ListboxItem<Value> }) {
  const { itemProps, labelProps, indicatorProps, iconClassName, noteId } = useListboxOption(item);
  return (
    <BaseSelect.Item value={item.value} disabled={item.disabled} {...itemProps}>
      <ListboxOptionContent
        note={item.note}
        noteId={noteId}
        icon={item.icon}
        iconClassName={iconClassName}
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

/**
 * 選択肢のまとまり（Combobox と同じ見た目 — design/adr/0214）。見出しと、その中の選択肢を並べる
 * 2 つ目以降のまとまりの前に、区切り線を引ける
 */
export function SelectGroupSection<Value extends ListboxValue>({
  group,
  separator,
  labelStyle,
}: {
  group: NormalizedListboxGroup<Value>;
  /** 前のまとまりとのあいだに区切り線を引くか（先頭のまとまりでは false を渡す） */
  separator: boolean;
  labelStyle: GroupLabelStyle;
}) {
  return (
    <BaseSelect.Group className="block">
      {separator && <BaseSelect.Separator className={listboxSeparatorClass} />}
      <BaseSelect.GroupLabel className={listboxGroupLabel({ style: labelStyle })}>
        {group.label}
      </BaseSelect.GroupLabel>
      {group.items.map((item) => (
        <SelectOption key={item.value} item={item} />
      ))}
    </BaseSelect.Group>
  );
}
