import { type ComponentProps, type ReactNode, useContext, useId } from 'react';
import { createPortal } from 'react-dom';
import { tv } from 'tailwind-variants';

import { focusRing } from './focus-styles';
import { CheckCircleIcon, InfoIcon, WarningCircleIcon, WarningIcon, XIcon } from './icons';
import { NoticeRegionContext } from './notice-region-context';

/** お知らせの色。状態の色（情報・成功・警告・危険）だけを持つ */
export type NoticeColor = 'info' | 'success' | 'warning' | 'danger';

/**
 * 見た目（design/adr/0043）
 * soft: タグと同じ淡い面に、同じ色相の濃い題とアイコン、濃紺の本文（既定）
 * filled: 白文字が載る濃い塗り。警告だけは黄色の塗りに濃紺（design/adr/0038）
 * outline: 白い面に、1px の状態の色の枠線。アイコンも枠線の色、文字は濃紺
 */
export type NoticeAppearance = 'soft' | 'filled' | 'outline';

// お知らせ（design/adr/0043）
// 原則1: 影は付けない。お知らせそのものは押せない。押せるのは中のリンクとボタンだけ（白いボタンは、ボタンなので影がある）
// 形: アイコン → 題・本文・操作を縦に積み、× は右上。角丸は部品と同じ（--notice-radius）。余白と文字は部品の寸法（密度で変わる）
//   余白は --space-control-x、アイコンと文の間は --space-control-x から 4px 引いた値
// 色は --notice-bg・--notice-fg・--notice-title-color・--notice-icon-color・--notice-line-color・--notice-ring-color に入れる
// フォーカスの線（design/adr/0031）: soft と outline は青のまま。filled は塗りの上で青が見えない（1.00〜1.48:1）ので、
//   中のリンク・ボタン・× の線を文字の色（白か濃紺）にする（ADR-0031 の例外）
// 中のリンクは、お知らせの文字の色にする（塗りの上でも読めるように）。操作の場所のリンクは太字
const notice = tv({
  base: [
    'flex items-start gap-x-[calc(var(--space-control-x)-4px)] rounded-(--notice-radius) p-(--space-control-x)',
    'text-(length:--text-control) leading-(--leading-control)',
    'bg-(color:--notice-bg) text-(color:--notice-fg)',
    '[--color-focus-ring:var(--notice-ring-color)] [&_a]:[--link-color:currentColor]',
    // 中の線は、部品の色に従わせる設定（--focus-follow-color — 後半の軸 41）でも、お知らせの線の色のまま
    '[--focus-follow-color:initial]',
  ],
  variants: {
    appearance: {
      soft: '',
      // 縁の線（軸 36）: 太さは --notice-filled-line-width（0 は線なし）、色は --notice-filled-line（いまは警告だけ。ほかは透明）
      filled: [
        '[--notice-icon-color:var(--notice-fg)] [--notice-title-color:var(--notice-fg)]',
        'border-(length:--notice-filled-line-width) border-[color:var(--notice-filled-line,transparent)]',
      ],
      outline: [
        'border border-(color:--notice-line-color)',
        '[--notice-bg:var(--color-notice-outline)] [--notice-fg:var(--color-on-notice-outline)]',
        '[--notice-icon-color:var(--notice-line-color)] [--notice-ring-color:var(--color-focus)] [--notice-title-color:var(--notice-fg)]',
      ],
    },
    // 枠線の色（outline だけが使う）
    color: {
      info: '[--notice-line-color:var(--color-notice-info-line)]',
      success: '[--notice-line-color:var(--color-notice-success-line)]',
      warning: '[--notice-line-color:var(--color-notice-warning-line)]',
      danger: '[--notice-line-color:var(--color-notice-danger-line)]',
    },
  },
  compoundVariants: [
    {
      appearance: 'soft',
      color: 'info',
      class:
        '[--notice-bg:var(--color-notice-info)] [--notice-fg:var(--color-on-notice-info)] [--notice-icon-color:var(--color-notice-info-icon)] [--notice-ring-color:var(--color-notice-info-ring)] [--notice-title-color:var(--color-notice-info-title)]',
    },
    {
      appearance: 'soft',
      color: 'success',
      class:
        '[--notice-bg:var(--color-notice-success)] [--notice-fg:var(--color-on-notice-success)] [--notice-icon-color:var(--color-notice-success-icon)] [--notice-ring-color:var(--color-notice-success-ring)] [--notice-title-color:var(--color-notice-success-title)]',
    },
    {
      appearance: 'soft',
      color: 'warning',
      class:
        '[--notice-bg:var(--color-notice-warning)] [--notice-fg:var(--color-on-notice-warning)] [--notice-icon-color:var(--color-notice-warning-icon)] [--notice-ring-color:var(--color-notice-warning-ring)] [--notice-title-color:var(--color-notice-warning-title)]',
    },
    {
      appearance: 'soft',
      color: 'danger',
      class:
        '[--notice-bg:var(--color-notice-danger)] [--notice-fg:var(--color-on-notice-danger)] [--notice-icon-color:var(--color-notice-danger-icon)] [--notice-ring-color:var(--color-notice-danger-ring)] [--notice-title-color:var(--color-notice-danger-title)]',
    },
    {
      appearance: 'filled',
      color: 'info',
      class:
        '[--notice-bg:var(--color-notice-info-filled)] [--notice-fg:var(--color-on-notice-info-filled)] [--notice-ring-color:var(--color-notice-info-filled-ring)]',
    },
    {
      appearance: 'filled',
      color: 'success',
      class:
        '[--notice-bg:var(--color-notice-success-filled)] [--notice-fg:var(--color-on-notice-success-filled)] [--notice-ring-color:var(--color-notice-success-filled-ring)]',
    },
    {
      appearance: 'filled',
      color: 'warning',
      class:
        '[--notice-bg:var(--color-notice-warning-filled)] [--notice-fg:var(--color-on-notice-warning-filled)] [--notice-filled-line:var(--color-notice-warning-filled-line)] [--notice-ring-color:var(--color-notice-warning-filled-ring)]',
    },
    {
      appearance: 'filled',
      color: 'danger',
      class:
        '[--notice-bg:var(--color-notice-danger-filled)] [--notice-fg:var(--color-on-notice-danger-filled)] [--notice-ring-color:var(--color-notice-danger-filled-ring)]',
    },
  ],
  defaultVariants: { appearance: 'soft' },
});

