'use client';

import { createContext } from 'react';

// Fieldset の状態を中の欄に届ける。Base UI の Field.Root も Fieldset の disabled を読むが、
// うちの Field は本体と見た目に自分の disabled を渡すので、同じ値をここから足す
// invalid は、まとまりのエラー（欄どうしを照らし合わせた結果）で、中の欄もエラーの見た目にする（design/adr/0372）
export const FieldsetContext = createContext<{ disabled: boolean; invalid: boolean }>({
  disabled: false,
  invalid: false,
});
