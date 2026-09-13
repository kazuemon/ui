import { createContext } from 'react';

/** Form（src/components/Form.tsx）が中の欄に配る値 — design/adr/0044 */
export interface FormSubmitState {
  /**
   * 送信した回数。欄は、送信で出た（変わった）エラー・警告の行を、読み上げで知らせない
   * 送信したときは、フォーカスの移る先（最初のエラーの欄の説明か、エラーの一覧）で読むので、二重に読まないため
   */
  submitCount: number;
}

export const FormSubmitContext = createContext<FormSubmitState | null>(null);
