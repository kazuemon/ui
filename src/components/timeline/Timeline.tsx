'use client';

import { type ComponentProps, createContext, type ReactNode, useContext } from 'react';

import { headingStyles } from '../../internal/reading/heading';
import { textStyles } from '../../internal/reading/text';
import { textLinkSizeReset } from '../../internal/reading/text-link';
import { tv } from '../../internal/tv';

// 職歴・活動の年表（2021年4月 入社 …）。1 項目は、点・日付・題（見出し）・説明
// Steps は「これからやること」を順に番号で数える手順、Timeline は「起きたこと」を日付で並べる記録
// ページと同じレイヤーの読みもの（原則1・19）。影を付けず、押せない。文字は読む文字で、密度で変わる（原則11）
// 要素は <ol>・<li>。並びに意味がある（古い順・新しい順）ので ol にするが、番号は描かない
//   Safari は list-style: none の ol を一覧として読まないので、role="list" を付ける
// 点（markerType）と線（line）は、手順（Steps）と同じ種類・同じ考え方で選ぶ
//   neutral（既定）は色を持たない部品のグレーの丸（原則6）、outline は地の色で抜いた輪郭の丸、primary は Primary の青の丸
//   Steps の neutral は丸の中の数字が濃さを持つので淡い面だが、Timeline の点には中身がないので、点そのものを 3:1 のグレーにする
//   番号を数える部品ではないので、Steps の number（丸を置かない数字）は持たない
//   点の種類は項目ごとに上書きできる（TimelineItem の markerType）。書かなければ Timeline の指定に従う
//   線は、点の下から次の点の上まで引く。最後の項目には引かない（tail="dotted" のときだけ、少しだけ点線で伸ばす）
// 点の大きさ（markerSize）は sm・md（既定）・lg。日付と題が主役なので、Steps の番号の丸より小さい
// 点と線は li ではなく中の包み（timeline-inner）の ::before・::after に描く（Prose の li::before と重ならない）
// 項目の強調（TimelineItem の emphasis）は、点の種類はそのままに、周りに淡い輪を足して少し大きくする
//   輪の色は、その点の色を薄めた色。強調で色は変えないので、青くしたい項目には markerType="primary" を付ける（原則6・12）
//   強調するかは項目ごとに決める（在職中の職歴に限らない）
// 日付の置き場所（datePlacement）は stack（点の右・題の上）・inline（題と同じ行）・aside（点の左の列）
//   aside は狭い入れ物では日付の列を置けないので、collapse で畳む先を選ぶ（入れ物の幅で決める — 原則11）
// 左右交互（align="alternate"）は、点を中央に置き、偶数の項目を左側に寄せる。日付は stack・inline のときだけ
// 状態の色（markerType の success・warning・danger）: 起きたことの結果（公開した・保留・取り下げ）を点の色で示す。色だけに頼らず、
//   題や icon でも伝える（原則6）。点は状態の色の塗り（軸 456・決定）
//   警告は黄色の塗りでは白地で見えにくいので、既定は前景用のオリーブ色。黄色のほうが警告と分かりやすい場面では warningColor="yellow" を選ぶ
// 点のアイコン（TimelineItem の icon）: 点の代わりに、アイコンを入れた丸を置く。丸の色は点の種類の色から作る
//   丸の見せ方は iconVariant（軸 455・決定）。既定は filled（点の色の塗りに白抜きのアイコン。点の塗りと同じ形）
//     soft は淡い面に色のアイコン、outline は地の色の丸に細い輪郭、plain は丸を持たずアイコンだけ
//   点の列（--tl-axis）は、アイコンの丸を持つ項目が 1 つでもあれば、いちばん大きい丸の幅に広げる。どの項目も題の頭がそろい、点も線も列の中央に立つ

