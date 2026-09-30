'use client';

import { useId, useState } from 'react';

import { countGraphemes } from './count-graphemes';

// 文字数の数え方と、表示の状態（TextField・Textarea で共有）。表示は FieldCount

/** 文字数の props。TextField・Textarea の本体が同じ名前で持つ */
export interface FieldCountProps {
  /**
   * 文字数の上限。超えても打つのは止めず（貼り付けたあとで削れるように）、超えているあいだは文字数を必ず出して、数を赤にします。
   * 超えたとき・戻ったときは読み上げでも知らせます。欄の見た目は overCountInvalid で決めます。送信を止めるのは使う側です（超えていたら errorText を渡す）。
   * 打てなくする上限は、ブラウザの maxLength を使います
   */
  maxCount?: number;
  /**
   * maxCount を超えているあいだ、欄をエラーの状態（赤い枠線・aria-invalid）にするか。エラーの行は出しません。
   * false のときは、数を赤にするだけで、欄は変えません
   * @default true
   */
  overCountInvalid?: boolean;
  /**
   * 上限まで残りこの文字数になったら、上限に近づいたことを予告します。予告のあいだは showCount がなくても文字数を出し、
   * 数を警告の色にします。欄の見た目は変えません（警告は送信を止めないため）。0 を渡すと予告しません
   * @default Math.ceil(上限 / 10)（上限の 10%）
   */
  warnRemaining?: number;
  /**
   * 文字数を本体の右下の下に「12 / 200」の形で出すか。上限（maxCount か maxLength）があるときだけ出します。
   * maxCount を超えているあいだは、false でも出します
   * @default false
   */
  showCount?: boolean;
}

/**
 * 打った文字の数（見えている文字・書記素）を数えます。値を渡されたときはその長さ、渡されないときは打った長さです。
 * 打ったときは onTyped に、いまの文字を渡します
 */
export function useTypedCount(value: string | undefined, defaultValue: string | undefined) {
  const [typed, setTyped] = useState(() => countGraphemes(defaultValue ?? ''));
  const length = value != null ? countGraphemes(value) : typed;
  const onTyped = (text: string) => setTyped(countGraphemes(text));
  return { length, onTyped };
}

/** maxCount を超えているか。内蔵の形が、欄をエラーの状態にするかを決めるのに使う */
export function isOverCount(length: number, maxCount: number | undefined) {
  return maxCount != null && length > maxCount;
}

/**
 * 文字数の表示の状態。counted（出すか）と、説明につなぐ id（describedBy）を返します。
 * 出すものは FieldCount に、そのまま渡します
 */
export function useFieldCount({
  length,
  maxCount,
  maxLength,
  warnRemaining,
  showCount = false,
}: Omit<FieldCountProps, 'overCountInvalid'> & { length: number; maxLength?: number }) {
  const id = useId();
  // 上限は、柔らかい上限（maxCount）を先に使う。maxLength はブラウザが打つのを止めるので、超えない
  const limit = maxCount ?? maxLength;
  const over = isOverCount(length, maxCount);
  // 上限に近づいたことの予告。残りが warnRemaining 以下になったら、数を警告の色にして出す
  //   既定は上限の 10%（上限が小さい欄で、打ちはじめから警告にならない割合）。空のうちは予告しない
  const nearAt = warnRemaining ?? (limit != null ? Math.ceil(limit / 10) : 0);
  const near = !over && limit != null && nearAt > 0 && length > 0 && limit - length <= nearAt;
  const counted = (showCount && limit != null) || over || near;
  // 超えたとき・戻ったときに、1 回だけ読み上げで知らせる（打つたびには知らせない — ADR-0044 と同じく polite）
  // 初めから超えているとき（値を入れて描いたとき）は知らせず、フォーカスしたときの説明で伝える
  const [overState, setOverState] = useState({ over, notice: '' });
  if (overState.over !== over) {
    setOverState({
      over,
      notice: over ? `${maxCount}文字を超えています` : `${maxCount}文字以内に戻りました`,
    });
  }
  const countId = `${id}count`;
  return {
    over,
    counted,
    describedBy: counted ? countId : undefined,
    count: { id: countId, length, limit, over, near, counted, maxCount, notice: overState.notice },
  };
}