// アイコンは文と並ぶので線は Regular（design/adr/0018）。警告と危険は入力欄の下の行と同じ形（design/adr/0041）
const iconOf: Record<NoticeColor, (props: { className?: string }) => ReactNode> = {
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
  danger: WarningCircleIcon,
};

// 読み上げ: 題・本文・操作を role の箱に入れる。危険は alert（割り込む）、ほかは status（区切りを待つ）
// あとから出すときは、箱を先に置いておき中身だけを入れると、多くの読み上げソフトで知らせる。
// そのため領域（NoticeRegion）の中では、自分では箱を出さず、領域が先に置いた同じ role の箱の中へ描く（二重に読まない）
const roleOf: Record<NoticeColor, 'alert' | 'status'> = {
  info: 'status',
  success: 'status',
  warning: 'status',
  danger: 'alert',
};

export interface NoticeProps extends Omit<
  ComponentProps<'div'>,
  'title' | 'role' | 'children' | 'color'
> {
  /**
   * 色。状態の色（info・success・warning・danger）から選びます。info・success・warning は role="status"、
   * danger は割り込んで読む role="alert" になります（design/adr/0043）。利用者が選ぶ primary・secondary・neutral は持ちません
   */
  color: NoticeColor;
  /**
   * 見た目。soft はタグと同じ淡い面、filled は白文字が載る濃い塗り（警告だけは黄色地に濃紺）、
   * outline は白い面に状態の色の枠線です。どの場面でどれを使うかは呼び出し側が選びます（design/adr/0043）
   * @default 'soft'
   */
  appearance?: NoticeAppearance;
  /** 太字の題。soft では状態の色、filled・outline では本文と同じ色 */
  title?: ReactNode;
  /** 本文 */
  children?: ReactNode;
  /** 本文の下に置く操作。白いボタン（`<Button color="white">`）か文字のリンク（`<Link>`）。リンクはお知らせの文字の色の太字になる */
  actions?: ReactNode;
  /**
   * 渡すと右上に × を出す。読み上げの名前は `closeLabel`。× は role の箱の外に置く
   * （お知らせの領域 `NoticeRegion` の中では、お知らせ全体が領域の箱の中に入るので、× も箱の中になります）
   */
  onClose?: () => void;
  /**
   * × の読み上げの名前。題（`title`）があるときは、この名前のあとに題を続けて「閉じる メンテナンスのお知らせ」のように読みます。
   * ページに × が並んでも、どれを閉じるのかが分かります。題がないときは、この名前だけです
   * @default '閉じる'
   */
  closeLabel?: string;
  /**
   * 題・本文・操作を role の箱（危険は alert、ほかは status）に入れるか
   * false は、出したお知らせにフォーカスを移して読ませるときに使う（Form のエラーの一覧 — design/adr/0044）。箱に入れたままだと、出たときとフォーカスが移ったときの2回読まれる
   *
   * お知らせの領域（`NoticeRegion`）の中では、自分では箱を出さず、領域が先に置いた箱（危険は alert、ほかは status）の中に描かれます。
   * あとから出すお知らせは、領域の中に入れます。ページを開いたときからあるお知らせは、領域の外にそのまま置きます
   * @default true
   */
  live?: boolean;
}

