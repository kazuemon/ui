'use client';

import { createContext } from 'react';

// Fieldset の状態を中の欄に届ける。Base UI の Field.Root も Fieldset の disabled を読むが、
// うちの Field は本体と見た目に自分の disabled を渡すので、同じ値をここから足す
// invalid は、まとまりのエラーで中の欄もエラーの見た目にするか（軸 391 の比較のためだけ）
export const FieldsetContext = createContext<{ disabled: boolean; invalid: boolean }>({
  disabled: false,
  invalid: false,
});