const timeline = tv({
  base: [
    '@container/timeline m-0 list-none ps-0',
    // アイコンの丸を持つ項目があれば、点の列をいちばん大きい丸の幅に広げる
    '[&:has([data-slot=timeline-icon][data-variant=filled])]:[--tl-icon-axis-filled:var(--timeline-icon-marker-size)]',
    '[&:has([data-slot=timeline-icon][data-variant=soft])]:[--tl-icon-axis-large:var(--timeline-icon-marker-size-lg)]',
    '[&:has([data-slot=timeline-icon][data-variant=outline])]:[--tl-icon-axis-large:var(--timeline-icon-marker-size-lg)]',
    '[&:has([data-slot=timeline-icon][data-variant=plain])]:[--tl-icon-axis-plain:var(--timeline-icon-plain-size)]',
    '[--tl-icon-axis:max(var(--tl-icon-axis-filled,0px),var(--tl-icon-axis-large,0px),var(--tl-icon-axis-plain,0px))]',
    textStyles.size.md,
    textStyles.variant.body,
    // Prose が li に当てる印（::before）と項目の間を消し、項目の間を空ける
    '[&>li]:relative [&>li]:list-none [&>li]:before:content-none',
    '[&>li+li]:mt-(--timeline-gap)',
  ],
  variants: {
    // 警告の点の色。olive は前景用の濃い色、yellow は警告の黄色の塗り（上に載せるアイコンは濃い色）
    warningColor: {
      olive: '',
      yellow:
        '[--color-timeline-marker-on-warning:var(--color-on-warning)] [--color-timeline-marker-warning:var(--color-warning)]',
    },
  },
});

