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

const timeline = tv({
  base: [
    '@container/timeline m-0 list-none ps-0',
    textStyles.size.md,
    textStyles.tone.default,
    // Prose が li に当てる印（::before）と項目の間を消し、項目の間を空ける
    '[&>li]:relative [&>li]:list-none [&>li]:before:content-none',
    '[&>li+li]:mt-(--timeline-gap)',
  ],
});

const inner = tv({
  base: [
    'relative ps-[calc(var(--tl-gutter)+var(--timeline-marker-size)+var(--timeline-marker-gap))]',
    // 点の上端。1 行目（--tl-line）の中央に、点の中心をそろえる
    '[--tl-marker-top:calc((var(--tl-line)-var(--timeline-marker-size))/2)]',
    // 点
    'before:absolute before:start-(--tl-gutter) before:top-(--tl-marker-top) before:content-[""]',
    'before:size-(--timeline-marker-size) before:rounded-pill before:bg-(--tl-marker-bg)',
    'before:[transform:scale(var(--tl-marker-scale))]',
    // 強調したときに点の周りに出る輪。その点の色（--tl-marker-color）を薄めた色にする
    '[--tl-marker-halo-color:color-mix(in_oklab,var(--tl-marker-color)_var(--timeline-emphasis-halo-mix),transparent)]',
    'before:[box-shadow:inset_0_0_0_var(--tl-marker-ring)_var(--tl-marker-ring-color),0_0_0_var(--tl-marker-halo)_var(--tl-marker-halo-color)]',
    // 項目をつなぐ線。点の下から、次の項目の点の上まで
    'after:absolute after:w-0 after:content-[""]',
    'after:start-[calc(var(--tl-gutter)+var(--timeline-marker-size)/2-var(--timeline-line-width)/2)]',
    'after:top-[calc(var(--tl-marker-top)+var(--timeline-marker-size)+var(--timeline-line-gap))]',
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
    markerType: {
      neutral: [
        '[--tl-marker-color:var(--color-timeline-marker)]',
        '[--tl-marker-bg:var(--tl-marker-color)]',
        '[--tl-marker-ring-color:transparent] [--tl-marker-ring:0px]',
      ],
      outline: [
        '[--tl-marker-color:var(--color-timeline-marker)]',
        '[--tl-marker-bg:var(--color-bg)]',
        '[--tl-marker-ring-color:var(--tl-marker-color)] [--tl-marker-ring:var(--timeline-marker-ring)]',
      ],
      primary: [
        '[--tl-marker-color:var(--color-primary)]',
        '[--tl-marker-bg:var(--tl-marker-color)]',
        '[--tl-marker-ring-color:transparent] [--tl-marker-ring:0px]',
      ],
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
      2: '[--tl-line:var(--leading-heading-2)]',
      3: '[--tl-line:var(--leading-heading-3)]',
      4: '[--tl-line:var(--leading-heading-4)]',
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
        '[--tl-gutter:calc(50%-var(--timeline-marker-size)/2)]',
        '[li:nth-child(even)>&]:ps-0',
        '[li:nth-child(even)>&]:pe-[calc(50%+var(--timeline-marker-size)/2+var(--timeline-marker-gap))]',
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
  base: [textStyles.size.sm, textStyles.tone.muted, 'block'],
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

// 段から題の大きさ。5・6 段は 4（Heading と同じ）
const sizeOfLevel = { 2: 2, 3: 3, 4: 4, 5: 4, 6: 4 } as const;

export type TimelineMarkerSize = 'sm' | 'md' | 'lg';

export type TimelineMarkerType = 'neutral' | 'outline' | 'primary';

export type TimelineLine = 'solid' | 'dotted' | 'none';

export type TimelineTail = 'none' | 'dotted';

export type TimelineDatePlacement = 'stack' | 'inline' | 'aside';

export type TimelineCollapse = 'stack' | 'none';

export type TimelineAlign = 'start' | 'alternate';

const TimelineContext = createContext<{
  level: TimelineHeadingLevel;
  markerSize: TimelineMarkerSize;
  markerType: TimelineMarkerType;
  line: TimelineLine;
  tail: TimelineTail;
  datePlacement: TimelineDatePlacement;
  collapse: TimelineCollapse;
  align: TimelineAlign;
}>({
  level: 3,
  markerSize: 'md',
  markerType: 'neutral',
  line: 'solid',
  tail: 'none',
  datePlacement: 'stack',
  collapse: 'stack',
  align: 'start',
});

export interface TimelineProps extends ComponentProps<'ol'> {
  /**
   * 各項目の題を描く見出しの段。年表を置く節の見出しより 1 段下にします。大きさは段に従います（5・6 段は 4 と同じ）
   * @default 3
   */
  headingLevel?: TimelineHeadingLevel;
  /**
   * 点の大きさ。日付と題が主役の年表では md、点を骨組みとして見せたいときは lg にします
   * @default 'md'
   */
  markerSize?: TimelineMarkerSize;
  /**
   * 点の見せ方。neutral はグレーの丸、outline は地の色で抜いた輪郭の丸、primary は Primary の青の丸です（Steps の marker と同じ種類・同じ色）。項目ごとに `TimelineItem` の `markerType` で上書きできます
   * @default 'neutral'
   */
  markerType?: TimelineMarkerType;
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
  children?: ReactNode;
}

/**
 * 職歴・活動の年表。TimelineItem を、古い順か新しい順に並べます
 */
export function Timeline({
  headingLevel = 3,
  markerSize = 'md',
  markerType = 'neutral',
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
        line,
        tail,
        datePlacement,
        collapse,
        align,
      }}
    >
      {/* list-style: none の ol を Safari が一覧として読むよう、role="list" を明示する */}
      {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
      <ol role="list" data-slot="timeline" className={timeline({ className })} {...props}>
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
  emphasis = false,
  className,
  children,
  ...props
}: TimelineItemProps) {
  const {
    level,
    markerSize,
    markerType: groupMarkerType,
    line,
    tail,
    datePlacement,
    collapse,
    align,
  } = useContext(TimelineContext);
  // 点の種類は、項目に渡されていればそれを使い、渡されていなければ Timeline の指定に従う
  const markerType = itemMarkerType ?? groupMarkerType;
  const Tag = `h${level}` as const;
  const titleSize = sizeOfLevel[level];
  const titled = title != null && title !== false;
  const dated = date != null && date !== false;
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
        })}
      >
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
