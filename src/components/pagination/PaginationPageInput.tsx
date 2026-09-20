'use client';

import { type CSSProperties, type ReactElement, useEffect, useRef } from 'react';

import { controlBox } from '../../internal/field/field-styles';

export interface PaginationPageInputProps {
  /** いまのページ（1 から数える） */
  page: number;
  /** ページの数 */
  count: number;
  /** 欄の読み上げの名前 */
  label: string;
  /** いまのページと総数を伝える文の id（欄の説明につなぐ） */
  describedBy?: string;
  href?: (page: number) => string;
  render?: (page: number) => ReactElement;
  onChange?: (page: number) => void;
}

type TokenStyle = CSSProperties & Record<`--${string}`, string>;

// IME で打った全角の数字を半角にする（「５」→「5」）
const toHalfWidth = (value: string) =>
  value.replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0));

/**
 * いまのページの数を打って移る欄（pageInput）。NumberField と同じ入力欄の本体（原則8）で、
 * 高さは部品の高さ、値の文字は指でも小さくしない（原則11）。
 * Enter か IME の確定で移り、範囲の外の数では移らない。欄を離すと、打った値は元の数に戻る
 */
export function PaginationPageInput({
  page,
  count,
  label,
  describedBy,
  href,
  render,
  onChange,
}: PaginationPageInputProps) {
  // 打ちかけの値は欄そのものが持つ（打っているあいだ、外から書き換えない）
  const inputRef = useRef<HTMLInputElement>(null);
  // IME で変換しているあいだの Enter は確定なので、確定し終えてから移る
  const pending = useRef(false);

  // ページが外から変わったら、打ちかけの値を捨てて合わせる
  useEffect(() => {
    if (inputRef.current) inputRef.current.value = String(page);
  }, [page]);

  const revert = () => {
    pending.current = false;
    if (inputRef.current) inputRef.current.value = String(page);
  };

  const commit = () => {
    pending.current = false;
    // 変換の途中でも、欄そのものは最新の文字を持っている
    const raw = toHalfWidth(inputRef.current?.value ?? '').trim();
    const next = Number(raw);
    // 範囲の外・数でない・いまのページのときは移らない（打った値はそのまま残し、直せるようにする）
    if (raw === '' || !Number.isInteger(next) || next < 1 || next > count || next === page) return;
    onChange?.(next);
    // href だけを渡しているときは、その行き先へそのまま移る（render のときは onChange で移す）
    if (href && render == null && typeof window !== 'undefined') window.location.assign(href(next));
  };

  const style: TokenStyle = { '--pagination-input-chars': String(Math.max(`${count}`.length, 2)) };

  return (
    <div
      data-slot="pagination-page-input"
      className={controlBox({ className: 'w-auto shrink-0' })}
      style={style}
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        enterKeyHint="go"
        aria-label={label}
        aria-describedby={describedBy}
        defaultValue={String(page)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            revert();
            return;
          }
          if (event.key !== 'Enter') return;
          event.preventDefault();
          if (event.nativeEvent.isComposing) {
            pending.current = true;
            return;
          }
          commit();
        }}
        onCompositionEnd={() => {
          if (pending.current) commit();
        }}
        onBlur={revert}
        className="h-full w-[calc(var(--pagination-input-chars)*1ch+2px)] min-w-0 bg-transparent text-center tabular-nums outline-none"
      />
    </div>
  );
}
