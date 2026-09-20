'use client';

import { createContext, use } from 'react';

/**
 * フォーム全体を送っているあいだの欄の扱い（後半の軸 38）
 * blocking: 欄を止め、押せない欄と同じ見た目にする（loadingBehavior="blocking" と同じ見た目・振る舞い。印は出さない）。フォーカスは外さず、値も送られる
 * none: 欄は何も変えない。印はボタンだけ
 * 比べて採らなかった形（見た目はそのまま書き換えだけ止める・disabled にする）は、比較のストーリーの中で再現する
 */
export type FormSubmittingBehavior = 'blocking' | 'none';

/** Form（src/components/Form.tsx）が中の欄に配る値 — design/adr/0044 */
export interface FormSubmitState {
  /**
   * Form がエラーへフォーカスを移しに行った回数。送信したときと、送信中が終わり（submitting が true から false）、
   * 送ったときの場所にフォーカスが残っていたときに増える。送っているあいだに別の欄へ移っていたときは増えない
   * 欄は、この回数が変わった描画で出た（変わった）エラー・警告の行を、読み上げで知らせない
   * フォーカスの移る先（最初のエラーの欄の説明か、エラーの一覧）で読むので、二重に読まないため
   */
  focusCount: number;
  /** フォーム全体を送っているあいだ（Form の submitting） */
  submitting: boolean;
  /** 送っているあいだの欄の扱い（Form の submittingBehavior） */
  submittingBehavior: FormSubmittingBehavior;
  /**
   * 送っているあいだに、送信中の印（回る円・線）を出す送信のボタン。送っていないときは null
   * 押したボタン（SubmitEvent.submitter）。Enter で送ったときは、フォームの最初の送信のボタン（ブラウザの既定と同じ）
   * 送信なしに submitting になったときも、フォームの最初の送信のボタンにする
   * 送信のボタン（type="submit" の Button）は、自分がこれなら印を出し、ほかは押せない見た目にするだけにする
   */
  submitter: Element | null;
}

export const FormSubmitContext = createContext<FormSubmitState | null>(null);

/** Form の送信中に、欄をどう止めるか。Form の外や、送っていないときは false */
export interface FormSubmittingLock {
  /** 押せない欄と同じ見た目にし、書き換えられなくする（readOnly・aria-disabled）。印は出さない */
  blocking: boolean;
}

/** 欄（Field・TextField・Select）が、Form の送信中の扱いを読む */
export function useFormSubmittingLock(): FormSubmittingLock {
  const state = use(FormSubmitContext);
  return { blocking: !!state?.submitting && state.submittingBehavior === 'blocking' };
}

/**
 * チェックボックス・ラジオ・トグルが、値を変えられないあいだ（Form の送信中と、読み取り専用）の扱いを読む
 * どちらも readOnly で止め、見た目は押せないときの規則が読む data-disabled を付けて、押せない箱・トグルと同じにする
 * disabled は付けないので、フォーカスは外れず、値も送られる。もともと押せない（disabled）ときは何もしない
 *
 * 読み取り専用（readOnly。軸 177）と送信中の違いは、読み上げと、横の文字とカーソルだけ
 * - 送信中は aria-disabled を付け、横の文字も押せないときの薄いグレーにする（いまは操作できない）
 * - 読み取り専用は aria-disabled を付けない。Base UI が出す aria-readonly で「読み取り専用」と伝える
 *   横の文字は本文と同じ色のまま（読むための文字なので薄くしない — 原則13）。カーソルは禁止の形にしない
 *   その差は readOnlyLook が true のとき、部品が className で上書きする
 */
export function useChoiceLock(disabled: boolean | undefined, readOnly?: boolean) {
  const blocking = useFormSubmittingLock().blocking && !disabled;
  const readOnlyLook = !!readOnly && !disabled && !blocking;
  const dimmed = blocking || readOnlyLook;
  return {
    readOnly: blocking || readOnly || undefined,
    ariaDisabled: blocking || undefined,
    data: dimmed ? { 'data-disabled': '' } : {},
    readOnlyLook,
  };
}
