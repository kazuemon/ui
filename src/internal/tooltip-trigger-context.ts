'use client';

import { createContext } from 'react';

// Tooltip が、本体（trigger）として描く要素に「Tooltip の本体である」ことを配る
// Button はこれを読み、押せないとき（disabled）もフォーカスできる形（focusableWhenDisabled）を既定にする
//   効くのは本体そのものとして描くボタンだけ。本体に入れ物（ツールバーなど）を渡したときは、中のボタンに効かない
//   そのため、Tooltip は本体の要素の子に、Button は自分の子に、false を配り直す
//   押せないボタンは disabled 属性があるとフォーカスも hover も受けず、Tooltip（押せない理由など）が出ないため
//   利用者が focusableWhenDisabled={false} を渡したときは、そちらを優先する
export const TooltipTriggerContext = createContext(false);
