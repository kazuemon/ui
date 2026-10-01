import { type ReactNode, useEffect, useState } from 'react';

// 軸 511〜514 の比較で、開いた Dialog・Drawer を表のセルの中に並べる枠（軸が決まったら一緒に消す）
//   枠を位置の基準にし（transform）、面をこの中に描く（portalContainer）
//   いくつも同時に開くので、面は modal={false} で開き、後ろの暗さは枠の中に敷いた面で真似る（ページのスクロールを止めないため）

export function OverlayFrame({
  children,
  width = 440,
  height = 360,
  density = 'fine',
  scroll,
}: {
  children: (frame: HTMLElement) => ReactNode;
  width?: number;
  height?: number;
  density?: 'fine' | 'coarse';
  /** 開いたあと、スクロールする要素をこの割合（0〜1）までスクロールしておく */
  scroll?: { selector: string; ratio: number };
}) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!frame || !scroll) return undefined;
    const timer = window.setTimeout(() => {
      const target = frame.querySelector<HTMLElement>(scroll.selector);
      if (!target) return;
      target.scrollTop = (target.scrollHeight - target.clientHeight) * scroll.ratio;
    }, 400);
    return () => window.clearTimeout(timer);
  }, [frame, scroll]);
  return (
    <div
      ref={setFrame}
      data-density={density}
      style={{ width, height }}
      className="relative max-w-full [transform:translateZ(0)] overflow-clip rounded-card border border-line bg-bg"
    >
      <div className="flex flex-col gap-2 p-4 text-sm text-fg-muted">
        <p>後ろの画面</p>
      </div>
      <div aria-hidden className="absolute inset-0 bg-backdrop" />
      {frame && children(frame)}
    </div>
  );
}
