import { useState, type PointerEvent } from 'react';

// 押しているあいだ（指やボタンを置いてから離すまで）を、:active ではなく pointer イベントで持つ
//   Chrome はタッチで速く押すと、:active を離したあと（切り替わったあと）に 100〜150ms だけ付けることがある。
//   :active でノブを縮めると、ノブが滑りながら縮んで戻り、ちらつく。pointerdown は指を置いた瞬間に来る
//   押して切り替わるところ（ラベル・トラック）だけを押下にする。列の隙間は押しても切り替わらない
export function usePressed(enabled: boolean) {
  const [pressed, setPressed] = useState(false);
  const release = () => setPressed(false);
  return {
    pressed: enabled && pressed,
    handlers: {
      onPointerDown(event: PointerEvent<HTMLElement>) {
        if (!enabled || event.button !== 0) return;
        if (!(event.target instanceof Element && event.target.closest('label,[role="switch"]'))) {
          return;
        }
        setPressed(true);
      },
      onPointerUp: release,
      onPointerCancel: release,
      onPointerLeave: release,
    },
  };
}
