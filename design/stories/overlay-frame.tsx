import { type CSSProperties, type ReactNode, useState } from 'react';

// 重なる面（Dialog・Drawer・Popover・Tooltip）の比較で使う枠。面は画面に固定して出るので、枠を位置の基準にする（transform）
// style には候補のトークンを渡す。密度で変わる値（--overlay-title-* など）は面の中で上書きされるので、ここでは比べられない
export function OverlayFrame({
  density,
  style,
  className,
  children,
}: {
  density: 'fine' | 'coarse';
  style?: CSSProperties;
  className: string;
  children: (frame: HTMLElement) => ReactNode;
}) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setFrame}
      data-density={density}
      style={style}
      className={`relative ${className} [transform:translateZ(0)] overflow-clip rounded-card border border-line bg-bg`}
    >
      {frame && children(frame)}
    </div>
  );
}
