import { focusRing } from '../../internal/focus-styles';
import { tv } from '../../internal/tv';

// 開閉の行と中身の見た目。Accordion・FileTree など、開閉を土台にする部品もこれを使う
// 値は design/tokens.css の --collapsible-*
//   行: 行全体を押せるので、hover で行を淡く塗り、押しても濃くしない（原則3。一覧の項目と同じグレー）
//     塗りは --collapsible-row-fill に置き、background-color ではなく変数を動かす（ADR-0112）
//     ふだん・開いているとき・hover・開いていて hover の塗りは、見た目（appearance）ごとに root で決める
//     押せる範囲は見えている行の範囲（原則7）。区切り線か塗りで範囲を見せる
//   フォーカスの線はキーボードのときだけ行に出す（原則2。focusRing）
//   開閉の印は題の右（▼ → ▲）か左（▶ → ▼）。動きを減らす設定では回さずに切り替える
//   中身は高さを 0 から Base UI が測った高さ（--collapsible-panel-height）まで動かす
//     動きを減らす設定では、ふわっと出る動きをなくしてすぐに出す（原則3）
//   中身の上下の余白は、行の上下の余白（--collapsible-pad-y）と見た目でそろえる。塗った行の面の中の余白と、面の下端から中身までが同じに見える

// 区切り線のとき、隣の行と重ならないよう線の内側に、外側と同じだけ（--focus-ring-offset）離して描く
const focusInside = '[outline-offset:calc(-1*(var(--focus-ring-width)+var(--focus-ring-offset)))]';

export const collapsibleStyles = tv({
  slots: {
    root: [
      // 行の左右の余白（題と中身の左端）と上下の余白
      '[--collapsible-pad-x:var(--spacing-control-x)]',
      '[--collapsible-pad-y:calc((var(--spacing-control)-var(--leading-control))/2)]',
    ],
    trigger: [
      'group/collapsible-trigger flex w-full cursor-pointer items-center gap-(--collapsible-gap) text-left',
      'min-h-(--spacing-control) px-(--collapsible-pad-x) py-(--collapsible-pad-y)',
      'rounded-control text-(length:--text-control) leading-(--leading-control) text-fg',
      // 塗り。ふだん・開いているとき・hover・開いていて hover。押しているあいだも hover と同じ
      'bg-(color:--collapsible-row-fill) [--collapsible-row-fill:var(--collapsible-fill)]',
      'data-panel-open:[--collapsible-row-fill:var(--collapsible-fill-open)]',
      'not-data-disabled:hover:[--collapsible-row-fill:var(--collapsible-fill-hover)] not-data-disabled:active:[--collapsible-row-fill:var(--collapsible-fill-hover)]',
      'not-data-disabled:data-panel-open:hover:[--collapsible-row-fill:var(--collapsible-fill-open-hover)] not-data-disabled:data-panel-open:active:[--collapsible-row-fill:var(--collapsible-fill-open-hover)]',
      ...focusRing,
      '[transition:--collapsible-row-fill_var(--duration-field)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
      // 押せないときは、ほかの押せない文字と同じグレー（原則1）
      'data-disabled:cursor-not-allowed data-disabled:text-(color:--color-on-neutral-disabled)',
    ],
    // 題はいつも太字
    title: 'min-w-0 flex-1 font-bold',
    indicator: [
      'flex shrink-0 text-fg-muted',
      'group-data-disabled/collapsible-trigger:text-(color:--color-on-neutral-disabled)',
      'transition-[rotate] duration-(--collapsible-duration) ease-(--collapsible-ease) motion-reduce:[transition:none]',
    ],
    panel: [
      'h-(--collapsible-panel-height) overflow-hidden',
      'transition-[height,opacity] duration-(--collapsible-duration) ease-(--collapsible-ease)',
      'data-ending-style:h-0 data-starting-style:h-0',
      'data-ending-style:opacity-(--collapsible-start-opacity) data-starting-style:opacity-(--collapsible-start-opacity)',
      'motion-reduce:[transition:none]',
    ],
    // 中身の余白と、そのまま置いた文の大きさ（本文）。左右は行の題にそろえる（印が左にあるときは、印と間の分を足す）
    //   上下は行の上下の余白から、本文と題の行送りの差の半分を引く（字の上下の空きを含めて、行の中の余白とそろえる）
    content: [
      'py-[max(0px,calc(var(--collapsible-pad-y)-(var(--leading-body)-var(--leading-control))/2))] text-body text-fg',
      'ps-[calc(var(--collapsible-pad-x)+var(--collapsible-panel-inset,0px))] pe-(--collapsible-pad-x)',
    ],
  },
  variants: {
    appearance: {
      // 塗りなし。hover だけ入力欄のグレーを敷く
      plain: {
        root: '[--collapsible-fill-hover:var(--color-field)] [--collapsible-fill-open-hover:var(--color-field)] [--collapsible-fill-open:transparent] [--collapsible-fill:transparent]',
      },
      // 開いている行を入力欄のグレーで塗る。hover で半段濃く
      'open-filled': {
        root: '[--collapsible-fill-hover:var(--color-field)] [--collapsible-fill-open-hover:var(--color-field-hover)] [--collapsible-fill-open:var(--color-field)] [--collapsible-fill:transparent]',
      },
      // いつも入力欄のグレー。hover で半段濃く（入力欄と同じ）。続けて置いた行は面がつながらないよう少し離す
      filled: {
        root: [
          '[--collapsible-fill-hover:var(--color-field-hover)] [--collapsible-fill-open-hover:var(--color-field-hover)] [--collapsible-fill-open:var(--color-field)] [--collapsible-fill:var(--color-field)]',
          '[[data-slot=collapsible]+&]:mt-(--collapsible-row-gap)',
        ],
      },
      // 行と中身の上下に区切り線。続けて置いた行のあいだの線は 1 本に重ねる。角はなく、hover で淡く塗る
      divided: {
        root: [
          '[--collapsible-fill-hover:var(--color-field)] [--collapsible-fill-open-hover:var(--color-field)] [--collapsible-fill-open:transparent] [--collapsible-fill:transparent]',
          'border-y-(length:--border-width-thin) border-line',
          '[[data-slot=collapsible]+&]:-mt-(--border-width-thin)',
        ],
        trigger: ['rounded-none', focusInside],
      },
    },
    indicator: {
      // 題の右。閉じているとき ▼、開くと 180° 回って ▲（Select の ▼ と同じ位置と向き）
      end: {
        indicator: 'rotate-0 group-data-panel-open/collapsible-trigger:rotate-180',
      },
      // 題の左。閉じているとき ▶、開くと 90° 回って ▼。中身は題の頭にそろえて字下げする
      start: {
        root: '[--collapsible-panel-inset:calc(var(--spacing-icon)+var(--collapsible-gap))]',
        indicator: '-order-1 -rotate-90 group-data-panel-open/collapsible-trigger:rotate-0',
      },
    },
  },
  defaultVariants: { appearance: 'plain', indicator: 'end' },
});
