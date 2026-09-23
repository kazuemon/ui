import { type ComponentProps, useEffect, useState } from 'react';

import { ImageZoom } from '../../src/components/image-zoom/ImageZoom';
import { MarkdownArticleScreen } from '../../src/samples/markdown-article';
import { SamplePage } from '../../src/samples/SamplePage';
import { landscape as articleImage } from '../../src/samples/images';

// 軸 279〜283（ImageZoom）の比較で使う枠。決まったら軸のストーリーと一緒に消す
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
  desktop: { density: 'fine', className: 'h-[400px] w-[560px]', thumb: 'w-56' },
  // スマートフォンの画面の代わり（指用の密度）
  phone: { density: 'coarse', className: 'h-[520px] w-[280px]', thumb: 'w-40' },
} as const;

/**
 * 記事の画面の代わり。見出し・文の行・拡大できる画像を並べる。後ろの面の上から、ページがどう透けるかを見る
 * open を渡すと開いたまま描く（裏は止めない）。渡さないと、押して開き、押して閉じる
 */
export function ZoomFrame({
  device,
  open,
  ...props
}: { device: keyof typeof sizes; open?: boolean } & Omit<
  ComponentProps<typeof ImageZoom>,
  'open' | 'portalContainer'
>) {
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
          <div className="h-2.5 w-4/5 rounded-sm bg-field" />
        </div>
        {frame && (
          <div className={size.thumb}>
            <ImageZoom
              {...props}
              {...(open ? { open: true, modal: false } : {})}
              portalContainer={frame}
            />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <div className="h-2.5 w-full rounded-sm bg-field" />
          <div className="h-2.5 w-3/4 rounded-sm bg-field" />
        </div>
      </div>
    </div>
  );
}

const articleSizes = {
  // パソコンの画面の代わり（マウス用の密度）
  desktop: { density: 'fine', className: 'h-[600px] w-[960px]' },
  // スマートフォンの画面の代わり（指用の密度）
  phone: { density: 'coarse', className: 'h-[667px] w-[375px]' },
} as const;

/**
 * 見本のページ（src/samples）の記事に、冒頭の画像として ImageZoom を置き、拡大した状態で描く（軸 283）
 * 後ろの面から、実際の記事の見出し・文・ヘッダーがどう透けるかを見る。閉じて、画像を押すとまた開ける
 */
export function ArticleZoomFrame({
  device,
  variant,
}: {
  device: keyof typeof articleSizes;
  variant?: ComponentProps<typeof ImageZoom>['variant'];
}) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const size = articleSizes[device];
  const [open, setOpen] = useState(true);
  useBlurZoomFocus(true);
  return (
    <div
      ref={setFrame}
      className={`relative ${size.className} [transform:translateZ(0)] overflow-clip rounded-card border border-line bg-bg`}
    >
      <SamplePage density={size.density}>
        {frame && (
          <ImageZoom
            open={open}
            onOpenChange={setOpen}
            modal={false}
            variant={variant}
            portalContainer={frame}
            figureProps={{ className: 'mb-8' }}
            src={articleImage}
            alt="空と山の絵"
            width={1600}
            height={900}
            caption="図 1. 空と山"
          />
        )}
        <MarkdownArticleScreen />
      </SamplePage>
    </div>
  );
}
