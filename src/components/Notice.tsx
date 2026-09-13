import type { ComponentProps, ReactNode } from 'react';
import { tv } from 'tailwind-variants';

import { focusRing } from './focus-styles';
import { CheckCircleIcon, InfoIcon, WarningCircleIcon, WarningIcon, XIcon } from './icons';

/** 状態の色。情報・成功・警告・危険 */
export type NoticeTone = 'info' | 'success' | 'warning' | 'danger';

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
  ],
  variants: {
    appearance: {
      soft: '',
      filled: '[--notice-icon-color:var(--notice-fg)] [--notice-title-color:var(--notice-fg)]',
      outline: [
        'border border-(color:--notice-line-color)',
        '[--notice-bg:var(--color-notice-outline)] [--notice-fg:var(--color-on-notice-outline)]',
        '[--notice-icon-color:var(--notice-line-color)] [--notice-ring-color:var(--color-focus)] [--notice-title-color:var(--notice-fg)]',
      ],
    },
    // 枠線の色（outline だけが使う）
    tone: {
      info: '[--notice-line-color:var(--color-notice-info-line)]',
      success: '[--notice-line-color:var(--color-notice-success-line)]',
      warning: '[--notice-line-color:var(--color-notice-warning-line)]',
      danger: '[--notice-line-color:var(--color-notice-danger-line)]',
    },
  },
  compoundVariants: [
    {
      appearance: 'soft',
      tone: 'info',
      class:
        '[--notice-bg:var(--color-notice-info)] [--notice-fg:var(--color-on-notice-info)] [--notice-icon-color:var(--color-notice-info-icon)] [--notice-ring-color:var(--color-notice-info-ring)] [--notice-title-color:var(--color-notice-info-title)]',
    },
    {
      appearance: 'soft',
      tone: 'success',
      class:
        '[--notice-bg:var(--color-notice-success)] [--notice-fg:var(--color-on-notice-success)] [--notice-icon-color:var(--color-notice-success-icon)] [--notice-ring-color:var(--color-notice-success-ring)] [--notice-title-color:var(--color-notice-success-title)]',
    },
    {
      appearance: 'soft',
      tone: 'warning',
      class:
        '[--notice-bg:var(--color-notice-warning)] [--notice-fg:var(--color-on-notice-warning)] [--notice-icon-color:var(--color-notice-warning-icon)] [--notice-ring-color:var(--color-notice-warning-ring)] [--notice-title-color:var(--color-notice-warning-title)]',
    },
    {
      appearance: 'soft',
      tone: 'danger',
      class:
        '[--notice-bg:var(--color-notice-danger)] [--notice-fg:var(--color-on-notice-danger)] [--notice-icon-color:var(--color-notice-danger-icon)] [--notice-ring-color:var(--color-notice-danger-ring)] [--notice-title-color:var(--color-notice-danger-title)]',
    },
    {
      appearance: 'filled',
      tone: 'info',
      class:
        '[--notice-bg:var(--color-notice-info-filled)] [--notice-fg:var(--color-on-notice-info-filled)] [--notice-ring-color:var(--color-notice-info-filled-ring)]',
    },
    {
      appearance: 'filled',
      tone: 'success',
      class:
        '[--notice-bg:var(--color-notice-success-filled)] [--notice-fg:var(--color-on-notice-success-filled)] [--notice-ring-color:var(--color-notice-success-filled-ring)]',
    },
    {
      appearance: 'filled',
      tone: 'warning',
      class:
        '[--notice-bg:var(--color-notice-warning-filled)] [--notice-fg:var(--color-on-notice-warning-filled)] [--notice-ring-color:var(--color-notice-warning-filled-ring)]',
    },
    {
      appearance: 'filled',
      tone: 'danger',
      class:
        '[--notice-bg:var(--color-notice-danger-filled)] [--notice-fg:var(--color-on-notice-danger-filled)] [--notice-ring-color:var(--color-notice-danger-filled-ring)]',
    },
  ],
  defaultVariants: { appearance: 'soft' },
});

// アイコンは文と並ぶので線は Regular（design/adr/0018）。警告と危険は入力欄の下の行と同じ形（design/adr/0041）
const iconOf: Record<NoticeTone, (props: { className?: string }) => ReactNode> = {
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
  danger: WarningCircleIcon,
};

// 読み上げ: 題・本文・操作を role の箱に入れる。危険は alert（割り込む）、ほかは status（区切りを待つ）
// あとから出すときは、箱を先に置いておき中身だけを入れると、多くの読み上げソフトで知らせる
const roleOf: Record<NoticeTone, 'alert' | 'status'> = {
  info: 'status',
  success: 'status',
  warning: 'status',
  danger: 'alert',
};

export interface NoticeProps extends Omit<ComponentProps<'div'>, 'title' | 'role' | 'children'> {
  /**
   * 状態の色。info・success・warning は role="status"、danger は割り込んで読む role="alert" になります（design/adr/0043）。
   * 利用者が選ぶ primary・secondary・neutral とは別の、お知らせ専用の色です
   */
  tone: NoticeTone;
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
  /** 本文の下に置く操作。白いボタン（`<Button color="surface">`）か文字のリンク（`<Link>`）。リンクはお知らせの文字の色の太字になる */
  actions?: ReactNode;
  /** 渡すと右上に × を出す（読み上げは「閉じる」）。× は role の箱の外に置く */
  onClose?: () => void;
  /**
   * 題・本文・操作を role の箱（危険は alert、ほかは status）に入れるか
   * false は、出したお知らせにフォーカスを移して読ませるときに使う（Form のエラーの一覧 — design/adr/0044）。箱に入れたままだと、出たときとフォーカスが移ったときの2回読まれる
   * @default true
   */
  live?: boolean;
}

/**
 * お知らせ
 */
export function Notice({
  tone,
  appearance = 'soft',
  title,
  children,
  actions,
  onClose,
  live = true,
  className,
  ...props
}: NoticeProps) {
  const Icon = iconOf[tone];
  return (
    <div
      data-slot="notice"
      data-tone={tone}
      data-appearance={appearance}
      {...props}
      className={notice({ appearance, tone, className })}
    >
      {/* 1行目の中央にそろえる（行の高さとアイコンの差は、どちらの密度も 4px） */}
      <span className="mt-0.5 flex shrink-0 text-(color:--notice-icon-color)">
        <Icon />
      </span>
      <div role={live ? roleOf[tone] : undefined} className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title ? <p className="font-bold text-(color:--notice-title-color)">{title}</p> : null}
        {children ? <div>{children}</div> : null}
        {/* 文字のリンクの上下の余白（フォーカスの線を離す 2px）は、文の中のリンクと同じく行の高さに数えない */}
        {actions ? (
          <div className="mt-1 flex flex-wrap items-center gap-2 [&_a]:font-bold [&>a]:-my-0.5">
            {actions}
          </div>
        ) : null}
      </div>
      {onClose && (
        <button
          type="button"
          aria-label="閉じる"
          onClick={onClose}
          className={[
            // 押せる範囲は行の高さ＋8px（指用 32px・マウス用 28px）。上と右に 4px はみ出させ、1行目の中央にそろえる
            '-my-1 -mr-1 grid size-[calc(var(--leading-control)+8px)] shrink-0 cursor-pointer place-items-center rounded-pill',
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
}
