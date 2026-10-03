'use client';

import { useEffect, useRef, useState } from 'react';

import { MenuItem } from '../components/menu/MenuItem';
import { Sortable, SortableHandle, SortableItem } from '../components/sortable/Sortable';

interface Item {
  id: string;
  label: string;
}

type ListId = 'today' | 'later';

const lists: { id: ListId; label: string }[] = [
  { id: 'today', label: '今日' },
  { id: 'later', label: 'あとで' },
];

// 2 つのリストの並びを親で持ち、︙ のメニューに「〜へ移動」を足す
//   Sortable は 1 つのリストの中の並べ替えだけを持つので、リストをまたぐ移動は使う側が両方の並びを更新する
export function SortableTwoLists({ defaultItems: items }: { defaultItems: Item[] }) {
  const [orders, setOrders] = useState<Record<ListId, string[]>>(() => ({
    today: items.slice(0, 2).map((item) => item.id),
    later: items.slice(2).map((item) => item.id),
  }));
  const labelOf = (id: string) => items.find((item) => item.id === id)?.label;
  const rootRef = useRef<HTMLDivElement>(null);
  // 移した項目。移す先に描かれたら、その項目のつまみ（なければ ︙ のボタン）へフォーカスを移す
  //   ︙ のボタンは元のリストと一緒に消えるので、そのままではフォーカスがページの先頭に戻ってしまう
  const movedRef = useRef<string | null>(null);
  useEffect(() => {
    const movedId = movedRef.current;
    if (movedId == null) return;
    movedRef.current = null;
    const item = rootRef.current?.querySelector(`[data-value="${CSS.escape(movedId)}"]`);
    const target = item?.querySelector<HTMLElement>(
      '[data-slot=sortable-handle], [data-slot=sortable-actions] button'
    );
    // メニューが閉じて元のボタンへフォーカスを戻そうとするのを待ってから移す
    requestAnimationFrame(() => target?.focus());
  });
  // 移す先の末尾に足す
  const moveToList = (id: string, from: ListId, to: ListId) => {
    setOrders((current) => ({
      ...current,
      [from]: current[from].filter((other) => other !== id),
      [to]: [...current[to], id],
    }));
    movedRef.current = id;
  };
  return (
    <div ref={rootRef} className="flex flex-wrap gap-8">
      {lists.map((list) => (
        <section key={list.id} className="flex w-64 flex-col gap-2">
          <h3 className="text-sm font-bold">{list.label}</h3>
          <Sortable
            value={orders[list.id]}
            onValueChange={(order) => setOrders((current) => ({ ...current, [list.id]: order }))}
            aria-label={list.label}
            moveActions="item-menu"
          >
            {orders[list.id].map((id) => (
              <SortableItem
                key={id}
                value={id}
                accessibleName={labelOf(id)}
                menu={lists
                  .filter((other) => other.id !== list.id)
                  .map((other) => (
                    <MenuItem key={other.id} onClick={() => moveToList(id, list.id, other.id)}>
                      {other.label}へ移動
                    </MenuItem>
                  ))}
              >
                <SortableHandle />
                {labelOf(id)}
              </SortableItem>
            ))}
          </Sortable>
        </section>
      ))}
    </div>
  );
}
