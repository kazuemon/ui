'use client';

import { createContext } from 'react';

// Tooltip が、本体（trigger）として包んだ中身に「Tooltip の本体の中にいる」ことを配る
// Button はこれを読み、押せないとき（disabled）もフォーカスできる形（focusableWhenDisabled）を既定にする
//   押せないボタンは disabled 属性があるとフォーカスも hover も受けず、Tooltip（押せない理由など）が出ないため
//   利用者が focusableWhenDisabled={false} を渡したときは、そちらを優先する
export const TooltipTriggerContext = createContext(false);
