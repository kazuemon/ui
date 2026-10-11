'use client';

import { type RefObject, useState } from 'react';

import { useIsomorphicLayoutEffect } from '../../internal/use-isomorphic-layout-effect';

/** 帯に操作をどう並べるか。label は文字のまま、icon はアイコンだけ。visible 個めまでを帯に置き、残りはメニューに畳む */
export interface ActionBarFit {
  mode: 'label' | 'icon';
  visible: number;
}

interface Refs {
  /** 帯がいちばん広がったときの中身の幅を測る定規（左右の inset と内側の余白を引いた幅） */
  ruler: RefObject<HTMLElement | null>;
  /** 操作の前に並ぶもの（選択を外すボタンと件数の文） */
  lead: RefObject<HTMLElement | null>;
  /** 測るための見えない並び。[data-fit=label]・[data-fit=icon] の子が操作 1 つずつ、[data-fit=more] がメニューを開くボタン */
  measure: RefObject<HTMLElement | null>;
}

const widths = (root: HTMLElement, kind: string) =>
  Array.from(root.querySelectorAll<HTMLElement>(`[data-fit="${kind}"]`), (el) => el.offsetWidth);

/** 先頭から k 個を並べ、残りをメニューに畳んだときに入る、いちばん大きい k */
function fold(items: number[], gap: number, more: number, room: number) {
  let used = more;
  let count = 0;
  for (const width of items) {
    if (used + gap + width > room) break;
    used += gap + width;
    count++;
  }
  return count;
}

const total = (items: number[], gap: number) =>
  items.reduce((sum, width) => sum + width, 0) + gap * Math.max(0, items.length - 1);

/**
 * 操作が帯に入りきるかを測り、入りきらないときの並べ方を決める
 *   menu: 入らない分を後ろからメニューに畳む。icon-only: まず文字を外してアイコンだけにし、それでも入らなければ畳む
 *   wrap: 測らない（CSS で次の行へ折り返す）
 */
export function useActionBarFit(
  refs: Refs,
  { count, narrowDisplay, active }: { count: number; narrowDisplay: string; active: boolean }
): ActionBarFit {
  const [fit, setFit] = useState<ActionBarFit>({ mode: 'label', visible: count });

  useIsomorphicLayoutEffect(() => {
    const ruler = refs.ruler.current;
    const lead = refs.lead.current;
    const measure = refs.measure.current;
    if (!active || narrowDisplay === 'wrap' || !ruler || !lead || !measure) {
      setFit((prev) =>
        prev.mode === 'label' && prev.visible === count ? prev : { mode: 'label', visible: count }
      );
      return undefined;
    }
    const update = () => {
      const style = getComputedStyle(ruler);
      const room =
        ruler.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const gap = parseFloat(getComputedStyle(measure).columnGap) || 0;
      // 操作の並びの前の空き（件数の文との間）も gap と同じ
      const actionsRoom = room - lead.offsetWidth - gap;
      const labels = widths(measure, 'label');
      const icons = widths(measure, 'icon');
      const more = measure.querySelector<HTMLElement>('[data-fit="more"]')?.offsetWidth ?? 0;
      let next: ActionBarFit;
      if (total(labels, gap) <= actionsRoom) next = { mode: 'label', visible: labels.length };
      else if (narrowDisplay === 'icon-only' && total(icons, gap) <= actionsRoom)
        next = { mode: 'icon', visible: icons.length };
      else if (narrowDisplay === 'icon-only')
        next = { mode: 'icon', visible: fold(icons, gap, more, actionsRoom) };
      else next = { mode: 'label', visible: fold(labels, gap, more, actionsRoom) };
      setFit((prev) => (prev.mode === next.mode && prev.visible === next.visible ? prev : next));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(ruler);
    observer.observe(lead);
    observer.observe(measure);
    return () => observer.disconnect();
  }, [active, count, narrowDisplay, refs.lead, refs.measure, refs.ruler]);

  return fit;
}