const inner = tv({
  base: [
    // 点の列の幅。点の大きさか、アイコンの丸の大きさ（どれかの項目が持つとき）の大きいほう
    '[--tl-axis:max(var(--timeline-marker-size),var(--tl-icon-axis,0px))]',
    // この項目の印（点かアイコンの丸）の大きさ
    '[--tl-own:var(--timeline-marker-size)]',
    'relative ps-[calc(var(--tl-gutter)+var(--tl-axis)+var(--timeline-marker-gap))]',
    // 印の上端。1 行目（--tl-line）の中央に、印の中心をそろえる
    '[--tl-marker-top:calc((var(--tl-line)-var(--tl-own))/2)]',
    // 点。列の中央に置く
    'before:absolute before:start-[calc(var(--tl-gutter)+(var(--tl-axis)-var(--timeline-marker-size))/2)] before:top-(--tl-marker-top) before:content-[""]',
    'before:size-(--timeline-marker-size) before:rounded-pill before:bg-(--tl-marker-bg)',
    'before:[transform:scale(var(--tl-marker-scale))]',
    // 強調したときに点の周りに出る輪。その点の色（--tl-marker-color）を薄めた色にする
    '[--tl-marker-halo-color:color-mix(in_oklab,var(--tl-marker-color)_var(--timeline-emphasis-halo-mix),transparent)]',
    'before:[box-shadow:inset_0_0_0_var(--tl-marker-ring)_var(--tl-marker-ring-color),0_0_0_var(--tl-marker-halo)_var(--tl-marker-halo-color)]',
    // 項目をつなぐ線。点の下から、次の項目の点の上まで
    'after:absolute after:w-0 after:content-[""]',
    'after:start-[calc(var(--tl-gutter)+var(--tl-axis)/2-var(--timeline-line-width)/2)]',
    'after:top-[calc(var(--tl-marker-top)+var(--tl-own)+var(--timeline-line-gap))]',
    'after:bottom-[calc(var(--timeline-line-gap)-var(--timeline-gap)-var(--tl-marker-top))]',
    'after:[border-inline-start:var(--timeline-line-width)_var(--tl-line-style)_var(--color-timeline-line)]',
  ],
  variants: {
    // 点の大きさ。日付の小さな文字と釣り合う大きさを既定にする
    markerSize: {
      sm: '[--timeline-marker-size:var(--timeline-marker-size-sm)]',
      md: '[--timeline-marker-size:var(--timeline-marker-size-md)]',
      lg: '[--timeline-marker-size:var(--timeline-marker-size-lg)]',
    },
    // 点の見せ方（Steps の marker と同じ種類・同じ色）。どれも影を付けず、押せる見た目にしない
    //   on・subtle・fg は、アイコンの丸（icon）に使う塗りに載せる色・淡い面・前景の色
    markerType: {
      neutral: [
        '[--tl-marker-color:var(--color-timeline-marker)]',
        '[--tl-marker-bg:var(--tl-marker-color)]',
        '[--tl-marker-ring-color:transparent] [--tl-marker-ring:0px]',
        '[--tl-marker-fg:var(--color-fg-muted)] [--tl-marker-on:var(--color-bg)] [--tl-marker-subtle:var(--color-field)]',
      ],
      outline: [
        '[--tl-marker-color:var(--color-timeline-marker)]',
        '[--tl-marker-bg:var(--color-bg)]',
        '[--tl-marker-ring-color:var(--tl-marker-color)] [--tl-marker-ring:var(--timeline-marker-ring)]',
        '[--tl-marker-fg:var(--color-fg-muted)] [--tl-marker-on:var(--color-bg)] [--tl-marker-subtle:var(--color-field)]',
      ],
      primary: [
        '[--tl-marker-color:var(--color-primary)]',
        '[--tl-marker-bg:var(--tl-marker-color)]',
        '[--tl-marker-ring-color:transparent] [--tl-marker-ring:0px]',
        '[--tl-marker-fg:var(--color-on-primary-subtle)] [--tl-marker-on:var(--color-on-primary)] [--tl-marker-subtle:var(--color-primary-subtle)]',
      ],
      success: [
        '[--tl-marker-color:var(--color-timeline-marker-success)]',
        '[--tl-marker-bg:var(--tl-marker-color)]',
        '[--tl-marker-ring-color:transparent] [--tl-marker-ring:0px]',
        '[--tl-marker-fg:var(--color-fg-success)] [--tl-marker-on:var(--color-on-success)] [--tl-marker-subtle:var(--color-success-subtle)]',
      ],
      warning: [
        '[--tl-marker-color:var(--color-timeline-marker-warning)]',
        '[--tl-marker-bg:var(--tl-marker-color)]',
        '[--tl-marker-ring-color:transparent] [--tl-marker-ring:0px]',
        '[--tl-marker-fg:var(--color-fg-warning)] [--tl-marker-on:var(--color-timeline-marker-on-warning)] [--tl-marker-subtle:var(--color-warning-subtle)]',
      ],
      danger: [
        '[--tl-marker-color:var(--color-timeline-marker-danger)]',
        '[--tl-marker-bg:var(--tl-marker-color)]',
        '[--tl-marker-ring-color:transparent] [--tl-marker-ring:0px]',
        '[--tl-marker-fg:var(--color-fg-danger)] [--tl-marker-on:var(--color-on-danger)] [--tl-marker-subtle:var(--color-danger-subtle)]',
      ],
    },
    // 点の代わりにアイコンの丸を置く項目。点は描かず、印の大きさを丸の大きさにする
    icon: {
      filled: '[--tl-own:var(--timeline-icon-marker-size)] before:content-none',
      soft: '[--tl-own:var(--timeline-icon-marker-size-lg)] before:content-none',
      outline: '[--tl-own:var(--timeline-icon-marker-size-lg)] before:content-none',
      plain: '[--tl-own:var(--timeline-icon-plain-size)] before:content-none',
      none: '',
    },
    // 項目をつなぐ線（Steps の line と同じ名前・同じ値）。点線は太さと点とのあいだを点線用の値に差し替える
    line: {
      solid: '[--tl-line-style:solid]',
      dotted: [
        '[--tl-line-style:dotted]',
        '[--timeline-line-gap:var(--timeline-line-dotted-gap)] [--timeline-line-width:var(--timeline-line-dotted-width)]',
      ],
      none: 'after:content-none',
    },
    // 最後の項目のあと。dotted は線を少しだけ点線で伸ばして、まだ続くことを見せる
    tail: {
      none: '[li:last-child>&]:after:content-none',
      dotted: [
        '[li:last-child>&]:after:bottom-auto [li:last-child>&]:after:h-(--timeline-tail-length)',
        '[li:last-child>&]:[--tl-line-style:dotted]',
        '[li:last-child>&]:[--timeline-line-gap:var(--timeline-line-dotted-gap)] [li:last-child>&]:[--timeline-line-width:var(--timeline-line-dotted-width)]',
      ],
    },
    // 1 行目の高さ（点をそろえる行）。題の大きさ、題がないときは日付か説明
    firstLine: {
      xl: '[--tl-line:var(--leading-heading-xl)]',
      lg: '[--tl-line:var(--leading-heading-lg)]',
      md: '[--tl-line:var(--leading-heading-md)]',
      date: '[--tl-line:var(--leading-body-sm)]',
      body: '[--tl-line:var(--leading-body)]',
    },
    // 日付の置き場所。aside だけ、点の左に日付の列を空ける
    datePlacement: {
      stack: '[--tl-gutter:0px]',
      inline: '[--tl-gutter:0px]',
      aside: '[--tl-gutter:calc(var(--timeline-date-width)+var(--timeline-date-aside-gap))]',
    },
    // aside のとき、入れ物が狭くなったら日付の列をやめる。題の上へ畳むと、1 行目は日付の行になる
    collapse: {
      stack:
        '@max-md/timeline:[--tl-gutter:0px] @max-md/timeline:[--tl-line:var(--leading-body-sm)]',
      none: '',
    },
    // 左右交互。点を中央に置き、偶数の項目は左側へ寄せる
    align: {
      start: '',
      alternate: [
        '[--tl-gutter:calc(50%-var(--tl-axis)/2)]',
        '[li:nth-child(even)>&]:ps-0',
        '[li:nth-child(even)>&]:pe-[calc(50%+var(--tl-axis)/2+var(--timeline-marker-gap))]',
        '[li:nth-child(even)>&]:text-end',
      ],
    },
    // 強調する項目。点の種類は変えず、周りに淡い輪を足して少し大きくする
    emphasis: {
      true: [
        '[--tl-marker-halo:var(--timeline-emphasis-halo)]',
        '[--tl-marker-scale:var(--timeline-emphasis-scale)]',
      ],
      false: '[--tl-marker-halo:0px] [--tl-marker-scale:1]',
    },
  },
});

