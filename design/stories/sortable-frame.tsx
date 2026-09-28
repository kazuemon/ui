// 軸 372〜377（Sortable）の比較で共有する見本（どの軸も決定済み）。決まって比較のストーリーを消すときに一緒に消す
//   StaticDrag: 並べ替えの途中を止めて見せる（入る場所の枠と、持ち上げた写し）
//   TryList: dnd-kit でつないだ、実際に引いて試せるリスト（src/recipes/sortable-dnd-kit.tsx と同じつなぎ方）
import { Accessibility, PointerActivationConstraints, PointerSensor } from '@dnd-kit/dom';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { useState } from 'react';

import {
  Sortable,
  type SortableDragSourceVariant,
  type SortableGrabArea,
  SortableHandle,
  type SortableMoveActions,
  SortableItem,
  type SortableVariant,
} from '../../src/components/sortable/Sortable';

const items = [
  { id: 'draft', label: '下書きを書く' },
  { id: 'review', label: '見直しを頼む' },
  { id: 'image', label: '見出しの画像を作る' },
  { id: 'publish', label: '公開する' },
];
const labelOf = (id: unknown) => items.find((item) => item.id === id)?.label ?? String(id);

export interface SortableLook {
  variant?: SortableVariant;
  grabArea?: SortableGrabArea;
  /** つまみを末尾に置く */
  handleEnd?: boolean;
  /** 引かずに並べ替える操作 */
  moveActions?: SortableMoveActions;
  /** 入る場所の見せ方 */
  dragSourceVariant?: SortableDragSourceVariant;
}

/** レシピと同じセンサー。distance は引き始めるまでに動かす距離（px）。null は条件なし（dnd-kit の既定） */
function sensorsFor(distance: number | null) {
  if (distance === null) return [PointerSensor];
  return [
    PointerSensor.configure({
      activationConstraints: [new PointerActivationConstraints.Distance({ value: distance })],
    }),
  ];
}

function Content({
  id,
  handleEnd,
  withName,
}: {
  id: string;
  handleEnd?: boolean;
  withName?: boolean;
}) {
  return (
    <>
      <SortableHandle
        placement={handleEnd ? 'end' : 'start'}
        accessibleName={withName ? `${labelOf(id)}を並べ替え` : undefined}
      />
      {labelOf(id)}
    </>
  );
}

/** 並べ替えの途中を止めた見本。2 つ目の項目を持ち上げ、写しを少しずらして重ねる */
export function StaticDrag({
  variant,
  dragSourceVariant,
  grabArea,
  handleEnd,
  sourceIndex = 1,
}: SortableLook & { sourceIndex?: number }) {
  const order = items.map((item) => item.id);
  return (
    <div className="relative w-72">
      <Sortable
        value={order}
        variant={variant}
        dragSourceVariant={dragSourceVariant}
        grabArea={grabArea}
        aria-label="記事を出すまで"
      >
        {order.map((id, index) => (
          <SortableItem key={id} value={id} dragSource={index === sourceIndex}>
            <Content id={id} handleEnd={handleEnd} />
          </SortableItem>
        ))}
      </Sortable>
      <ul
        inert
        className="absolute inset-x-0 translate-x-3"
        style={{
          top: `calc((var(--spacing-control) + var(--sortable-gap)) * ${sourceIndex} + 26px)`,
        }}
      >
        <SortableItem value={order[sourceIndex]} dragging>
          <Content id={order[sourceIndex]} handleEnd={handleEnd} />
        </SortableItem>
      </ul>
    </div>
  );
}

/** 止めずに置いた見本（hover・フォーカスを当てる列で使う） */
export function StaticList({ variant, grabArea, handleEnd, moveActions }: SortableLook) {
  const order = items.map((item) => item.id);
  return (
    <div className="w-72">
      <Sortable
        value={order}
        variant={variant}
        grabArea={grabArea}
        moveActions={moveActions}
        aria-label="記事を出すまで"
      >
        {order.map((id) => (
          <SortableItem key={id} value={id}>
            <Content id={id} handleEnd={handleEnd} />
          </SortableItem>
        ))}
      </Sortable>
    </div>
  );
}

/**
 * 引いて試せるリスト。moveDuration は、周りがずれる動きと、離したときに収まる動きの長さ（ms。既定はレシピと同じ 250）
 * キーボード（つまみにフォーカスして上下の矢印キー）で動かしたときの長さは、トークン（--sortable-move-duration）が決める
 */
export function TryList({
  variant,
  dragSourceVariant,
  grabArea = 'handle',
  handleEnd,
  moveActions,
  moveDuration = 250,
  activationDistance = 4,
}: SortableLook & { moveDuration?: number; activationDistance?: number | null }) {
  const [order, setOrder] = useState(() => items.map((item) => item.id));
  const easing = 'cubic-bezier(0.33, 1, 0.68, 1)'; // --ease-sheet
  const timing = moveDuration === undefined ? undefined : { duration: moveDuration, easing };
  return (
    <div className="w-72">
      <DragDropProvider
        sensors={sensorsFor(activationDistance)}
        plugins={(defaults) => defaults.filter((plugin) => plugin !== Accessibility)}
        onDragEnd={(event) => setOrder((current) => move(current, event))}
      >
        <Sortable
          value={order}
          onValueChange={setOrder}
          variant={variant}
          dragSourceVariant={dragSourceVariant}
          grabArea={grabArea}
          moveActions={moveActions}
          aria-label="記事を出すまで"
        >
          {order.map((id, index) => (
            <Row
              key={id}
              id={id}
              index={index}
              handleEnd={handleEnd}
              wholeItem={grabArea === 'item'}
              transition={timing === undefined ? undefined : moveDuration ? timing : null}
            />
          ))}
        </Sortable>
        <DragOverlay
          tag="ul"
          dropAnimation={timing === undefined ? undefined : moveDuration ? timing : null}
        >
          {(source) => (
            <SortableItem value={String(source.id)} dragging>
              <Content id={String(source.id)} handleEnd={handleEnd} />
            </SortableItem>
          )}
        </DragOverlay>
      </DragDropProvider>
    </div>
  );
}

function Row({
  id,
  index,
  handleEnd,
  wholeItem,
  transition,
}: {
  id: string;
  index: number;
  handleEnd?: boolean;
  wholeItem: boolean;
  transition?: { duration: number; easing: string } | null;
}) {
  const { ref, handleRef, isDragSource } = useSortable({ id, index, transition });
  return (
    <SortableItem ref={ref} value={id} dragSource={isDragSource} accessibleName={labelOf(id)}>
      <SortableHandle
        ref={wholeItem ? undefined : handleRef}
        placement={handleEnd ? 'end' : 'start'}
      />
      {labelOf(id)}
    </SortableItem>
  );
}
