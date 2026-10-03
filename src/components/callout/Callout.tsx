'use client';

import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import { type ComponentProps, type ReactNode, useId } from 'react';

import { collapsibleStyles } from '../../internal/collapsible-styles';
import { CaretDownIcon } from '../../internal/icons';
import { NoticeIcon } from '../../internal/notice-surface/NoticeIcon';
import {
  type NoticeStatus,
  type NoticeVariant,
  noticeSurface,
} from '../../internal/notice-surface/notice-surface';
import { tv } from '../../internal/tv';

// 記事の中の囲み（補足・注意・メモ）。見た目はお知らせ（Notice）と同じ決まり（internal/notice-surface）で、働きが違う
//   お知らせ: 画面の上であとから出る知らせ。status・alert で読み上げ、閉じる・操作を持つ
//   囲み: 本文にはじめからある補足。role="note" で題を名前にし、読み上げで割り込まない。閉じる・操作を持たない
// 文字は読む文字（--text-body）。記事の本文と同じ大きさで、密度で変わる（原則11）
// 題の要素は、headingLevel を渡すと見出し（h2〜h6）、渡さないと p
// 畳める囲み（collapsible — 軸 443）: 題の行（アイコン・題・開閉の印）を Base UI の Collapsible の Trigger にし、中身を Panel に入れる
//   題の行は、囲みの上の余白を上下に持つ帯（Trigger）にする。押せる範囲と hover の塗りは帯の範囲で、左右は囲みの端まで広げる（原則17）。疑似要素 ::before で描く
//     閉じているときは帯が囲み全体になる。開いているときは帯の下で止め、中身は塗らない
//   中身は帯の下から始める。下と左右は囲みの余白。上下の余白は Panel の中に置くので、閉じる動きの途中で行が跳ねない
//   帯の上下の余白は囲みの余白。showDivider のときだけ、開いている帯の下に細い線を引き、中身は線の下に帯の上下と同じだけ空けて始める（軸 446）
//   印は Collapsible と同じ ▼（開くと上を向く）で、行の右端に置く
//   hover の塗りは囲みの文字の色を 6% 混ぜる。押しても濃くしない（開閉の行と同じ。原則3）
//   フォーカスの線は、塗りと同じ範囲の内側に引く（囲みの端で切れないように）
//   閉じた中身はページ内検索で見つかるように残し（hidden="until-found"）、見つかると開く
const callout = tv({
  slots: {
    root: '',
    trigger: [
      'group/callout-trigger relative isolate flex w-full cursor-pointer items-start gap-x-[calc(var(--spacing-control-x)-var(--spacing))] py-(--spacing-control-x) text-left',
      'outline-none',
      // 押せる範囲と塗り: 帯の上下と、囲みの左右の端まで
      'before:absolute before:-inset-x-(--spacing-control-x) before:inset-y-0 before:-z-1 before:rounded-control',
      'data-panel-open:before:rounded-b-none',
      'before:[transition:background-color_var(--duration-field)_var(--ease-press)] motion-reduce:before:[transition:none]',
      // 塗りは hover だけ。囲みの文字の色を混ぜる
      'hover:before:bg-[color-mix(in_oklab,var(--notice-fg)_var(--callout-row-fill-hover-mix),transparent)]',
      'focus-visible:before:[outline:var(--focus-ring-width)_solid_var(--color-focus-ring)] focus-visible:before:[outline-offset:calc(var(--focus-ring-width)*-1)]',
    ],
    title: 'min-w-0 font-bold text-(color:--notice-title-color)',
    indicator: [
      'ms-auto mt-(--notice-icon-offset) flex shrink-0 text-(color:--notice-icon-color) [&_svg]:size-(--spacing-icon)',
      'transition-[rotate] duration-(--collapsible-duration) ease-(--collapsible-ease) group-data-panel-open/callout-trigger:rotate-180 motion-reduce:[transition:none]',
    ],
    // 中身は、アイコンがあるときはアイコンと間の分だけ字下げして、題の頭にそろえる
    //   上は帯とのあいだ、下は囲みの余白
    content: 'ps-(--callout-panel-inset) pt-(--callout-panel-gap,0px) pb-(--spacing-control-x)',
  },
  variants: {
    collapsible: {
      true: {
        root: [
          // 上下の余白は帯（題の行）と中身が持つ
          'relative flex-col items-stretch py-0',
          '[--callout-panel-inset:0px] has-[[data-slot=callout-trigger]>[data-slot=notice-icon]]:[--callout-panel-inset:calc(var(--spacing-icon)+var(--spacing-control-x)-var(--spacing))]',
        ],
      },
      false: {},
    },
    // 開いているときの帯の下の線（囲みの端から端まで）。中身は線の下に、帯の上下と同じだけ空けて始める
    showDivider: {
      true: {
        root: '[--callout-panel-gap:var(--spacing-control-x)]',
        trigger:
          'before:border-[color:color-mix(in_oklab,var(--notice-fg)_var(--callout-row-rule-mix),transparent)] data-panel-open:before:border-b-(length:--border-width-thin)',
      },
      false: {},
    },
  },
  defaultVariants: { showDivider: false },
});