// アイコンの丸。点と同じく列の中央に置き、強調の輪も点と同じ形で付ける
//   色は点の種類の色（--tl-marker-*）から作る。outline は地の色の丸、plain は丸を持たない（線は印の手前で切れるので、隠す面は要らない）
const iconMarker = tv({
  base: [
    'absolute start-[calc(var(--tl-gutter)+(var(--tl-axis)-var(--tl-own))/2)] top-(--tl-marker-top)',
    'grid size-(--tl-own) place-items-center rounded-pill',
    '[transform:scale(var(--tl-marker-scale))]',
    '[box-shadow:inset_0_0_0_var(--tl-icon-ring,0px)_var(--tl-marker-fg),0_0_0_var(--tl-marker-halo)_var(--tl-marker-halo-color)]',
  ],
  variants: {
    variant: {
      filled: 'bg-(--tl-marker-color) text-(--tl-marker-on) [&_svg]:size-(--timeline-icon-size)',
      soft: 'bg-(--tl-marker-subtle) text-(--tl-marker-fg) [&_svg]:size-(--timeline-icon-size-lg)',
      outline:
        'bg-bg text-(--tl-marker-fg) [--tl-icon-ring:var(--timeline-marker-ring)] [&_svg]:size-(--timeline-icon-size-lg)',
      plain: 'text-(--tl-marker-fg) [&_svg]:size-(--timeline-icon-plain-size)',
    },
  },
});

