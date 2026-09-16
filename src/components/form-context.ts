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
 * チェックボックス・ラジオ・トグルが、Form の送信中（blocking）に切り替えを止めるための値（入力欄と同じく、押せない見た目にする）
 * readOnly で止め、見た目は押せないときの規則が読む data-disabled を付けて、押せない箱・トグルと同じにする
 * disabled は付けないので、フォーカスは外れず、値も送られる。もともと押せない（disabled）ときは何もしない
 */
export function useChoiceLock(disabled: boolean | undefined) {
  const locked = useFormSubmittingLock().blocking && !disabled;
  return { readOnly: locked || undefined, data: locked ? { 'data-disabled': '' } : {} };
}
