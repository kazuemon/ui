// 区切りの欄の状態とキー操作（DateField・TimeField）。値の形（PlainDate・PlainTime）は呼ぶ側が決める
import { useRef, useState } from 'react';

import { type HalfWidthKind, halfWidthKind } from '../half-width';
import {
  constrainDay,
  formatSegment,
  type SegmentLayout,
  segmentRange,
  segmentTypes,
  type SegmentType,
  type SegmentValues,
  stepSegment,
  typeDigit,
} from './segments';

/** 打っている途中の文字。まだその区切りに桁を足せるときだけ持つ */
interface Buffer {
  type: SegmentType;
  text: string;
}

interface Model {
  values: SegmentValues;
  buffer: Buffer | null;
}

export interface DateSegmentsOptions<T> {
  layout: SegmentLayout;
  value: T | null | undefined;
  defaultValue: T | null | undefined;
  onValueChange?: (value: T | null) => void;
  /** 区切りの値から、欄の値を作る。そろっていないときは null */
  toValue: (values: SegmentValues) => T | null;
  fromValue: (value: T | null) => SegmentValues;
  equals: (a: T, b: T) => boolean;
  /** 空の区切りで ↑↓ を押したときに入れる値（日付は今日） */
  placeholderValues: () => SegmentValues;
  /** 貼り付けた文字（1 文字より長い入力）を読む。読めないときは null */
  parseText: (text: string) => SegmentValues | null;
  /** ↑↓ の刻み（分など） */
  steps?: Partial<Record<SegmentType, number>>;
  /** 書き換えられるか（押せない・読み取り専用・止めているあいだは false） */
  editable: boolean;
  /** 貼り付けた文字が読めなかったとき */
  onParseFail?: (text: string) => void;
  /**
   * 値が変わったとき、全角の英数字を半角に直したか（直していなければ null）と、区切りがすべて空になったかを渡す
   * 直すのは NFKC（input）で、これは知らせのためだけに呼ぶ
   */
  onHalfWidth?: (kind: HalfWidthKind | null, empty: boolean) => void;
}

const SEPARATORS = new Set(['/', '-', '.', ':', ',', ' ', '年', '月', '日', '時', '分', '秒']);

function same<T>(a: T | null, b: T | null, equals: (a: T, b: T) => boolean) {
  return a === null || b === null ? a === b : equals(a, b);
}

function setValue(values: SegmentValues, type: SegmentType, value: number | undefined) {
  const next = { ...values };
  if (value == null) delete next[type];
  else next[type] = value;
  // 月や年を変えて、日がその月にない日になったら月末に寄せる
  return type === 'day' ? next : constrainDay(next);
}

/**
 * 区切りごとに打つ欄の状態。←→ で区切りを移り、↑↓ で増減（範囲を回る）、数字を打つと埋まって次へ進む
 * Backspace は 1 桁ずつ消し、空の区切りでは前の区切りへ戻る。貼り付けは全体を読んで入れる
 */
