'use client';

import { use } from 'react';

import { focusRing } from '../../internal/focus-styles';
import { CaretDownIcon, CaretUpIcon } from '../../internal/icons';
import { tv } from '../../internal/tv';
import { Menu } from '../menu/Menu';
import { MenuItem } from '../menu/MenuItem';
import { ItemContext, ListContext, type ListContextValue } from './sortable-context';

// 引かずに並べ替える操作（WCAG 2.2 の 2.5.7）。移動は部品が onValueChange で知らせるので、エンジンに頼らない
//   ボタンの読み上げの名前には、つまみと同じく項目の名前を前に付ける（「下書きを書くを上へ移動」）。どの項目のボタンかが伝わるように
//   端の項目では、それより先へ動かせない操作を押せなくする（隠すと、項目ごとにメニューの形が変わるため）

const actions = tv({
  slots: {
    // 項目の末尾に接した塊。高さは項目いっぱい。末尾のつまみがあるときは、その手前に並ぶ
    root: [
      '-my-(--sortable-item-py) me-(--sortable-actions-end) flex shrink-0 self-stretch',
      'group-data-drag-source/sortable-item:opacity-0',
    ],
    // 平らな押すもの（原則3）。つまみと同じ幅・手応え・内側のフォーカスの線
    button: [
      'inline-flex w-(--sortable-handle-width) items-center justify-center rounded-(--sortable-handle-radius) text-fg-muted',
      'bg-(color:--flat-bg) [--flat-bg:transparent]',
      'enabled:hover:[--flat-bg:var(--color-flat-hover)] enabled:active:translate-y-(--flat-press-depth) enabled:active:[--flat-bg:var(--color-flat-press)]',
      'disabled:text-on-field-disabled',
      '[transition:--flat-bg_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
      ...focusRing,
      '[--focus-ring-offset:calc(var(--focus-ring-width)*-1)]',
    ],
    icon: 'size-(--spacing-icon)',
  },
});

/** ︙ のメニューの中の移動の操作。メニューを開いたボタンの名前に項目の名前が入っているので、文字は短いまま */
function MoveMenuItems({ list, item }: { list: ListContextValue; item: string }) {
  const index = list.order.indexOf(item);
  const last = list.order.length - 1;
  return (
    <>
      <MenuItem disabled={index <= 0} onClick={() => list.moveTo(item, index - 1)}>
        {list.labels.up}
      </MenuItem>
      <MenuItem disabled={index >= last} onClick={() => list.moveTo(item, index + 1)}>
        {list.labels.down}
      </MenuItem>
      <MenuItem disabled={index <= 0} onClick={() => list.moveTo(item, 0)}>
        {list.labels.first}
      </MenuItem>
      <MenuItem disabled={index >= last} onClick={() => list.moveTo(item, last)}>
        {list.labels.last}
      </MenuItem>
    </>
  );
}

/** 項目の末尾に置く移動の操作（item-menu の ︙、buttons の「上へ」「下へ」） */
export function ItemMoveActions() {
  const list = use(ListContext);
  const item = use(ItemContext);
  if (!list || !item || list.disabled) return null;
  if (list.moveActions !== 'item-menu' && list.moveActions !== 'buttons') return null;
  const { root, button, icon } = actions();
  const index = list.order.indexOf(item.value);
  // 1 つだけ止めた項目は、つまみと同じく場所を残して隠す
  const hidden = item.locked ? 'invisible' : '';
  const named = (label: string) => (item.name ? `${item.name}を${label}` : label);
  if (list.moveActions === 'item-menu') {
    return (
      <div className={root({ className: hidden })} data-slot="sortable-actions">
        <Menu
          title={named(list.labels.menu)}
          align="end"
          trigger={
            <button type="button" aria-label={named(list.labels.menu)} className={button()}>
              <DotsThreeVerticalIcon className={icon()} />
            </button>
          }
        >
          <MoveMenuItems list={list} item={item.value} />
        </Menu>
      </div>
    );
  }
  return (
    <div className={root({ className: hidden })} data-slot="sortable-actions">
      <button
        type="button"
        aria-label={named(list.labels.up)}
        disabled={index <= 0}
        className={button()}
        onClick={() => list.moveTo(item.value, index - 1)}
      >
        <CaretUpIcon standalone className={icon()} />
      </button>
      <button
        type="button"
        aria-label={named(list.labels.down)}
        disabled={index >= list.order.length - 1}
        className={button()}
        onClick={() => list.moveTo(item.value, index + 1)}
      >
        <CaretDownIcon standalone className={icon()} />
      </button>
    </div>
  );
}

// Phosphor Icons の DotsThreeVertical（Fill。MIT License、著作権表示は src/internal/icons.tsx）
function DotsThreeVerticalIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" className={className}>
      <circle cx="128" cy="60" r="16" />
      <circle cx="128" cy="128" r="16" />
      <circle cx="128" cy="196" r="16" />
    </svg>
  );
}
