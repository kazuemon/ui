'use client';

import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete';
import type { MouseEventHandler } from 'react';

import { ListboxOptionContent } from '../../internal/listbox/ListboxOption';
import { useListboxOption } from '../../internal/listbox/use-listbox-option';
import type { AutocompleteItem } from './autocomplete-items';

// 候補の1項目。見た目は選択肢の一覧で共有する（src/internal/listbox）
// 選んだ状態を持たないので、選んだ印（チェック）は置かない
export function AutocompleteOption({
  item,
  onPress,
}: {
  item: AutocompleteItem;
  /** 押した・Enter で選んだとき。どの候補かを部品に伝える */
  onPress: (item: AutocompleteItem) => void;
}) {
  const { itemProps, labelProps, noteId } = useListboxOption(item);
  const handleClick: MouseEventHandler = () => onPress(item);
  return (
    <BaseAutocomplete.Item
      value={item}
      disabled={item.disabled}
      onClick={handleClick}
      {...itemProps}
    >
      <ListboxOptionContent note={item.note} noteId={noteId}>
        <span {...labelProps}>{item.label}</span>
      </ListboxOptionContent>
    </BaseAutocomplete.Item>
  );
}