/** 題の見出しの段 */
export type CalloutHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface CalloutProps extends Omit<
  ComponentProps<'div'>,
  'title' | 'role' | 'color' | 'defaultValue' | 'onChange'
> {
  /** 状態。情報・成功・警告・危険の色です。書かないときは色を持たないグレーです */
  status?: NoticeStatus;
  /**
   * 見た目。soft は淡い面、muted はグレーの面に小さな題、outline は白い面に状態の色の枠線、filled は濃い塗りです
   * @default 'soft'
   */
  variant?: NoticeVariant;
  /**
   * 1 行目の左に置くアイコン。書かないときは状態ごとのアイコン（muted と状態なしではなし）です。false でアイコンを出しません
   */
  icon?: ReactNode | false;
  /** 太字の題。読み上げでは囲みの名前になります。畳めるとき（collapsible）は要ります */
  title?: ReactNode;
  /**
   * 題を見出し（h2〜h6）にします。記事の目次や見出しの一覧に題を載せたいときに使います。書かないときは見出しにしません
   */
  headingLevel?: CalloutHeadingLevel;
  /**
   * 題の行を押して、中身を畳めるようにします。長い補足（詳しい手順、ログの全文）を、ふだんは題だけにしておくときに使います。
   * 閉じた中身も、ブラウザのページ内検索で見つかると開きます
   * @default false
   */
  collapsible?: boolean;
  /**
   * 開いているときだけ、題の行の下に細い線を囲みの端から端まで引きます。中身は線の下から始まります。collapsible のときだけ効きます
   * @default false
   */
  showDivider?: boolean;
  /** 開いているか（制御）。collapsible のときだけ効きます */
  open?: boolean;
  /**
   * はじめは開いているか（非制御）。collapsible のときだけ効きます
   * @default false
   */
  defaultOpen?: boolean;
  /** 開閉が変わるときに、次の値を渡して呼びます。collapsible のときだけ効きます */
  onOpenChange?: (open: boolean) => void;
  /** 囲みの中身（補足の文） */
  children?: ReactNode;
  /** 囲みの面に足すクラス */
  className?: string;
}

/**
 * 記事の中の囲み（補足・注意・メモ）
 */
export function Callout({
  status,
  variant = 'soft',
  icon,
  title,
  headingLevel,
  collapsible = false,
  showDivider = false,
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  className,
  ...props
}: CalloutProps) {
  const titleId = useId();
  // 状態を書かないときは、色を持たないグレー
  const surfaceStatus = status ?? 'neutral';
  const canCollapse = collapsible && title != null;
  const styles = callout({ collapsible: canCollapse, showDivider: canCollapse && showDivider });
  // 畳めるときの並べ方（縦に積む）は面の既定（横並び）を上書きし、使う側の className はさらにその上に効かせる（tailwind-merge で）
  const surfaceClass = noticeSurface({
    variant,
    status: surfaceStatus,
    size: 'body',
    className: canCollapse ? [styles.root(), className] : className,
  });
  const TitleTag = headingLevel ? (`h${headingLevel}` as const) : 'p';
  const common = {
    role: 'note',
    'aria-labelledby': title ? titleId : undefined,
    'data-slot': 'callout',
    'data-status': surfaceStatus,
    'data-variant': variant,
  } as const;

  if (canCollapse) {
    const trigger = (
      <BaseCollapsible.Trigger data-slot="callout-trigger" className={styles.trigger()}>
        <NoticeIcon status={surfaceStatus} variant={variant} icon={icon} />
        <span id={titleId} data-slot="notice-title" className={styles.title()}>
          {title}
        </span>
        <span data-slot="callout-indicator" aria-hidden="true" className={styles.indicator()}>
          <CaretDownIcon />
        </span>
      </BaseCollapsible.Trigger>
    );
    return (
      <BaseCollapsible.Root
        {...common}
        {...props}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}
        className={surfaceClass}
      >
        {headingLevel ? <TitleTag className="m-0 font-[inherit]">{trigger}</TitleTag> : trigger}
        <BaseCollapsible.Panel
          data-slot="callout-panel"
          hiddenUntilFound
          className={collapsibleStyles().panel()}
        >
          <div className={styles.content()}>{children}</div>
        </BaseCollapsible.Panel>
      </BaseCollapsible.Root>
    );
  }

  return (
    <div {...common} {...props} className={surfaceClass}>
      <NoticeIcon status={surfaceStatus} variant={variant} icon={icon} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title ? (
          <TitleTag
            id={titleId}
            data-slot="notice-title"
            className="m-0 font-bold text-(color:--notice-title-color)"
          >
            {title}
          </TitleTag>
        ) : null}
        {children ? <div>{children}</div> : null}
      </div>
    </div>
  );
}
