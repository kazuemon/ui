import { type ComponentProps, useEffect, useState } from 'react';

import { Gallery } from '../../src/components/gallery/Gallery';
import { galleryImages } from '../../src/samples/images';

// 軸 290〜293（Gallery）の比較で使う枠。決まったら軸のストーリーと一緒に消す
// 拡大した面は画面に固定して出るので、枠を位置の基準にする（transform）。候補のトークンは Comparison が行に当てる

// 開いたまま並べると、最後に開いた面の × にフォーカスが残り、線が 1 つだけ出る。比べやすいよう外す
function useBlurZoomFocus(open?: boolean) {
  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(() => {
      const active = document.activeElement;
      if (active instanceof HTMLElement && active.closest('[data-slot="image-zoom"]'))
        active.blur();
    }, 300);
    return () => clearTimeout(timer);
  }, [open]);
}

const sizes = {
  // パソコンの画面の代わり（マウス用の密度）
  desktop: { density: 'fine', className: 'h-[440px] w-[640px]' },
  // スマートフォンの画面の代わり（指用の密度）
  phone: { density: 'coarse', className: 'h-[600px] w-[340px]' },
} as const;

/**
 * 記事の画面の代わり。見出し・文の行・Gallery を並べる
 * open を渡すと開いたまま描く（裏は止めない）。閉じても、画像を押すとまた開ける
 */
export function GalleryFrame({
  device,
  open,
  defaultValue = 1,
  ...props
}: { device: keyof typeof sizes; open?: boolean } & Omit<
  ComponentProps<typeof Gallery>,
  'open' | 'portalContainer' | 'items'
> & { items?: ComponentProps<typeof Gallery>['items'] }) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const size = sizes[device];
  useBlurZoomFocus(open);
  return (
    <div
      ref={setFrame}
      data-density={size.density}
      className={`relative ${size.className} [transform:translateZ(0)] overflow-clip rounded-card border border-line bg-bg`}
    >
      <div className="flex flex-col gap-3 p-5">
        <div className="h-5 w-2/3 rounded-sm bg-field" />
        <div className="flex flex-col gap-2">
          <div className="h-2.5 w-full rounded-sm bg-field" />
          <div className="h-2.5 w-11/12 rounded-sm bg-field" />
        </div>
        {frame && (
          <Gallery
            items={galleryImages}
            defaultValue={defaultValue}
            {...props}
            {...(open ? { defaultOpen: true, modal: false } : {})}
            portalContainer={frame}
          />
        )}
        <div className="flex flex-col gap-2">
          <div className="h-2.5 w-full rounded-sm bg-field" />
          <div className="h-2.5 w-3/4 rounded-sm bg-field" />
        </div>
      </div>
    </div>
  );
}

const pageSizes = {
  desktop: { density: 'fine', className: 'w-[640px]' },
  phone: { density: 'coarse', className: 'w-[340px]' },
} as const;

/**
 * 記事の画面の代わりに、閉じた Gallery を置く（軸 292・293。並べたときの見た目を比べる）
 * 押すと拡大できる
 */
export function GalleryPage({
  device,
  ...props
}: { device: keyof typeof pageSizes } & Omit<
  ComponentProps<typeof Gallery>,
  'portalContainer' | 'items'
> & { items?: ComponentProps<typeof Gallery>['items'] }) {
  const size = pageSizes[device];
  return (
    <div
      data-density={size.density}
      className={`${size.className} flex flex-col gap-3 rounded-card border border-line bg-bg p-5`}
    >
      <div className="h-5 w-2/3 rounded-sm bg-field" />
      <div className="flex flex-col gap-2">
        <div className="h-2.5 w-full rounded-sm bg-field" />
        <div className="h-2.5 w-11/12 rounded-sm bg-field" />
      </div>
      <Gallery items={galleryImages} {...props} />
      <div className="flex flex-col gap-2">
        <div className="h-2.5 w-full rounded-sm bg-field" />
        <div className="h-2.5 w-3/4 rounded-sm bg-field" />
      </div>
    </div>
  );
}