const head = tv({
  base: 'flex flex-col gap-y-(--timeline-date-gap)',
  variants: {
    datePlacement: {
      stack: '',
      inline: 'flex-row flex-wrap items-baseline gap-x-(--timeline-inline-gap) gap-y-0',
      aside: '',
    },
  },
});

const dateText = tv({
  base: [textStyles.size.sm, textStyles.variant.muted, 'block'],
  variants: {
    datePlacement: {
      stack: '',
      inline: '',
      aside: [
        'absolute start-0 top-[calc((var(--tl-line)-var(--leading-body-sm))/2)]',
        'w-(--timeline-date-width) text-end',
      ],
    },
    collapse: {
      stack: '@max-md/timeline:static @max-md/timeline:w-auto @max-md/timeline:text-start',
      none: '',
    },
  },
});

const titleText = tv({
  base: [headingStyles.base, textLinkSizeReset, 'm-0'],
  variants: {
    size: headingStyles.size,
  },
});

// 説明。Prose の要素のあいだの余白は項目の中まで届かないので、同じ値をここで付ける
const body = tv({
  base: [
    '[&>*:not(:first-child)]:mt-(--prose-block-gap) [&>p+p:not(:first-child)]:mt-(--prose-paragraph-gap)',
    // 説明の直下のリストは、項目の li の中にあっても入れ子の印にしない
    '[&>ul]:[--lm-h:var(--list-bullet-height)] [&>ul]:[--lm-radius:var(--list-bullet-radius)] [&>ul]:[--lm-w:var(--list-bullet-width)]',
    '[&>ul]:[--lm-bg:var(--color-list-bullet)] [&>ul]:[--lm-ring-color:var(--color-list-bullet-ring)] [&>ul]:[--lm-ring:var(--list-bullet-ring)]',
  ],
  variants: {
    spaced: {
      true: 'mt-(--timeline-title-gap)',
      false: '',
    },
  },
});

export type TimelineHeadingLevel = 2 | 3 | 4 | 5 | 6;

// 段から題の大きさ。h2 は xl、h3 は lg、h4〜h6 は md（Heading と同じ）
const sizeOfLevel = { 2: 'xl', 3: 'lg', 4: 'md', 5: 'md', 6: 'md' } as const;

export type TimelineMarkerSize = 'sm' | 'md' | 'lg';

export type TimelineMarkerType =
  | 'neutral'
  | 'outline'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger';

export type TimelineLine = 'solid' | 'dotted' | 'none';

export type TimelineIconVariant = 'filled' | 'soft' | 'outline' | 'plain';

export type TimelineWarningColor = 'olive' | 'yellow';

export type TimelineTail = 'none' | 'dotted';

export type TimelineDatePlacement = 'stack' | 'inline' | 'aside';

export type TimelineCollapse = 'stack' | 'none';

export type TimelineAlign = 'start' | 'alternate';

const TimelineContext = createContext<{
  level: TimelineHeadingLevel | false;
  markerSize: TimelineMarkerSize;
  markerType: TimelineMarkerType;
  iconVariant: TimelineIconVariant;
  line: TimelineLine;
  tail: TimelineTail;
  datePlacement: TimelineDatePlacement;
  collapse: TimelineCollapse;
  align: TimelineAlign;
}>({
  level: 3,
  markerSize: 'md',
  markerType: 'neutral',
  iconVariant: 'filled',
  line: 'solid',
  tail: 'none',
  datePlacement: 'stack',
  collapse: 'stack',
  align: 'start',
});

