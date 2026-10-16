'use client';

import { type ComponentProps, type CSSProperties, type ReactNode, useId, useState } from 'react';

import { tv } from '../../internal/tv';
import { Button } from '../button/Button';
import { SegmentedControl, SegmentedControlItem } from '../segmented-control/SegmentedControl';

// グラフの枠。題・説明・凡例を置き、グラフを描く場所の高さを決める。グラフそのものはライブラリが描く（レシピ）
// 面は持たない（ページと同じレイヤー。原則1）。カードに載せたいときは Card と組み合わせる
// 描く場所には、目盛りの文字の大きさ（キャプション）と等幅の数字を敷く。ライブラリの SVG の文字はこれを継ぐ
// 表で見る形（table）を渡すと、題の行の右に切り替えを置く。数値を表でも読めるようにする（原則6）— ADR-0539
//   segmented: 「グラフ・表」の SegmentedControl。既定。いまどちらの形かがいつも分かる
//     大きさは viewToggleSize。既定は sm（ボタンの小と同じ高さ・文字）。ふつうの大きさでは題より目立ち、グラフの上が重い
//   button: もう一方の形へ移る下線のボタン（「表で見る」）。グラフの上がいちばん軽い。場所は同じ題の行の右
//   切り替えの文言は部品そのものの操作なので既定を持ち、差し替えられる（原則20）
const chartFrame = tv({
  slots: {
    root: 'm-0 flex min-w-0 flex-col gap-(--chart-frame-gap)',
    header: 'flex items-start justify-between gap-3',
    heading: 'flex min-w-0 flex-col gap-0.5',
    title:
      'text-(length:--text-label) leading-(--leading-label) [font-weight:var(--font-weight-heading)] text-fg',
    description: 'm-0 text-(length:--text-caption) leading-(--leading-caption) text-fg-muted',
    // 小さな切り替え: ボタンの小（Button の size="sm"）と同じ寸法のトークンを、切り替えの中だけ差し替える
    toggle: 'shrink-0',
    plot: [
      'relative h-(--chart-height) w-full min-w-0',
      'text-(length:--text-caption) leading-(--leading-caption) tabular-nums',
    ],
  },
  variants: {
    viewToggleSize: {
      sm: {
        toggle: [
          '[--spacing-control-x:var(--spacing-control-x-sm)] [--spacing-control:var(--spacing-control-sm)]',
          '[--leading-control:var(--leading-control-sm)] [--text-control:var(--text-control-sm)]',
        ],
      },
      md: {},
    },
  },
  defaultVariants: { viewToggleSize: 'sm' },
});

export type ChartFrameView = 'chart' | 'table';
/** 切り替えの形。segmented は「グラフ・表」の切り替え、button はもう一方の形へ移る下線のボタン */
export type ChartFrameViewToggle = 'segmented' | 'button';
/** 切り替えの大きさ。sm はボタンの小と同じ、md はほかの欄と同じ */
export type ChartFrameViewToggleSize = 'sm' | 'md';

export interface ChartFrameProps extends Omit<ComponentProps<'figure'>, 'children' | 'title'> {
  /** 題。グラフの上の見出しの行に出て、グラフの名前として読まれます */
  title?: ReactNode;
  /** 題の下に添える説明（期間・単位など） */
  description?: ReactNode;
  /** 凡例。ChartLegend を渡します。題の下、グラフの上に置きます */
  legend?: ReactNode;
  /** グラフ。ライブラリのグラフを、描く場所いっぱいに広げて渡します（Recharts なら ResponsiveContainer） */
  children: ReactNode;
  /** 同じ値を表で見る形（Table）。渡すと、題の行の右に「グラフ・表」の切り替えを置きます */
  table?: ReactNode;
  /** はじめに見せる形。table を渡したときだけ効きます
   * @default 'chart'
   */
  defaultView?: ChartFrameView;
  /**
   * グラフを描く場所の高さ。数は px、文字は CSS の長さです
   * @default 240
   */
  height?: number | string;
  /**
   * 切り替えの形。segmented は「グラフ・表」の切り替え、button はもう一方の形へ移る下線のボタン（「表で見る」）です。
   * どちらも題の行の右に置きます
   * @default 'segmented'
   */
  viewToggle?: ChartFrameViewToggle;
  /**
   * 切り替えの大きさ。sm はボタンの小と同じ、md はほかの欄と同じです
   * @default 'sm'
   */
  viewToggleSize?: ChartFrameViewToggleSize;
  /**
   * 切り替え（segmented）の「グラフ」の文字
   * @default 'グラフ'
   */
  chartLabel?: string;
  /**
   * 切り替え（segmented）の「表」の文字
   * @default '表'
   */
  tableLabel?: string;
  /**
   * 切り替え（segmented）の読み上げの名前
   * @default '表示'
   */
  viewToggleName?: string;
  /**
   * ボタン（button）で、グラフを見ているときの文字
   * @default '表で見る'
   */
  showTableLabel?: string;
  /**
   * ボタン（button）で、表を見ているときの文字
   * @default 'グラフで見る'
   */
  showChartLabel?: string;
  /** いちばん外の要素に付きます */
  className?: string;
}

/**
 * グラフの枠です。題・説明・凡例を並べ、ライブラリで描いたグラフを置く場所を作ります。表で見る形への切り替えも置けます
 */
export function ChartFrame({
  title,
  description,
  legend,
  children,
  table,
  defaultView = 'chart',
  height,
  viewToggle = 'segmented',
  viewToggleSize = 'sm',
  chartLabel = 'グラフ',
  tableLabel = '表',
  showTableLabel = '表で見る',
  showChartLabel = 'グラフで見る',
  viewToggleName = '表示',
  className,
  style,
  ...props
}: ChartFrameProps) {
  const styles = chartFrame({ viewToggleSize });
  const titleId = useId();
  const [view, setView] = useState<ChartFrameView>(table ? defaultView : 'chart');
  const showTable = table != null && view === 'table';
  const hasHeader = title != null || description != null || table != null;
  return (
    <figure
      data-slot="chart-frame"
      aria-labelledby={title != null ? titleId : undefined}
      className={styles.root({ className })}
      style={
        height != null
          ? ({
              ...style,
              '--chart-height': typeof height === 'number' ? `${height}px` : height,
            } as CSSProperties)
          : style
      }
      {...props}
    >
      {hasHeader ? (
        <div className={styles.header()}>
          <div className={styles.heading()}>
            {title != null ? (
              <div id={titleId} className={styles.title()}>
                {title}
              </div>
            ) : null}
            {description != null ? <p className={styles.description()}>{description}</p> : null}
          </div>
          {table != null ? (
            <div className={styles.toggle()} data-view-toggle={viewToggle}>
              {viewToggle === 'button' ? (
                <Button variant="underline" onClick={() => setView(showTable ? 'chart' : 'table')}>
                  {showTable ? showChartLabel : showTableLabel}
                </Button>
              ) : (
                <SegmentedControl<ChartFrameView>
                  accessibleName={viewToggleName}
                  value={view}
                  onValueChange={setView}
                >
                  <SegmentedControlItem value="chart">{chartLabel}</SegmentedControlItem>
                  <SegmentedControlItem value="table">{tableLabel}</SegmentedControlItem>
                </SegmentedControl>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
      {legend != null && !showTable ? legend : null}
      {showTable ? table : <div className={styles.plot()}>{children}</div>}
    </figure>
  );
}
