import { tv } from '../../internal/tv';

// Inspector の見た目 — ADR-0320〜0325
//   押しのける形（variant="push"、既定 — ADR-0320）: ページと同じレイヤー。影を付けず、白い面と本文との境の細い線で分ける（原則1・ADR-0323）
//     角は丸めない（領域の端に着く）
//     枠（frame）の幅を 0 ⇄ パネルの幅で滑らせ、本文を押しのける（原則14「内容が押されるときは、跳ばずに滑らせる」）
//     パネルは枠の幅いっぱい（w-full）にし、枠の幅の動きにそのまま従わせる。width に % などを渡したとき、パネルが枠を基準に解いて狭くならないようにする
//   重なる形（variant="overlay"）: 領域の中で本文の上に重なる面。影と輪郭は Drawer の横のパネルと同じで、影は本文の側へ向ける（原則1・ADR-0321）
//     端の形（overlayEdge — ADR-0322）: flush（既定）は領域の端に着け、角を丸めない。輪郭は本文の側だけ
//       floating は領域の端から離し、4 つの角をカードの角に丸め、輪郭を一周させる
//       形の値は枠に内部の CSS 変数（--inspector-inset・--inspector-radius・--inspector-edge-line）として置き、パネルはその変数だけを読む
//     パネルを領域の端の外から滑らせる（原則14）。領域（InspectorLayout）が外を切り取るので、画面の最上層には出ない
//   幅: 既定は Drawer の横のパネルと同じ（--inspector-width — ADR-0324）。部品の width で上書きできる（枠に --inspector-width を書く）
//   開閉の動き（motion — ADR-0325）: slide（既定）は Drawer・シートと同じ長さで滑らせ、閉じるほうを短くする。none は動かさない
//   どちらの形も、閉じた動きが終わったら visibility で隠す（読み上げとフォーカスからも外れる）
export const inspectorStyles = tv({
  slots: {
    frame: 'shrink-0 data-resizing:transition-none',
    // 幅を変えるつまみ（resizable）。本文との境（パネルの本文側の端）に、つかめる幅を半分ずつ重ねる
    handle: 'pointer-events-auto inset-y-0',
    panel: [
      'flex h-full min-h-0 flex-col text-(length:--text-control) leading-(--leading-control) text-fg outline-none [--sheet-inset:0px]',
      '[transition-timing-function:var(--inspector-ease)] motion-reduce:transition-none',
      // 開くときは duration-in、閉じるときは duration-out（原則14: 閉じるほうを短くする）
      'duration-(--inspector-duration-out) data-open:duration-(--inspector-duration-in)',
      // 閉じた動きが終わったら隠す（visibility は、見えなくなる向きでは動きの終わりに切り替わる）
      'invisible data-open:visible',
      // 幅を変えているあいだは、幅の動きを止める（指に遅れないように）
      'data-resizing:transition-none',
    ],
  },
  variants: {
    variant: {
      push: {
        frame: [
          'relative h-full w-0 max-w-full overflow-clip data-open:w-(--inspector-width)',
          // 幅を変えるつまみの半分（本文の側にはみ出す分）を切り取らない
          'data-resizable:[overflow-clip-margin:calc(var(--resize-handle-hit)/2)]',
          'transition-[width] [transition-timing-function:var(--inspector-ease)] motion-reduce:transition-none',
          'duration-(--inspector-duration-out) data-open:duration-(--inspector-duration-in)',
        ],
        panel: ['absolute inset-y-0 w-full border-line bg-surface', 'transition-[visibility]'],
      },
      overlay: {
        frame: [
          'pointer-events-none absolute inset-y-(--inspector-inset) z-10',
          'w-(--inspector-width) max-w-[calc(100%-var(--inspector-overlay-gap)-var(--inspector-inset))]',
        ],
        panel: [
          'pointer-events-auto w-full rounded-(--inspector-radius) border-(length:--inspector-edge-line) border-surface-line bg-surface',
          'transition-[transform,visibility,box-shadow]',
        ],
      },
    },
    side: {
      left: { frame: 'order-first', handle: '-right-[calc(var(--resize-handle-hit)/2)]' },
      right: { frame: 'order-last', handle: '-left-[calc(var(--resize-handle-hit)/2)]' },
    },
    overlayEdge: {
      flush: {
        frame: '[--inspector-edge-line:0px] [--inspector-inset:0px] [--inspector-radius:0px]',
      },
      floating: {
        frame:
          '[--inspector-edge-line:var(--border-width-thin)] [--inspector-inset:var(--inspector-floating-inset)] [--inspector-radius:var(--inspector-floating-radius)]',
      },
    },
    motion: {
      slide: {},
      none: { frame: 'transition-none', panel: 'transition-none' },
    },
  },
  compoundVariants: [
    // 押しのける形: パネルは本文の側の端に着け、本文の側に線を引く
    {
      variant: 'push',
      side: 'right',
      class: { panel: 'left-0 border-l-(length:--border-width-thin)' },
    },
    {
      variant: 'push',
      side: 'left',
      class: { panel: 'right-0 border-r-(length:--border-width-thin)' },
    },
    // 重なる形: 領域の端から出る。影は本文の側へ向け、本文の側にはいつも輪郭を引く
    {
      variant: 'overlay',
      side: 'right',
      class: {
        frame: 'right-(--inspector-inset)',
        panel: [
          'border-l-(length:--border-width-thin)',
          '[box-shadow:var(--inspector-overlay-shadow-right)]',
          '[transform:translateX(calc(100%+var(--inspector-inset)))] data-open:[transform:none]',
        ],
      },
    },
    {
      variant: 'overlay',
      side: 'left',
      class: {
        frame: 'left-(--inspector-inset)',
        panel: [
          'border-r-(length:--border-width-thin)',
          '[box-shadow:var(--inspector-overlay-shadow-left)]',
          '[transform:translateX(calc(-100%-var(--inspector-inset)))] data-open:[transform:none]',
        ],
      },
    },
  ],
  defaultVariants: { variant: 'push', side: 'right', overlayEdge: 'flush', motion: 'slide' },
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
