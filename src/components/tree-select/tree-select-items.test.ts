import { describe, expect, it } from 'vitest';

import type { ListboxValue } from '../../internal/listbox/use-listbox-option';

import { indexTree, pressScope, type TreeSelectItem } from './tree-select-items';

// A ─ a1（押せない）・a2・a3
const items: TreeSelectItem[] = [
  {
    value: 'A',
    label: 'A',
    children: [
      { value: 'a1', label: 'a1', disabled: true },
      { value: 'a2', label: 'a2' },
      { value: 'a3', label: 'a3' },
    ],
  },
];
const index = indexTree(items);
const press = (values: readonly ListboxValue[], value: string) =>
  pressScope(index, values, index.byValue.get(value)!);

describe('pressScope', () => {
  it('押せない子を選んだまま、親を押して外しても子は残る', () => {
    const once = press(['a1'], 'A');
    expect(once).toEqual(['A']);
    expect(press(once, 'A')).toEqual(['a1']);
  });

  it('含まれる子を押して切り分けても、押せない兄弟は選んだまま', () => {
    expect(press(['A'], 'a2')).toEqual(['a1', 'a3']);
  });

  it('押せない子を選んでいないとき、親を押しても子は選ばないまま', () => {
    const once = press([], 'A');
    expect(once).toEqual(['a2', 'a3']);
    expect(press(once, 'A')).toEqual([]);
  });

  it('押せない子がなければ、親を押すと親で覆う', () => {
    expect(press(['a2'], 'a3')).toEqual(['a2', 'a3']);
    expect(press(['a1', 'a2', 'a3'], 'A')).toEqual(['A']);
  });
});
