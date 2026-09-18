import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';

// 出入りの状態。Base UI の重なる部品と同じ段を、公開の API にないので小さく持つ
//   starting: 描いた直後。data-starting-style を付けて出はじめの姿にし、次のフレームで外して動かす
//   open: 出ている。ending: data-ending-style を付けて消える動きの途中。closed: 消えた
//   動きの終わりは、要素の動き（getAnimations）が全部終わるのを待つ。動きを減らす設定では動きがないので、すぐ終わる
export type TransitionStatus = 'starting' | 'open' | 'ending' | 'closed';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function waitAnimations(element: HTMLElement | null) {
  if (!element || typeof element.getAnimations !== 'function') return Promise.resolve();
  return Promise.all(element.getAnimations().map((animation) => animation.finished)).then(
    () => undefined
  );
}

interface Options {
  /** 描きはじめ（show が true で描いたとき）にも動かすか */
  appear: boolean;
  /** 消える直前に呼ぶ。collapse は高さを測って px に固定する */
  beforeExit?: (element: HTMLElement) => void;
  /** 出る動きの最初のフレームで呼ぶ。collapse は高さを測る */
  beforeEnter?: (element: HTMLElement) => void;
  /** 出る動きが終わったとき */
  onEntered?: (element: HTMLElement) => void;
  /** 消える動きが終わったとき */
  onExited?: () => void;
}

export function useTransitionStatus(
  show: boolean,
  ref: RefObject<HTMLElement | null>,
  { appear, beforeEnter, beforeExit, onEntered, onExited }: Options
) {
  const [status, setStatus] = useState<TransitionStatus>(() =>
    show ? (appear ? 'starting' : 'open') : 'closed'
  );
  // 最新の呼び出し先。途中で show が変わったら、古い待ちの結果は捨てる
  const callbacks = useRef({ beforeEnter, beforeExit, onEntered, onExited });
  const statusRef = useRef(status);
  const run = useRef(0);
  const first = useRef(true);
  // 描いたあとで最新にする（下の effect より先に走る）
  useIsomorphicLayoutEffect(() => {
    callbacks.current = { beforeEnter, beforeExit, onEntered, onExited };
    statusRef.current = status;
  });

  // show が変わったら、段を進める
  useIsomorphicLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const current = statusRef.current;
    if (show) {
      if (current !== 'open') setStatus('starting');
    } else if (current !== 'closed') {
      if (ref.current) callbacks.current.beforeExit?.(ref.current);
      setStatus('ending');
    }
  }, [show]);

  // starting: 出はじめの姿を 1 フレーム描いてから外す。open・ending: 動きの終わりを待つ
  useIsomorphicLayoutEffect(() => {
    const id = ++run.current;
    const element = ref.current;
    if (status === 'starting') {
      if (element) callbacks.current.beforeEnter?.(element);
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (run.current === id) setStatus('open');
        });
      });
      return () => cancelAnimationFrame(frame);
    }
    if (status === 'open' || status === 'ending') {
      let cancelled = false;
      const frame = requestAnimationFrame(() => {
        waitAnimations(ref.current)
          .then(() => {
            if (cancelled || run.current !== id) return;
            if (status === 'open') {
              if (ref.current) callbacks.current.onEntered?.(ref.current);
            } else {
              setStatus('closed');
              callbacks.current.onExited?.();
            }
          })
          // 途中で逆向きに切り替わると、動きが取り消されて finished が失敗する。次の段が引き継ぐ
          .catch(() => {});
      });
      return () => {
        cancelled = true;
        cancelAnimationFrame(frame);
      };
    }
    return undefined;
  }, [status]);

  return status;
}
