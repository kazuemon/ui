import { focusRing } from '../focus-styles';
import { tv } from '../tv';

// 押すと拡大する画像のボタン（ImageZoom の画像・Gallery の並べた画像）
// 押す口は画像を包むボタン。画像はページと同じレイヤーのまま浮かせない（原則1）。押せることは、
//   zoom-in のカーソル、hover とキーボードのフォーカスで右下に出る虫眼鏡の印（--image-zoom-cue-*）、フォーカスの線で見せる
//   showZoomIcon のときは、印をいつも出す（マウスのない指の画面でも見える）（軸 282）
//   押すと画像そのものが広がるので、沈みは付けない（原則3「それ自体の動きが手応えになるもの」）
// 読み込みに失敗した画像は、拡大しても見るものがないので押せなくする

export const zoomTriggerStyles = tv({
  slots: {
    trigger: [
      'group/zoom relative block w-full cursor-zoom-in appearance-none border-0 bg-transparent p-0 text-left',
      ...focusRing,
      'transition-[outline-color] duration-(--focus-ring-duration) ease-(--ease-press) motion-reduce:transition-none',
      // 読み込みに失敗した画像は押せない（描いた時点で失敗していて、失敗の合図が来なかった画像も、枠の状態で見分ける）
      'disabled:cursor-default has-[[data-status=error]]:cursor-default',
    ],
    // 押せることの印。画像の右下に、白い小さな丸と虫眼鏡。飾りなので読み上げには出さない（名前は zoomName が伝える）
    cue: [
      'pointer-events-none absolute right-(--image-zoom-cue-inset) bottom-(--image-zoom-cue-inset) flex size-(--image-zoom-cue-size) items-center justify-center rounded-pill',
      'border-(length:--border-width-thin) border-surface-line bg-surface text-fg',
      'opacity-(--image-zoom-cue-opacity) transition-opacity duration-(--duration-press) ease-(--ease-press) motion-reduce:transition-none',
      'group-focus-visible/zoom:opacity-(--image-zoom-cue-hover-opacity) group-enabled/zoom:group-hover/zoom:opacity-(--image-zoom-cue-hover-opacity)',
      'group-disabled/zoom:hidden group-has-[[data-status=error]]/zoom:hidden',
    ],
    cueIcon: 'size-(--icon-size-sm)',
  },
  variants: {
    showZoomIcon: {
      true: { trigger: '[--image-zoom-cue-opacity:1]' },
      false: {},
    },
    // フォーカスの線が画像の角に沿うよう、ボタンの角を画像の角にそろえる（Image の radius と同じ値）
    radius: {
      card: { trigger: 'rounded-card' },
      nested: { trigger: 'rounded-[calc(var(--radius-card)-var(--card-nested-inset))]' },
      none: { trigger: 'rounded-none' },
    },
  },
  defaultVariants: { radius: 'card', showZoomIcon: false },
});
