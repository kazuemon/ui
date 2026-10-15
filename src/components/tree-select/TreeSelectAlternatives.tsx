'use client';

import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '../button/Button';
import { ancestorsOf, isParent, type TreeIndex, type TreeNode } from './tree-select-items';
import { TreeSelectPanel, type TreeSelectPanelProps, treeSelectRowStyles } from './TreeSelectPanel';
import { CaretRightIcon, CheckIcon, MagnifyingGlassIcon } from '../../internal/icons';
import type { ListboxValue } from '../../internal/listbox/use-listbox-option';
import { ScrollFrame } from '../../internal/ScrollFrame';

// 親も選べる形（1 つ選ぶ形）の、木とは考え方の違う面（軸 645 の比較中。決まったら畳む）
//   DrillPanel（E）: 1 段ずつ進む形。今いる段の行だけを出し、子を持つ行を押すとその中へ進む。上にパンくず、下に「今いる段を選ぶ」ボタン
//   SearchPanel（G）: 検索を主にした形。上の検索欄に打つと、木を平らにした候補をパスつきで出す。打っていないときは木のまま
//   行の見た目は木の面と同じ（treeSelectRowStyles）

const slots = treeSelectRowStyles();

// 面の中の欄・行で使う、行と同じ大きさの文字とアイコン
const panelText = 'text-input [--spacing-icon:var(--spacing-icon-input)]';

const scrollViewport =
  'max-h-[min(var(--available-height,100dvh),calc(var(--spacing-control)*var(--tree-select-max-rows)+var(--spacing)*2))] p-(--spacing)';

function keyOf(node: TreeNode) {
  return `${typeof node.value}:${String(node.value)}`;
}

/** 行の並びの中を ↑↓・Home・End で移る。移れたら true */
function moveInList(event: KeyboardEvent<HTMLElement>, rows: HTMLElement[], at: number) {
  const moves: Record<string, number> = {
    ArrowDown: at + 1,
    ArrowUp: at - 1,
    Home: 0,
    End: rows.length - 1,
  };
  if (!(event.key in moves)) return false;
  event.preventDefault();
  rows[Math.max(0, Math.min(rows.length - 1, moves[event.key] ?? at))]?.focus();
  return true;
}

interface AlternativeProps {
  index: TreeIndex;
  selected: ListboxValue | null;
  onPick: (node: TreeNode) => void;
  label: string;
  autoFocus: boolean;
}