export function useDateSegments<T>(options: DateSegmentsOptions<T>) {
  const { layout, toValue, fromValue, equals, editable } = options;
  const order = segmentTypes(layout);
  const initial = options.value !== undefined ? options.value : (options.defaultValue ?? null);
  const [state, setState] = useState<Model & { emitted: T | null }>(() => ({
    values: fromValue(initial),
    buffer: null,
    emitted: initial,
  }));
  // 制御しているときは、外から変わった値に区切りをそろえる（打っている途中の、そろっていない区切りは、値が同じあいだ残す）
  if (options.value !== undefined && !same(options.value, state.emitted, equals)) {
    setState({ values: fromValue(options.value), buffer: null, emitted: options.value });
  }
  const refs = useRef(new Map<SegmentType, HTMLElement>());

  const focus = (type: SegmentType | undefined) => {
    if (type) refs.current.get(type)?.focus();
  };
  const neighbor = (type: SegmentType, delta: number) => order[order.indexOf(type) + delta];

  const commit = (model: Model, converted: HalfWidthKind | null = null) => {
    const next = toValue(model.values);
    setState({ ...model, emitted: next });
    options.onHalfWidth?.(converted, Object.keys(model.values).length === 0);
    if (!same(next, state.emitted, equals)) options.onValueChange?.(next);
  };

  // 1 文字ずつ打つ。進んだ先の区切りを返す（続けて打つとき、次の文字はそこに入る）
  const feed = (model: Model, type: SegmentType, char: string): [Model, SegmentType] => {
    const { values } = model;
    if (type === 'dayPeriod') {
      const lower = char.toLowerCase();
      const period = lower === 'a' ? 0 : lower === 'p' ? 1 : undefined;
      if (period == null) return [model, type];
      return [{ values: setValue(values, type, period), buffer: null }, neighbor(type, 1) ?? type];
    }
    if (/^\d$/.test(char)) {
      const range = segmentRange(type, values, layout);
      const buffer = model.buffer?.type === type ? model.buffer.text : '';
      const typed = typeDigit(type, buffer, char, range);
      const next = {
        values: setValue(values, type, typed.value),
        buffer: typed.buffer ? { type, text: typed.buffer } : null,
      };
      return typed.advance ? [next, neighbor(type, 1) ?? type] : [next, type];
    }
    // 区切りの記号（「/」「:」）を打ったら、埋まっている区切りから次へ進む
    if (SEPARATORS.has(char) && (values[type] != null || model.buffer?.type === type)) {
      return [{ values, buffer: null }, neighbor(type, 1) ?? type];
    }
    return [model, type];
  };

  const model: Model = { values: state.values, buffer: state.buffer };

  /** 文字を入れる。2 文字以上（貼り付け・IME の確定）はまず全体を読み、読めなければ 1 文字ずつ打つ */
  const input = (type: SegmentType, raw: string) => {
    if (!editable) return;
    const text = raw.normalize('NFKC');
    // 全角の英数字を半角に直したか（NFKC が直す）。知らせるかは欄の側（halfWidthNotice）が決める
    const converted = halfWidthKind(raw);
    if (text.length > 1 || /午前|午後/.test(text)) {
      const parsed = options.parseText(text);
      if (parsed) {
        commit({ values: parsed, buffer: null }, converted);
        return;
      }
      if (type === 'dayPeriod' && /^(午前|午後)$/.test(text)) {
        commit(
          { values: setValue(model.values, type, text === '午前' ? 0 : 1), buffer: null },
          converted
        );
        focus(neighbor(type, 1));
        return;
      }
      if (!/^[\d/\-.: ]+$/.test(text)) {
        options.onParseFail?.(raw);
        return;
      }
    }
    let current = model;
    let at = type;
    for (const char of text) [current, at] = feed(current, at, char);
    commit(current, converted);
    if (at !== type) focus(at);
  };

  const step = (type: SegmentType, delta: number) => {
    if (!editable) return;
    const value = model.values[type];
    if (value == null) {
      const placeholder = options.placeholderValues()[type];
      commit({ values: setValue(model.values, type, placeholder), buffer: null });
      return;
    }
    const range = segmentRange(type, model.values, layout);
    const next = stepSegment(value, delta, range, options.steps?.[type]);
    commit({ values: setValue(model.values, type, next), buffer: null });
  };

  const erase = (type: SegmentType) => {
    if (!editable) return;
    const buffer = model.buffer?.type === type ? model.buffer.text : undefined;
    const value = model.values[type];
    if (buffer == null && value == null) {
      focus(neighbor(type, -1));
      return;
    }
    if (type === 'dayPeriod') {
      commit({ values: setValue(model.values, type, undefined), buffer: null });
      return;
    }
    // 1 桁ずつ消す（2026 → 202）。残りが範囲に入らない数（月の 0）なら、値は空にして文字だけ残す
    const rest = (buffer ?? String(value)).slice(0, -1);
    const range = segmentRange(type, model.values, layout);
    const number = rest ? Number(rest) : undefined;
    const next = number != null && number >= range.min && number <= range.max ? number : undefined;
    commit({
      values: setValue(model.values, type, next),
      buffer: rest ? { type, text: rest } : null,
    });
  };

  const clear = (type: SegmentType) => {
    if (!editable) return;
    commit({ values: setValue(model.values, type, undefined), buffer: null });
  };

  const setToEdge = (type: SegmentType, edge: 'min' | 'max') => {
    if (!editable) return;
    const range = segmentRange(type, model.values, layout);
    commit({ values: setValue(model.values, type, range[edge]), buffer: null });
  };

  /** 区切りを離れたら、打っている途中の文字をやめ、値の見え方（0 埋め）に戻す */
  //   同じ操作の中で値を入れてから次の区切りへ移ることがあるので、描いた時点の state ではなく最新の state から消す
  const leave = (type: SegmentType) => {
    setState((current) => (current.buffer?.type === type ? { ...current, buffer: null } : current));
  };

  const onKeyDown = (type: SegmentType, event: React.KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowRight': {
        event.preventDefault();
        focus(neighbor(type, event.key === 'ArrowLeft' ? -1 : 1));
        return;
      }
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        step(type, event.key === 'ArrowUp' ? 1 : -1);
        return;
      case 'Home':
      case 'End':
        event.preventDefault();
        setToEdge(type, event.key === 'Home' ? 'min' : 'max');
        return;
      case 'Backspace':
        event.preventDefault();
        erase(type);
        return;
      case 'Delete':
        event.preventDefault();
        clear(type);
        return;
      case 'Enter':
        // 区切りの中に改行を入れない。フォームの送信はブラウザに任せない（input ではないので送られない）
        event.preventDefault();
        return;
      case 'Tab':
        return;
    }
    if (event.key.length === 1) {
      event.preventDefault();
      input(type, event.key);
    }
  };

  const text = (type: SegmentType): { text: string; placeholder: boolean } => {
    if (state.buffer?.type === type) return { text: state.buffer.text, placeholder: false };
    const value = state.values[type];
    if (value == null) return { text: '', placeholder: true };
    return { text: formatSegment(type, value, layout), placeholder: false };
  };

  return {
    values: state.values,
    value: state.emitted,
    refs,
    order,
    focus,
    input,
    erase,
    leave,
    onKeyDown,
    text,
  };
}