/**
 * お知らせ
 */
export function Notice({
  color,
  appearance = 'soft',
  title,
  children,
  actions,
  onClose,
  closeLabel = '閉じる',
  live = true,
  className,
  ...props
}: NoticeProps) {
  const Icon = iconOf[color];
  const titleId = useId();
  const closeId = useId();
  // 領域の中では、領域が先に置いた箱へ描く。live={false} は箱に入れない（その場に描く）
  const region = useContext(NoticeRegionContext);
  const inRegion = region !== null && live;
  const element = (
    <div
      data-slot="notice"
      data-color={color}
      data-appearance={appearance}
      {...props}
      className={notice({ appearance, color, className })}
    >
      {/* 1行目の中央にそろえる（行の高さとアイコンの差は、どちらの密度も 4px） */}
      <span className="mt-0.5 flex shrink-0 text-(color:--notice-icon-color)">
        <Icon />
      </span>
      <div
        role={live && !inRegion ? roleOf[color] : undefined}
        className="flex min-w-0 flex-1 flex-col gap-0.5"
      >
        {title ? (
          <p id={titleId} className="font-bold text-(color:--notice-title-color)">
            {title}
          </p>
        ) : null}
        {children ? <div>{children}</div> : null}
        {/* 文字のリンクの上下の余白（フォーカスの線を離す 2px）は、文の中のリンクと同じく行の高さに数えない
            枠線のリンクとボタンの見た目のリンク（どちらも inline-flex で高さを持つ）には当てない。当てると本文との間が 2px 詰まる */}
        {actions ? (
          <div className="mt-1 flex flex-wrap items-center gap-2 [&_a]:font-bold [&>a:not(.inline-flex)]:-my-0.5">
            {actions}
          </div>
        ) : null}
      </div>
      {onClose && (
        <button
          type="button"
          id={closeId}
          // 名前は「× の名前 題」。自分を先に指すと、自分の分は aria-label が使われる（accname の aria-labelledby の決まり）
          // 操作の名前を先にする: Tab で移ったとき、何をするボタンかが先に聞こえる。音声操作で「閉じる」と言ったときも名前の頭で当たる
          aria-label={closeLabel}
          aria-labelledby={title ? `${closeId} ${titleId}` : undefined}
          onClick={onClose}
          className={[
            // 大きさ（押せる範囲）は --notice-close-to-control で決める。0 は行の高さ＋8px（指用 32px・マウス用 28px）、
            // 1 は部品の高さ（--size-control）。密度で変わる値から、この要素で計算する。角丸は --notice-close-radius
            // 1行目の中央にそろえ、上と右にはみ出させる
            '[--notice-close-size:calc(var(--notice-close-to-control)_*_var(--size-control)_+_(1_-_var(--notice-close-to-control))_*_(var(--leading-control)_+_8px))]',
            '-my-[calc((var(--notice-close-size)_-_var(--leading-control))_/_2)] -mr-[calc((var(--notice-close-size)_-_var(--leading-control))_/_2)]',
            'grid size-(--notice-close-size) shrink-0 cursor-pointer place-items-center rounded-(--notice-close-radius)',
            // 平らな要素（原則3、design/adr/0027）: 文字の色を淡く敷き、押下で 1px 沈む
            'hover:bg-flat-hover active:translate-y-(--flat-press-depth) active:bg-flat-press',
            '[transition:background-color_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)] motion-reduce:[transition:none]',
            ...focusRing,
          ].join(' ')}
        >
          {/* アイコン単体なので Bold（design/adr/0018） */}
          <XIcon standalone />
        </button>
      )}
    </div>
  );
  if (!inRegion) return element;
  // 箱は領域を描いたあとに決まる。決まるまでは描かない（領域はページを開いたときから置くので、出すころには決まっている）
  const box = region[roleOf[color]];
  return box ? createPortal(element, box) : null;
}
