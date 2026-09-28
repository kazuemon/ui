'use client';

import { Accessibility, PointerActivationConstraints, PointerSensor } from '@dnd-kit/dom';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { useState } from 'react';

import { Sortable, SortableHandle, SortableItem } from '../components/sortable/Sortable';

interface Item {
  id: string;
  label: string;
}

// キーボードと読み上げは Sortable が持つので、dnd-kit にはポインタだけを任せ、読み上げの仕組み（Accessibility）は外す
//   引き始めるのは 4px 動かしてから（押しただけで、持ち上げた写しがちらつかない）
const sensors = [
  PointerSensor.configure({
    activationConstraints: [new PointerActivationConstraints.Distance({ value: 4 })],
  }),
];
// 周りがずれる動きと、離したときに収まる動きを、Sortable（motion="slide"）と同じ長さと緩急にそろえる
const transition = { duration: 250, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' };

export function SortableList({ items, label }: { items: Item[]; label: string }) {
  const [order, setOrder] = useState(() => items.map((item) => item.id));
  const labelOf = (id: unknown) => items.find((item) => item.id === id)?.label;
  return (
    <DragDropProvider
      sensors={sensors}
      plugins={(defaults) => defaults.filter((plugin) => plugin !== Accessibility)}
      onDragEnd={(event) => setOrder((current) => move(current, event))}
    >
      <Sortable value={order} onValueChange={setOrder} aria-label={label}>
        {order.map((id, index) => (
          <Row key={id} id={id} index={index} label={labelOf(id)} />
        ))}
      </Sortable>
      {/* 引いているあいだ、ポインタについて動く写し */}
      <DragOverlay tag="ul" dropAnimation={transition}>
        {(source) => (
          <SortableItem value={String(source.id)} dragging>
            <SortableHandle />
            {labelOf(source.id)}
          </SortableItem>
        )}
      </DragOverlay>
    </DragDropProvider>
  );
}

function Row({ id, index, label }: { id: string; index: number; label?: string }) {
  const { ref, handleRef, isDragSource } = useSortable({ id, index, transition });
  return (
    <SortableItem ref={ref} value={id} dragSource={isDragSource} accessibleName={label}>
      <SortableHandle ref={handleRef} />
      {label}
    </SortableItem>
  );
}