export interface TimelineProps extends ComponentProps<'ol'> {
  /**
   * 各項目の題を描く見出しの段。年表を置く節の見出しより 1 段下にします。大きさは段に従います（5・6 段は 4 と同じ）。
   * false にすると題を見出しにせず、3 段と同じ大きさの文字で描きます（項目を見出しの一覧に並べたくないとき）
   * @default 3
   */
  headingLevel?: TimelineHeadingLevel | false;
  /**
   * 点の大きさ。日付と題が主役の年表では md、点を骨組みとして見せたいときは lg にします
   * @default 'md'
   */
  markerSize?: TimelineMarkerSize;
  /**
   * 点の見せ方。neutral はグレーの丸、outline は地の色で抜いた輪郭の丸、primary は Primary の青の丸です（Steps の marker と同じ種類・同じ色）。
   * success・warning・danger は状態の色の丸で、起きたことの結果（公開した・保留・取り下げなど）を示します。色だけに頼らず、題や `icon` でも伝えます。
   * 項目ごとに `TimelineItem` の `markerType` で上書きできます
   * @default 'neutral'
   */
  markerType?: TimelineMarkerType;
  /**
   * 警告（`markerType="warning"`）の点の色。olive は白地でも読める濃い黄緑、yellow は警告と一目で分かる黄色の塗り（白地では縁が淡くなります）
   * @default 'olive'
   */
  warningColor?: TimelineWarningColor;
  /**
   * アイコン（`TimelineItem` の `icon`）を入れた丸の見せ方。filled は点の色の塗りに白抜きのアイコン、soft は淡い面に色のアイコン、
   * outline は地の色の丸に細い輪郭と色のアイコン、plain は丸を持たずアイコンだけです。項目ごとに `TimelineItem` の `iconVariant` で上書きできます
   * @default 'filled'
   */
  iconVariant?: TimelineIconVariant;
  /**
   * 項目をつなぐ縦の線。solid は細い実線、dotted は点線、none は線を引かず日付と余白だけで並びを見せます
   * @default 'solid'
   */
  line?: TimelineLine;
  /**
   * 最後の項目のあと。dotted は線を少しだけ点線で伸ばし、年表がまだ続くことを見せます（`line="none"` のときは出ません）
   * @default 'none'
   */
  tail?: TimelineTail;
  /**
   * 日付の置き場所。stack は点の右・題の上、inline は題と同じ行、aside は点の左の列にそろえます
   * @default 'stack'
   */
  datePlacement?: TimelineDatePlacement;
  /**
   * `datePlacement="aside"` で、入れ物が狭くなったときの日付の置き場所。stack は題の上へ畳み、none は畳まずに列を保ちます
   * @default 'stack'
   */
  collapse?: TimelineCollapse;
  /**
   * 並べ方。start は左に寄せます。alternate は点を中央に置き、項目を左右交互に並べます（`datePlacement` が stack・inline のとき）
   * @default 'start'
   */
  align?: TimelineAlign;
  /** 年表の項目（TimelineItem）を並べます */
  children?: ReactNode;
}

/**
 * 職歴・活動の年表。TimelineItem を、古い順か新しい順に並べます
 */
