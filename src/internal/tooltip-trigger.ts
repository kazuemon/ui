// Tooltip が、本体（trigger）として描く要素に足す印の props
// Button はこれが自分の props に来たときだけ、押せないとき（disabled）もフォーカスできる形（focusableWhenDisabled）を既定にする
//   押せないボタンは disabled 属性があるとフォーカスも hover も受けず、Tooltip（押せない理由など）が出ないため
//   印は本体の要素そのものにしか届かない。入れ物（ツールバーなど）や自作の部品を本体にしたときは、その中のボタンには効かない
//   Tooltip を重ねたときは、外の Tooltip が中の Tooltip に印を足し、中の Tooltip が本体のボタンへ渡す
//   利用者が focusableWhenDisabled={false} を渡したときは、そちらを優先する
//   印は data-* なので、Button 以外の要素に届いても DOM の属性になるだけで、害はない
export const TOOLTIP_TRIGGER = 'data-tooltip-trigger';

export interface TooltipTriggerMarkProps {
  /** Tooltip の本体であることの印（内部用。値は空の文字列） */
  [TOOLTIP_TRIGGER]?: string;
}