/** E: 1 段ずつ進む形（ファイルの「移動」の面と同じ考え方） */
export function DrillPanel({ index, selected, onPick, label, autoFocus }: AlternativeProps) {
  // 開いたときは、選んだ行のある段から始める
  const [level, setLevel] = useState<TreeNode | null>(() => {
    const node = selected == null ? undefined : index.byValue.get(selected);
    return node?.parent ?? null;
  });
  const rows = level ? level.children : index.roots;
  const listRef = useRef<HTMLDivElement>(null);
  const focusAfterMove = useRef(autoFocus);

  // 段を移ったら（と開いたとき）、行へフォーカスを移す。今いる段の一覧（level の名前で読み上げる）を描いたあとに探す
  useEffect(() => {
    if (!focusAfterMove.current) return;
    const list = listRef.current;
    if (list?.getAttribute('aria-label') !== (level ? level.label : label)) return;
    const target =
      list?.querySelector<HTMLElement>('[aria-selected="true"]') ??
      list?.querySelector<HTMLElement>('[role="option"]');
    target?.focus();
  }, [level, label]);

  const go = (next: TreeNode | null) => {
    focusAfterMove.current = true;
    setLevel(next);
  };

  const rowElements = () =>
    Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);

  return (
    <div className={`flex min-w-0 flex-col ${panelText}`}>
      {/* パンくず。押すとその段へ戻る。今いる段は太字で、押せない */}
      <nav
        aria-label="段"
        className="flex min-h-(--spacing-control) flex-wrap items-center gap-x-1 border-b-(length:--border-width-thin) border-surface-line px-(--spacing) py-1"
      >
        {[null, ...(level ? [...ancestorsOf(level), level] : [])].map((crumb, i, all) => {
          const last = i === all.length - 1;
          const text = crumb ? crumb.label : label;
          return (
            <span key={crumb ? keyOf(crumb) : 'root'} className="flex min-w-0 items-center gap-1">
              {i > 0 && (
                <span aria-hidden className="text-fg-subtle">
                  /
                </span>
              )}
              {last ? (
                <span aria-current="location" className="truncate px-1.5 font-bold">
                  {text}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => go(crumb)}
                  className="truncate rounded-[calc(var(--radius-control)-var(--spacing))] px-1.5 py-0.5 text-fg-muted hover:bg-field"
                >
                  {text}
                </button>
              )}
            </span>
          );
        })}
      </nav>
      <ScrollFrame
        slot="tree-select-scroll"
        focusable={false}
        viewportClassName={scrollViewport}
        contentStyle={{ minWidth: 0 }}
        inlineEdges={false}
        orientation="vertical"
        scrollbarClassName="my-(--spacing)"
      >
        <div ref={listRef} role="listbox" aria-label={level ? level.label : label}>
          {rows.map((node, at) => {
            const parent = isParent(node);
            const isSelected = node.value === selected;
            return (
              <div
                key={keyOf(node)}
                role="option"
                aria-selected={isSelected}
                aria-disabled={node.disabled || undefined}
                data-slot="tree-select-item"
                data-disabled={node.disabled ? '' : undefined}
                tabIndex={at === 0 || isSelected ? 0 : -1}
                className={slots.row({
                  className:
                    'hover:not-data-disabled:bg-field focus-visible:bg-field [--tree-depth:0]',
                })}
                onClick={() => {
                  if (parent) go(node);
                  else if (!node.disabled) onPick(node);
                }}
                onKeyDown={(event) => {
                  if (moveInList(event, rowElements(), at)) return;
                  if (event.key === 'ArrowRight' && parent) {
                    event.preventDefault();
                    go(node);
                  } else if ((event.key === 'ArrowLeft' || event.key === 'Backspace') && level) {
                    event.preventDefault();
                    go(level.parent);
                  } else if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    if (parent) go(node);
                    else if (!node.disabled) onPick(node);
                  }
                }}
              >
                <span data-slot="tree-label" className={slots.label()}>
                  {node.label}
                </span>
                {isSelected && (
                  <span aria-hidden className={slots.check()}>
                    <CheckIcon />
                  </span>
                )}
                {parent && (
                  // 子を持つ行は、押すと中へ進む（右端の › がその印）
                  <span aria-hidden className="flex shrink-0 text-fg-subtle">
                    <CaretRightIcon />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </ScrollFrame>
      {/* 今いる段そのものを選ぶボタン（いちばん上の段では出さない） */}
      {level && (
        <div className="border-t-(length:--border-width-thin) border-surface-line p-(--spacing)">
          <Button
            className="w-full"
            disabled={level.disabled}
            onClick={() => onPick(level)}
            data-slot="tree-select-pick-level"
          >
            「{level.label}」を選ぶ
          </Button>
        </div>
      )}
    </div>
  );
}

/** G: 検索を主にした形。打っていないときは木（treeProps の面）のまま */
export function SearchPanel({
  index,
  selected,
  onPick,
  label,
  autoFocus,
  treeProps,
}: AlternativeProps & { treeProps: TreeSelectPanelProps }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);
  const text = query.trim().toLowerCase();
  // 打った文字を名前に含む行を、木の順に平らに並べる（親も 1 行の候補）
  const results = useMemo(
    () => (text ? index.order.filter((node) => node.label.toLowerCase().includes(text)) : []),
    [index, text]
  );
  const rowElements = () =>
    Array.from(
      bodyRef.current?.querySelectorAll<HTMLElement>(
        text ? '[role="option"]' : '[data-slot="tree-select-item"][tabindex="0"]'
      ) ?? []
    );

  return (
    <div className={`flex min-w-0 flex-col ${panelText}`}>
      {/* 検索欄。面に溶かす形（CommandPalette の検索欄と同じ考え方）で、下の区切り線で候補と分ける */}
      <div className="flex h-(--spacing-control) shrink-0 items-center border-b-(length:--border-width-thin) border-surface-line">
        <span aria-hidden className="flex shrink-0 ps-(--spacing-control-x) text-fg-muted">
          <MagnifyingGlassIcon />
        </span>
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label={`${label}を探す`}
          placeholder="名前で探す"
          className="h-full min-w-0 flex-1 bg-transparent ps-2 pe-(--spacing-control-x) outline-none placeholder:text-(color:--field-placeholder)"
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              rowElements()[0]?.focus();
            } else if (event.key === 'Enter' && results[0] && !results[0].disabled) {
              event.preventDefault();
              onPick(results[0]);
            }
          }}
        />
      </div>
      <div ref={bodyRef} className="flex min-h-0 flex-col">
        {!text ? (
          <TreeSelectPanel {...treeProps} autoFocus={false} />
        ) : (
          <ScrollFrame
            slot="tree-select-scroll"
            focusable={false}
            viewportClassName={scrollViewport}
            contentStyle={{ minWidth: 0 }}
            inlineEdges={false}
            orientation="vertical"
            scrollbarClassName="my-(--spacing)"
          >
            {results.length === 0 ? (
              <p className="flex min-h-(--spacing-control) items-center px-(--tree-row-px) text-fg-muted">
                当たる行がありません
              </p>
            ) : (
              <div role="listbox" aria-label={label}>
                {results.map((node, at) => {
                  const isSelected = node.value === selected;
                  const parents = ancestorsOf(node);
                  return (
                    <div
                      key={keyOf(node)}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={node.disabled || undefined}
                      data-slot="tree-select-item"
                      data-disabled={node.disabled ? '' : undefined}
                      tabIndex={-1}
                      className={slots.row({
                        className:
                          'hover:not-data-disabled:bg-field focus-visible:bg-field [--tree-depth:0]',
                      })}
                      onClick={() => {
                        if (!node.disabled) onPick(node);
                      }}
                      onKeyDown={(event) => {
                        // いちばん上の候補で ↑ を押すと、検索欄へ戻る
                        if (event.key === 'ArrowUp' && at === 0) {
                          event.preventDefault();
                          inputRef.current?.focus();
                          return;
                        }
                        if (moveInList(event, rowElements(), at)) return;
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          if (!node.disabled) onPick(node);
                        }
                      }}
                    >
                      {/* パスつきの候補。親と区切りは一段淡く（欄の文と同じ） */}
                      <span data-slot="tree-label" className={slots.label()}>
                        {parents.length > 0 && (
                          <span className="font-normal text-fg-muted">
                            {parents.map((parent) => parent.label).join(' / ')}
                            {' / '}
                          </span>
                        )}
                        {node.label}
                      </span>
                      {isSelected && (
                        <span aria-hidden className={slots.check()}>
                          <CheckIcon />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollFrame>
        )}
      </div>
    </div>
  );
}
