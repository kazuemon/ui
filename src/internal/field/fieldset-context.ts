'use client';

import { createContext } from 'react';

// Fieldset の状態を中の欄に届ける。Base UI の Field.Root も Fieldset の disabled を読むが、
// うちの Field は本体と見た目に自分の disabled を渡すので、同じ値をここから足す
// invalid は、まとまりのエラー（欄どうしを照らし合わせた結果）で、中の欄もエラーの見た目にする（design/adr/0372）
// errorIds は、開いているまとまりのエラーの行の id（外のまとまりから順）。中の欄の説明の先頭につなぐ
export const FieldsetContext = createContext<{
  disabled: boolean;
  invalid: boolean;
  errorIds: string | undefined;
}>({
  disabled: false,
  invalid: false,
  errorIds: undefined,
});

/** まとまりのエラーの行の id を、欄の説明（aria-describedby の id の並び）の先頭に足す。見た目の順（まとまりの行は欄より上） */
export const withFieldsetErrors = (errorIds: string | undefined, describedBy: string | undefined) =>
  [errorIds, describedBy].filter(Boolean).join(' ') || undefined;
