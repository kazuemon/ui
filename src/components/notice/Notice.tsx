import { type ComponentProps, type ReactNode, useContext, useId } from 'react';
import { createPortal } from 'react-dom';
import { focusRing } from '../../internal/focus-styles';
import { XIcon } from '../../internal/icons';
import { NoticeIcon } from '../../internal/notice-surface/NoticeIcon';
import {
  type NoticeAppearance,
  type NoticeColor,
  noticeSurface,
} from '../../internal/notice-surface/notice-surface';
import { NoticeRegionContext } from './notice-region-context';

export type { NoticeAppearance, NoticeColor };

// お知らせ（design/adr/0043）。見た目は internal/notice-surface（Callout と共有）。ここは読み上げ（role・領域）と、閉じる・操作を持つ

// 読み上げ: 題・本文・操作を role の箱に入れる。危険は alert（割り込む）、ほかは status（区切りを待つ）
// あとから出すときは、箱を先に置いておき中身だけを入れると、多くの読み上げソフトで知らせる。
// そのため領域（NoticeRegion）の中では、自分では箱を出さず、領域が先に置いた同じ role の箱の中へ描く（二重に読まない）
const roleOf: Record<NoticeColor, 'alert' | 'status'> = {
  info: 'status',
  success: 'status',
  warning: 'status',
  danger: 'alert',
  neutral: 'status',
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
  /**
   * 1 行目の左に置くアイコン。指定しないときは、状態の色ごとのアイコン（muted と neutral ではなし）です。
   * false でアイコンを出さず、文が左端から始まります
   */
  icon?: ReactNode | false;
  /** 太字の題。soft・muted では状態の色、filled・outline では本文と同じ色。muted では小さくなります */
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
  icon,
  title,
  children,
  actions,
  onClose,
  closeLabel = '閉じる',
  live = true,
  className,
  ...props
}: NoticeProps) {
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
      className={noticeSurface({ appearance, color, className })}
    >
      <NoticeIcon color={color} appearance={appearance} icon={icon} />
      <div
        role={live && !inRegion ? roleOf[color] : undefined}
        className="flex min-w-0 flex-1 flex-col gap-0.5"
      >
        {title ? (
          <p
            id={titleId}
            data-slot="notice-title"
            className="font-bold text-(color:--notice-title-color)"
          >
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
            // 大きさ（押せる範囲）は部品の高さ（--spacing-control。大きい指用で 52px — ADR-0050 の B）。角丸は部品と同じ
            // 1行目の中央にそろえ、上と右にはみ出させる
            '-my-[calc((var(--spacing-control)_-_var(--leading-control))_/_2)] -mr-[calc((var(--spacing-control)_-_var(--leading-control))_/_2)]',
            'grid size-(--spacing-control) shrink-0 cursor-pointer place-items-center rounded-control',
            // 平らな要素（原則3、design/adr/0027）: 文字の色を淡く敷き、押下で 1px 沈む
            // 塗りは --flat-bg（theme.css で登録）に置き、background-color ではなく変数を動かす（ADR-0112）
            //   登録した変数は currentColor を補間できないので、文字の色（--notice-fg）を --flat-hover-mix・--flat-press-mix で混ぜる（--color-flat-* と同じ色）
            '[--flat-bg:transparent] bg-(color:--flat-bg) hover:[--flat-bg:color-mix(in_oklab,var(--notice-fg)_var(--flat-hover-mix),transparent)] active:translate-y-(--flat-press-depth) active:[--flat-bg:color-mix(in_oklab,var(--notice-fg)_var(--flat-press-mix),transparent)]',
            '[transition:--flat-bg_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)] motion-reduce:[transition:none]',
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