export function Timeline({
  headingLevel = 3,
  markerSize = 'md',
  markerType = 'neutral',
  warningColor = 'olive',
  iconVariant = 'filled',
  line = 'solid',
  tail = 'none',
  datePlacement = 'stack',
  collapse = 'stack',
  align = 'start',
  className,
  children,
  ...props
}: TimelineProps) {
  return (
    <TimelineContext.Provider
      value={{
        level: headingLevel,
        markerSize,
        markerType,
        iconVariant,
        line,
        tail,
        datePlacement,
        collapse,
        align,
      }}
    >
      {/* list-style: none の ol を Safari が一覧として読むよう、role="list" を明示する */}
      {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
      <ol
        role="list"
        data-slot="timeline"
        className={timeline({ warningColor, className })}
        {...props}
      >
        {children}
      </ol>
    </TimelineContext.Provider>
  );
}

export interface TimelineItemProps extends Omit<ComponentProps<'li'>, 'title'> {
  /** 日付。`Time` を渡すと `<time datetime>` になります。「2021年4月 – 2023年3月」のような期間も渡せます */
  date?: ReactNode;
  /** 項目の題。Timeline の headingLevel の見出しで描きます */
  title?: ReactNode;
  /**
   * この項目だけの点の見せ方。書かないときは Timeline の `markerType` に従います（Timeline の既定は neutral）
   */
  markerType?: TimelineMarkerType;
  /**
   * 点の代わりに置くアイコン（`@phosphor-icons/react` など）。アイコンを入れた丸を置き、丸の色は点の種類（markerType）に従います。
   * 1 つの項目に置くと、ほかの項目の点もその丸の幅の列の中央に並びます
   */
  icon?: ReactNode;
  /**
   * この項目だけのアイコンの丸の見せ方。書かないときは Timeline の `iconVariant` に従います（Timeline の既定は filled）
   */
  iconVariant?: TimelineIconVariant;
  /**
   * この項目を強調します。点の種類はそのままに、周りに淡い輪を足して少し大きくします。青くしたいときは `markerType="primary"` を足します
   * @default false
   */
  emphasis?: boolean;
  /** 説明。段落・リスト・タグなどを置けます */
  children?: ReactNode;
}

/**
 * 年表の 1 項目
 */
export function TimelineItem({
  date,
  title,
  markerType: itemMarkerType,
  icon,
  iconVariant: itemIconVariant,
  emphasis = false,
  className,
  children,
  ...props
}: TimelineItemProps) {
  const {
    level,
    markerSize,
    markerType: groupMarkerType,
    iconVariant: groupIconVariant,
    line,
    tail,
    datePlacement,
    collapse,
    align,
  } = useContext(TimelineContext);
  // 点の種類は、項目に渡されていればそれを使い、渡されていなければ Timeline の指定に従う
  const markerType = itemMarkerType ?? groupMarkerType;
  const Tag = level === false ? 'div' : (`h${level}` as const);
  const titleSize = sizeOfLevel[level === false ? 3 : level];
  const titled = title != null && title !== false;
  const dated = date != null && date !== false;
  const hasIcon = icon != null && icon !== false;
  // 輪郭の点（outline）のアイコンは、塗りの形を選んでいても地の色で抜いた輪郭の丸にする（点と同じ見え方）
  const chosenIconVariant = itemIconVariant ?? groupIconVariant;
  const iconVariant =
    markerType === 'outline' && (chosenIconVariant === 'filled' || chosenIconVariant === 'soft')
      ? 'outline'
      : chosenIconVariant;
  // 1 行目は、点をそろえる行。stack では日付、inline では題と日付が並ぶ行、aside では題の行になる
  //   （aside の日付は流れの外にあるので、1 行目に数えない）
  const firstLine =
    datePlacement === 'stack' && dated ? 'date' : titled ? titleSize : dated ? 'date' : 'body';
  // aside で日付があるときだけ、狭い入れ物で畳む先を渡す
  const fold = datePlacement === 'aside' && dated ? collapse : 'none';
  return (
    <li
      data-slot="timeline-item"
      data-emphasis={emphasis || undefined}
      className={className}
      {...props}
    >
      <div
        data-slot="timeline-inner"
        className={inner({
          markerSize,
          markerType,
          line,
          tail,
          firstLine,
          datePlacement,
          collapse: fold,
          align,
          emphasis,
          icon: hasIcon ? iconVariant : 'none',
        })}
      >
        {hasIcon ? (
          <span
            aria-hidden="true"
            data-slot="timeline-icon"
            data-variant={iconVariant}
            className={iconMarker({ variant: iconVariant })}
          >
            {icon}
          </span>
        ) : null}
        {dated || titled ? (
          <div data-slot="timeline-head" className={head({ datePlacement })}>
            {dated ? (
              <div
                data-slot="timeline-date"
                className={dateText({ datePlacement, collapse: fold })}
              >
                {date}
              </div>
            ) : null}
            {titled ? (
              <Tag data-slot="timeline-title" className={titleText({ size: titleSize })}>
                {title}
              </Tag>
            ) : null}
          </div>
        ) : null}
        {children != null ? (
          <div data-slot="timeline-body" className={body({ spaced: dated || titled })}>
            {children}
          </div>
        ) : null}
      </div>
    </li>
  );
}
