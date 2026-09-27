import { tv } from '../../internal/tv';

// Inspector の見た目 — 軸 350〜355（比較中）
//   押しのける形（push）: ページと同じレイヤー。影を付けず、面と線で本文と分ける（原則1）。角は丸めない（領域の端に着く）
//     枠（frame）の幅を 0 ⇄ パネルの幅で滑らせ、本文を押しのける（原則14「内容が押されるときは、跳ばずに滑らせる」）
//     パネルは枠の本文の側の端に着けておく。枠が広がるにつれ、パネルが領域の端から滑り出て見える
//   重なる形（overlay）: 領域の中で本文の上に重なる面。影は本文の側へ向ける（原則1）。本文の側の角をカードの角に丸める（原則5・Drawer の横のパネルと同じ）
//     パネルを領域の端の外から滑らせる（原則14）。領域（InspectorLayout）が外を切り取るので、画面の最上層には出ない
//   どちらも、閉じた動きが終わったら visibility で隠す（読み上げとフォーカスからも外れる）。閉じるほうを短くする
//   値はすべて design/tokens.css の --inspector-*
export const inspectorStyles = tv({
  slots: {
    frame: 'shrink-0',
    panel: [
      'flex h-full min-h-0 flex-col text-(length:--text-control) leading-(--leading-control) text-fg outline-none [--sheet-inset:0px]',
      '[transition-timing-function:var(--inspector-ease)] motion-reduce:transition-none',
      // 開くときは duration-in、閉じるときは duration-out（原則14: 閉じるほうを短くする）
      'duration-(--inspector-duration-out) data-open:duration-(--inspector-duration-in)',
      // 閉じた動きが終わったら隠す（visibility は、見えなくなる向きでは動きの終わりに切り替わる）
      'invisible data-open:visible',
    ],
  },
  variants: {
    variant: {
      push: {
        frame: [
          'relative h-full w-0 max-w-full overflow-hidden data-open:w-(--inspector-width)',
          'transition-[width] [transition-timing-function:var(--inspector-ease)] motion-reduce:transition-none',
          'duration-(--inspector-duration-out) data-open:duration-(--inspector-duration-in)',
        ],
        panel: [
          'absolute inset-y-0 w-(--inspector-width) border-(--inspector-push-line) bg-(--inspector-push-bg)',
          'transition-[visibility]',
        ],
      },
      overlay: {
        frame: [
          'pointer-events-none absolute inset-y-(--inspector-overlay-inset) z-10',
          'w-(--inspector-width) max-w-[calc(100%-var(--inspector-overlay-gap)-var(--inspector-overlay-inset))]',
        ],
        panel: [
          'pointer-events-auto w-full border-surface-line bg-surface',
          'border-y-(length:--inspector-overlay-edge-line-width)',
          'transition-[transform,visibility,box-shadow]',
        ],
      },
    },
    side: {
      left: { frame: 'order-first' },
      right: { frame: 'order-last' },
    },
  },
  compoundVariants: [
    // 押しのける形: パネルは本文の側の端に着け、本文の側に線を引く
    {
      variant: 'push',
      side: 'right',
      class: { panel: 'left-0 border-l-(length:--inspector-push-line-width)' },
    },
    {
      variant: 'push',
      side: 'left',
      class: { panel: 'right-0 border-r-(length:--inspector-push-line-width)' },
    },
    // 重なる形: 領域の端から出る。影と角は本文の側へ向ける
    {
      variant: 'overlay',
      side: 'right',
      class: {
        frame: 'right-(--inspector-overlay-inset)',
        panel: [
          'border-r-(length:--inspector-overlay-edge-line-width) border-l-(length:--inspector-overlay-line-width)',
          'rounded-l-(--inspector-overlay-radius-inner) rounded-r-(--inspector-overlay-radius-outer)',
          '[box-shadow:var(--inspector-overlay-shadow-right)]',
          '[transform:translateX(calc(100%+var(--inspector-overlay-inset)))] data-open:[transform:none]',
        ],
      },
    },
    {
      variant: 'overlay',
      side: 'left',
      class: {
        frame: 'left-(--inspector-overlay-inset)',
        panel: [
          'border-r-(length:--inspector-overlay-line-width) border-l-(length:--inspector-overlay-edge-line-width)',
          'rounded-l-(--inspector-overlay-radius-outer) rounded-r-(--inspector-overlay-radius-inner)',
          '[box-shadow:var(--inspector-overlay-shadow-left)]',
          '[transform:translateX(calc(-100%-var(--inspector-overlay-inset)))] data-open:[transform:none]',
        ],
      },
    },
  ],
  defaultVariants: { variant: 'push', side: 'right' },
});

// 本文とパネルを並べる領域。上に帯（header）、その下に本文とパネルの行
// 行は、重なる形のパネルと滑る途中のパネルをこの中で切り取る（画面の最上層には出さない）。isolate で重なりの順をこの中に閉じ込める
// 本文はこの中でスクロールする
export const inspectorLayoutStyles = tv({
  slots: {
    root: 'flex h-full min-h-0 flex-col',
    body: 'relative isolate flex min-h-0 flex-1 overflow-hidden',
    main: 'min-w-0 flex-1 overflow-auto',
  },
});
