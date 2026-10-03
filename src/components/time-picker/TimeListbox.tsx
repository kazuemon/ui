'use client';

import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';

import type { TimeOption } from './time-options';
import { CheckIcon } from '../../internal/icons';
import { listboxOption } from '../../internal/listbox/listbox-styles';
import { ScrollFrame } from '../../internal/ScrollFrame';

// 時刻の一覧（1 列）。1 列の形では時刻を並べ、列の形では時・分・午前午後の 1 列ずつに使う
//   項目の見た目は Select の選択肢と同じ（listboxOption — 原則3・6、ADR-0053）。指している項目はグレーの塗り、選んだ項目は部品の色の淡い面と太字
//   フォーカスは項目そのものへ移す（roving tabindex）。指していることは線ではなく、Select と同じ手応えの塗りで見せる（原則2）
//   スクロールの枠は ScrollArea と同じ（続きがある端の内側の影と、載せたときのつまみ — 原則1）
//   開いたときは、選んでいる時刻（なければいまの時刻の近く）を一覧の中央へ送る。前後の時刻がはじめから見え、刻みが分かる

const option = listboxOption();

export interface TimeListboxProps {
  options: TimeOption[];
  /** 選んでいる項目の key */
  selectedKey: string | null;
  /** 開いたときに送り、フォーカスを置く項目の key（値がないときは、いまの時刻に近い項目） */
  initialKey: string | null;
  onSelect: (key: string) => void;
  /** 読み上げの名前 */
  label: string;
  /** 列の上に出す見出し（列の形の showColumnHeading）。読み上げには label が届くので、見出しは読み上げから外す */
  heading?: string;
  /** 選んだ項目にチェックを出す（1 列の形） */
  showCheck?: boolean;
  /** 列の形の、列ごとの印（data-column） */
  column?: string;
}

export function TimeListbox({
  options,
  selectedKey,
  initialKey,
  onSelect,
  label,
  heading,
  showCheck = false,
  column,
}: TimeListboxProps) {
  const id = useId();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(initialKey ?? options[0]?.key ?? null);
  const [focused, setFocused] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const highlighted = hovered ?? focused;
  const rescrollRef = useRef<(() => void) | null>(null);

  // 開いたときに、選んでいる項目（なければ近い項目）を一覧の中央へ送る
  //   面の位置と高さの上限（--available-height）が決まってから測り直すので、次の描画でもう一度送る
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    const scroll = () => {
      const target = viewport.querySelector<HTMLElement>(`[data-key="${initialKey}"]`);
      if (!target) return;
      const padding = Number.parseFloat(getComputedStyle(viewport).paddingTop) || 0;
      const top =
        target.getBoundingClientRect().top -
        viewport.getBoundingClientRect().top +
        viewport.scrollTop;
      const room = viewport.clientHeight - padding * 2 - target.offsetHeight;
      viewport.scrollTop = Math.max(0, top - padding - room / 2);
      // 面が開いてフォーカスが別の項目に置かれていたら、行き先の項目へ移す
      const current = document.activeElement;
      if (current !== target && current?.closest('[role="listbox"]') === target.parentElement) {
        target.focus({ preventScroll: true });
      }
    };
    scroll();
    // 面を開いたあとのフォーカス（Base UI が項目へ移す）でブラウザが項目を端へ送ることがあるので、最初のフォーカスのあとにも送り直す
    rescrollRef.current = scroll;
    const frame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frame);
    // 開いたときだけ送る（選び直しても一覧は動かさない）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveTo = (index: number) => {
    const next = options[Math.max(0, Math.min(options.length - 1, index))];
    if (!next) return;
    setActive(next.key);
    setHovered(null);
    viewportRef.current
      ?.querySelector<HTMLElement>(`[data-key="${next.key}"]`)
      ?.focus({ preventScroll: false });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = options.findIndex((item) => item.key === active);
    // 1 ページの行数は、見えている高さを項目の実際の高さ（密度で変わる）で割って出す
    const viewport = viewportRef.current;
    const rowHeight = viewport?.querySelector<HTMLElement>('[role="option"]')?.offsetHeight ?? 0;
    const page =
      viewport && rowHeight > 0
        ? Math.max(1, Math.floor(viewport.clientHeight / rowHeight) - 1)
        : 1;
    const moves: Record<string, number> = {
      ArrowDown: index + 1,
      ArrowUp: index - 1,
      Home: 0,
      End: options.length - 1,
      PageDown: index + page,
      PageUp: index - page,
    };
    if (event.key in moves) {
      event.preventDefault();
      moveTo(moves[event.key] ?? index);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const current = options[index];
      if (current && !current.disabled) onSelect(current.key);
    }
  };

  return (
    <div data-slot="time-picker-column" data-column={column} className="flex min-w-0 flex-col">
      {heading != null && (
        <div
          aria-hidden
          data-slot="time-picker-column-heading"
          className="border-b-(length:--border-width-thin) border-surface-line px-[calc(var(--spacing-control-x)-var(--spacing))] py-(--spacing) text-center text-(length:--text-caption) leading-(--leading-caption) text-fg-subtle"
        >
          {heading}
        </div>
      )}
      <ScrollFrame
        slot="time-picker-scroll"
        className="min-h-0 flex-1"
        focusable={false}
        viewportClassName="max-h-[min(var(--available-height,100dvh),calc(var(--spacing-control)*var(--time-picker-max-rows)+var(--spacing)*2))] p-(--spacing)"
        contentStyle={{ minWidth: 0 }}
        inlineEdges={false}
        orientation="vertical"
        scrollbarClassName="my-(--spacing)"
        onViewport={(element) => {
          viewportRef.current = element;
        }}
      >
        <div
          role="listbox"
          aria-label={label}
          data-slot="time-picker-listbox"
          onKeyDown={handleKeyDown}
          onMouseLeave={() => setHovered(null)}
        >
          {options.map((item) => {
            const selected = item.key === selectedKey;
            // 選べない項目の hover の塗りは、Select と同じく listboxOption のクラスが消す
            const isHighlighted = item.key === highlighted;
            return (
              <div
                key={item.key}
                id={`${id}${item.key}`}
                role="option"
                data-key={item.key}
                aria-selected={selected}
                aria-disabled={item.disabled || undefined}
                tabIndex={item.key === active ? 0 : -1}
                data-selected={selected ? '' : undefined}
                data-highlighted={isHighlighted ? '' : undefined}
                data-disabled={item.disabled ? '' : undefined}
                // 1 列の形は Select と同じく左寄せで右にチェック、列の形は数字を列の中央に置く
                className={option.root({
                  className: showCheck ? 'tabular-nums' : 'justify-center tabular-nums',
                })}
                onMouseMove={() => {
                  if (hovered !== item.key) setHovered(item.key);
                }}
                onFocus={() => {
                  const rescroll = rescrollRef.current;
                  if (rescroll) {
                    rescrollRef.current = null;
                    requestAnimationFrame(rescroll);
                  }
                  setActive(item.key);
                  setFocused(item.key);
                }}
                onBlur={() => setFocused((current) => (current === item.key ? null : current))}
                onClick={() => {
                  if (!item.disabled) onSelect(item.key);
                }}
              >
                <span
                  className={option.label({
                    className: showCheck ? 'flex-1 whitespace-nowrap' : 'whitespace-nowrap',
                  })}
                >
                  {item.label}
                </span>
                {showCheck && (
                  <span
                    aria-hidden
                    className={option.indicator({
                      className: selected ? undefined : 'invisible',
                    })}
                  >
                    <CheckIcon />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </ScrollFrame>
    </div>
  );
}
