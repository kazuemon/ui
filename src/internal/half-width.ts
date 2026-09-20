// 全角の英数字を半角に直す処理と、直したことを知らせる仕組み（MaskField・NumberField・PinField・DateField・TimeField で共有）
// 直すこと自体は黙って行い、知らせるかは使う側が halfWidthNotice で決める（既定は知らせない）
import { type ReactNode, useCallback, useState } from 'react';

/** 直した文字の種類。digit は数字だけ、alnum は英字も含む */
export type HalfWidthKind = 'digit' | 'alnum';

export interface HalfWidthResult {
  value: string;
  /** 直した文字の種類。直していなければ null */
  converted: HalfWidthKind | null;
}

/**
 * 全角の英数字・記号（！〜～）と全角の空白を半角に直す。1 文字を 1 文字に直すので、カーソルの位置はずれない
 * IME を入れたまま数字を打つと全角になるので、書式の桁（半角）に当てはまるように直す
 */
export function toHalfWidth(raw: string): HalfWidthResult {
  let converted: HalfWidthKind | null = null;
  const value = raw.replace(/[！-～　]/g, (char) => {
    if (char === '　') return ' ';
    const half = String.fromCharCode(char.charCodeAt(0) - 0xfee0);
    if (/[0-9]/.test(half)) converted ??= 'digit';
    else if (/[A-Za-z]/.test(half)) converted = 'alnum';
    return half;
  });
  return { value, converted };
}

/**
 * 直さずに、直すことになる文字が入っているかだけを見る（自分では直さない欄のため）
 * NumberField は Base UI が、DateField・TimeField は NFKC が直すので、打った文字から種類だけを読む
 */
export function halfWidthKind(raw: string): HalfWidthKind | null {
  return toHalfWidth(raw).converted;
}

/** 全角を半角に直したことを知らせる口。直す欄（MaskField・NumberField・PinField・DateField・TimeField）で共通 */
export interface HalfWidthNoticeProps {
  /**
   * 全角の英数字を半角に直したときに、本体の下に情報の行で知らせるか。
   * true で「全角の数字を半角に直しました」（英字を直したときは「全角の英数字を半角に直しました」）、文を渡すとその文を出します。
   * `info` を渡したときは `info` を出します
   * @default false
   */
  halfWidthNotice?: ReactNode;
}

/**
 * 全角を半角に直したことの知らせ。値が空になるまで知らせを残し、英字を直したら文を英数字に上げる
 * 返す notice は、Field の info にそのまま渡す（使う側が info を渡したときは、info を優先する）
 */
export function useHalfWidthNotice(halfWidthNotice: ReactNode) {
  const [converted, setConverted] = useState<HalfWidthKind | null>(null);
  // 値が変わるたびに呼ぶ。empty（値が空になった）で知らせを消す
  const noticed = useCallback((kind: HalfWidthKind | null, empty: boolean) => {
    if (empty) setConverted(null);
    else if (kind) setConverted((current) => (current === 'alnum' ? current : kind));
  }, []);
  const notice =
    halfWidthNotice === false || halfWidthNotice == null || !converted
      ? undefined
      : halfWidthNotice === true
        ? converted === 'alnum'
          ? '全角の英数字を半角に直しました'
          : '全角の数字を半角に直しました'
        : halfWidthNotice;
  return { notice, noticed };
}
