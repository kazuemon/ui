'use client';

import { type RefObject, useState } from 'react';

import { useIsomorphicLayoutEffect } from '../../internal/use-isomorphic-layout-effect';

/** 入りきらないときの、操作ごとの扱い。bar は帯に残して折り返し、icon-only はまず文字を外し、menu は ⋮ のメニューに畳む */
export type ActionBarButtonNarrowPlacement = 'bar' | 'icon-only' | 'menu';

/** 帯に操作をどう並べるか。icon は文字を外した操作、folded は ⋮ に畳んだ操作（どちらも並べた順の添え字ごと） */
export interface ActionBarFit {
  icon: boolean[];
  folded: boolean[];
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

const none = (count: number): ActionBarFit => ({
  icon: Array<boolean>(count).fill(false),
  folded: Array<boolean>(count).fill(false),
});

const same = (a: ActionBarFit, b: ActionBarFit) =>
  a.icon.length === b.icon.length &&
  a.icon.every((v, i) => v === b.icon[i] && a.folded[i] === b.folded[i]);

/**
 * 操作が帯に入りきるかを測り、入りきらないときの並べ方を決める。順は次のとおり
 *   1. 入りきれば、そのまま並べる
 *   2. icon-only の操作の文字を外す（まとめて）
 *   3. menu の操作を、後ろから 1 つずつ ⋮ のメニューに畳む
 *   4. それでも入らなければ、残った操作を次の行へ折り返す（CSS の flex-wrap）
 */
export function useActionBarFit(
  refs: Refs,
  { placements, active }: { placements: ActionBarButtonNarrowPlacement[]; active: boolean }
): ActionBarFit {
  const count = placements.length;
  const key = placements.join(',');
  const [fit, setFit] = useState<ActionBarFit>(() => none(count));

  useIsomorphicLayoutEffect(() => {
    const ruler = refs.ruler.current;
    const lead = refs.lead.current;
    const measure = refs.measure.current;
    const kinds = key ? (key.split(',') as ActionBarButtonNarrowPlacement[]) : [];
    if (!active || !ruler || !lead || !measure) {
      const empty = none(kinds.length);
      setFit((prev) => (same(prev, empty) ? prev : empty));
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
      const next = none(kinds.length);
      const used = () => {
        let total = 0;
        let shown = 0;
        next.folded.forEach((folded, i) => {
          if (folded) return;
          total += next.icon[i] ? (icons[i] ?? 0) : (labels[i] ?? 0);
          shown++;
        });
        if (next.folded.some(Boolean)) {
          total += more;
          shown++;
        }
        return total + gap * Math.max(0, shown - 1);
      };
      if (used() > actionsRoom) {
        kinds.forEach((kind, i) => {
          if (kind === 'icon-only') next.icon[i] = true;
        });
        for (let i = kinds.length - 1; i >= 0 && used() > actionsRoom; i--) {
          if (kinds[i] === 'menu') next.folded[i] = true;
        }
      }
      setFit((prev) => (same(prev, next) ? prev : next));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(ruler);
    observer.observe(lead);
    observer.observe(measure);
    return () => observer.disconnect();
  }, [active, key, refs.lead, refs.measure, refs.ruler]);

  return fit.icon.length === count ? fit : none(count);
}
