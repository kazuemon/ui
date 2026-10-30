'use client';

import {
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  useId,
  useRef,
  useState,
} from 'react';

import { tv } from '../../internal/tv';
import { Button } from '../button/Button';
import { Spinner } from '../loading/Loading';
import { Skeleton } from '../skeleton/Skeleton';
import { StatusPanel } from '../status-panel/StatusPanel';
import { SegmentedControl, SegmentedControlItem } from '../segmented-control/SegmentedControl';

// グラフの枠。題・説明・凡例を置き、グラフを描く場所の高さを決める。グラフそのものはライブラリが描く（レシピ）
// 面は持たない（ページと同じレイヤー。原則1）。カードに載せたいときは Card と組み合わせる
// 描く場所には、目盛りの文字の大きさ（キャプション）と等幅の数字を敷く。ライブラリの SVG の文字はこれを継ぐ
// 表で見る形（table）を渡すと、題の行の右に切り替えを置く。数値を表でも読めるようにする（原則6）— ADR-0539
//   segmented: 「グラフ・表」の SegmentedControl。既定。いまどちらの形かがいつも分かる
//     大きさは viewToggleSize。既定は sm（ボタンの小と同じ高さ・文字）。ふつうの大きさでは題より目立ち、グラフの上が重い
//   button: もう一方の形へ移る下線のボタン（「表で見る」）。グラフの上がいちばん軽い。場所は同じ題の行の右
//   切り替えの文言は部品そのものの操作なので既定を持ち、差し替えられる（原則20）
// 表の高さ（tableHeight）— ADR-0540
//   chart: 既定。グラフのときの凡例とグラフを合わせた高さにそろえ、切り替えても枠の高さを変えない（下の内容が跳ねない）
//     切り替える直前に凡例とグラフの高さを測り、表の場所の最低の高さと --chart-table-max-height にする
//     Table に maxHeight="var(--chart-table-max-height)" を渡すと、あふれた行は表の中でスクロールし、見出しの行が貼り付く
//     はじめから表を見せるときは測れないので、凡例の 1 行 + 間 + グラフの高さで見積もる
//   auto: 表は行の数だけ伸びる
// 題の大きさ（titleSize。ADR-0551）: sm は Stat のラベルと同じで既定、md・lg は見出しの段
// 読み込み中（loading）とデータがないとき（empty）は、グラフを描く場所に代わりのものを置き、凡例と切り替えを隠す
//   loadingIndicator（ADR-0549）: spinner は真ん中に回る円で既定、skeleton は描く場所を Skeleton で埋め、grid は淡いグリッドの線と文字
//     skeleton はグラフの形をしていない四角なので既定にしない（グラフの形の Skeleton は backlog）
//   emptyVariant（ADR-0548）: text は真ん中に淡い文字で既定、panel は StatusPanel の小、grid は淡いグリッドの線の上に文字
const chartFrame = tv({
  slots: {
    root: 'm-0 flex min-w-0 flex-col gap-(--chart-frame-gap)',
    header: 'flex items-start justify-between gap-3',
    heading: 'flex min-w-0 flex-col gap-0.5',
    title: '[font-weight:var(--font-weight-heading)] text-fg',
    description: 'm-0 text-(length:--text-caption) leading-(--leading-caption) text-fg-muted',
    // 小さな切り替え: ボタンの小（Button の size="sm"）と同じ寸法のトークンを、切り替えの中だけ差し替える
    toggle: 'shrink-0',
    body: 'flex min-w-0 flex-col gap-(--chart-frame-gap)',
    legend: 'flex min-w-0',
    tableArea: 'min-h-(--chart-table-max-height) min-w-0',
    plot: [
      'relative h-(--chart-height) w-full min-w-0',
      'text-(length:--text-caption) leading-(--leading-caption) tabular-nums',
    ],
    // 読み込み中・データなしの中身。描く場所と同じ高さに置く
    placeholder: [
      'relative flex h-(--chart-height) w-full min-w-0 items-center justify-center',
      'text-(length:--text-body-sm) leading-(--leading-body-sm) text-fg-muted',
    ],
    // 淡いグリッドの線（grid の形）: グリッドと同じ色の横線を、描く場所の高さを 4 つに割って引く
    placeholderGrid: [
      'pointer-events-none absolute inset-0',
      'bg-[repeating-linear-gradient(to_bottom,var(--color-chart-grid)_0,var(--color-chart-grid)_1px,transparent_1px,transparent_calc((100%-1px)/4))]',
    ],
    placeholderText: 'relative bg-surface px-2',
  },
  variants: {
    titleSize: {
      sm: { title: 'text-(length:--text-label) leading-(--leading-label)' },
      md: { title: 'text-(length:--text-heading-md) leading-(--leading-heading-md)' },
      lg: { title: 'text-(length:--text-heading-lg) leading-(--leading-heading-lg)' },
    },
    // 凡例の場所と寄せ（ADR-0542）。既定はグラフの下の中央で、図の注記のように添える。上下は legendPlacement で置く順を変える
    legendAlign: {
      center: { legend: 'justify-center' },
      start: { legend: 'justify-start' },
    },
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
  defaultVariants: { titleSize: 'sm', legendAlign: 'center', viewToggleSize: 'sm' },
});

export type ChartFrameView = 'chart' | 'table';
/** 切り替えの形。segmented は「グラフ・表」の切り替え、button はもう一方の形へ移る下線のボタン */
export type ChartFrameViewToggle = 'segmented' | 'button';
/** 切り替えの大きさ。sm はボタンの小と同じ、md はほかの欄と同じ */
export type ChartFrameViewToggleSize = 'sm' | 'md';
/** 凡例の場所。bottom はグラフの下、top は題の下（グラフの上） */
export type ChartFrameLegendPlacement = 'bottom' | 'top';
/** 凡例の横の寄せ */
export type ChartFrameLegendAlign = 'center' | 'start';
/** 題の大きさ。sm は Stat のラベルと同じ、md・lg は見出しの段 */
export type ChartFrameTitleSize = 'sm' | 'md' | 'lg';
/** 読み込み中の印。skeleton は描く場所を埋め、spinner は回る円、grid は淡いグリッドと文字 */
export type ChartFrameLoadingIndicator = 'skeleton' | 'spinner' | 'grid';
/** データがないときの見せ方。text は淡い文字、panel は StatusPanel、grid は淡いグリッドの上に文字 */
export type ChartFrameEmptyVariant = 'text' | 'panel' | 'grid';
/** 表の高さ。chart はグラフのときと同じ高さにそろえ、auto は行の数だけ伸びる */
export type ChartFrameTableHeight = 'chart' | 'auto';

export interface ChartFrameProps extends Omit<ComponentProps<'figure'>, 'children' | 'title'> {
  /** 題。グラフの上の見出しの行に出て、グラフの名前として読まれます */
  title?: ReactNode;
  /**
   * 題の大きさ。sm は Stat のラベルと同じ、md・lg は見出しの段です
   * @default 'sm'
   */
  titleSize?: ChartFrameTitleSize;
  /** 題の下に添える説明（期間・単位など） */
  description?: ReactNode;
  /** 凡例。ChartLegend を渡します */
  legend?: ReactNode;
  /**
   * 凡例の場所。bottom はグラフの下、top は題の下（グラフの上）です
   * @default 'bottom'
   */
  legendPlacement?: ChartFrameLegendPlacement;
  /**
   * 凡例の横の寄せ
   * @default 'center'
   */
  legendAlign?: ChartFrameLegendAlign;
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
   * 読み込み中にします。グラフを描く場所に読み込み中の印を置き、凡例と切り替えを隠します
   * @default false
   */
  loading?: boolean;
  /**
   * 読み込み中の印。spinner は真ん中に回る円、skeleton は描く場所を Skeleton で埋め、grid は淡いグリッドの線と文字です
   * @default 'spinner'
   */
  loadingIndicator?: ChartFrameLoadingIndicator;
  /**
   * 読み込み中の文字。spinner では読み上げだけ、grid では画面にも出ます
   * @default '読み込んでいます'
   */
  loadingText?: string;
  /**
   * データがないことを示します。グラフを描く場所に emptyText を置き、凡例と切り替えを隠します
   * @default false
   */
  empty?: boolean;
  /**
   * データがないときの文
   * @default 'データがありません'
   */
  emptyText?: ReactNode;
  /**
   * データがないときの見せ方。text は真ん中に淡い文字、panel は StatusPanel の小、grid は淡いグリッドの線の上に文字です
   * @default 'text'
   */
  emptyVariant?: ChartFrameEmptyVariant;
  /**
   * 表の高さ。chart はグラフのときの凡例とグラフを合わせた高さにそろえ、切り替えても枠の高さが変わりません。
   * Table に maxHeight="var(--chart-table-max-height)" を渡すと、あふれた行は表の中でスクロールし、見出しの行が貼り付きます。
   * auto は行の数だけ伸びます
   * @default 'chart'
   */
  tableHeight?: ChartFrameTableHeight;
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
  titleSize = 'sm',
  description,
  legend,
  legendPlacement = 'bottom',
  legendAlign = 'center',
  children,
  table,
  defaultView = 'chart',
  height,
  tableHeight = 'chart',
  loading = false,
  loadingIndicator = 'spinner',
  loadingText = '読み込んでいます',
  empty = false,
  emptyText = 'データがありません',
  emptyVariant = 'text',
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
  const styles = chartFrame({ titleSize, legendAlign, viewToggleSize });
  const titleId = useId();
  const [view, setView] = useState<ChartFrameView>(table ? defaultView : 'chart');
  const bodyRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState<number | null>(null);
  const waiting = loading || empty;
  const showTable = table != null && view === 'table' && !waiting;
  const hasToggle = table != null && !waiting;
  const hasHeader = title != null || description != null || hasToggle;
  // 読み上げは見た目の順（原則15）。CSS の order で動かさず、置く順を変える
  const legendNode =
    legend != null ? (
      <div data-slot="chart-frame-legend" className={styles.legend()}>
        {legend}
      </div>
    ) : null;
  const changeView = (next: ChartFrameView) => {
    // 表へ移る直前に、凡例とグラフを合わせた高さを測る（凡例が折り返しても合う）
    if (next === 'table' && bodyRef.current) setMeasured(bodyRef.current.offsetHeight);
    setView(next);
  };
  const tableMaxHeight =
    tableHeight !== 'chart' || table == null
      ? undefined
      : measured != null
        ? `${measured}px`
        : legend != null
          ? 'calc(var(--leading-label) + var(--chart-frame-gap) + var(--chart-height))'
          : 'var(--chart-height)';
  const rootStyle: CSSProperties & Record<`--${string}`, string> = { ...style };
  if (height != null)
    rootStyle['--chart-height'] = typeof height === 'number' ? `${height}px` : height;
  if (tableMaxHeight) rootStyle['--chart-table-max-height'] = tableMaxHeight;
  return (
    <figure
      data-slot="chart-frame"
      aria-labelledby={title != null ? titleId : undefined}
      aria-busy={loading || undefined}
      className={styles.root({ className })}
      style={rootStyle}
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
          {hasToggle ? (
            <div className={styles.toggle()} data-view-toggle={viewToggle}>
              {viewToggle === 'button' ? (
                <Button
                  variant="underline"
                  onClick={() => changeView(showTable ? 'chart' : 'table')}
                >
                  {showTable ? showChartLabel : showTableLabel}
                </Button>
              ) : (
                <SegmentedControl<ChartFrameView>
                  accessibleName={viewToggleName}
                  value={view}
                  onValueChange={changeView}
                >
                  <SegmentedControlItem value="chart">{chartLabel}</SegmentedControlItem>
                  <SegmentedControlItem value="table">{tableLabel}</SegmentedControlItem>
                </SegmentedControl>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
      {waiting ? (
        <div
          data-slot="chart-frame-placeholder"
          data-state={loading ? 'loading' : 'empty'}
          className={styles.placeholder()}
        >
          {loading ? (
            loadingIndicator === 'spinner' ? (
              <Spinner size="lg" accessibleName={loadingText} />
            ) : loadingIndicator === 'grid' ? (
              <>
                <span aria-hidden className={styles.placeholderGrid()} />
                <span role="status" className={styles.placeholderText()}>
                  {loadingText}
                </span>
              </>
            ) : (
              <>
                <Skeleton variant="block" radius="card" className="absolute inset-0 size-full" />
                <span role="status" className="sr-only">
                  {loadingText}
                </span>
              </>
            )
          ) : emptyVariant === 'panel' ? (
            <StatusPanel size="sm" title={emptyText} headingLevel={3} />
          ) : (
            <>
              {emptyVariant === 'grid' ? (
                <span aria-hidden className={styles.placeholderGrid()} />
              ) : null}
              <span className={styles.placeholderText()}>{emptyText}</span>
            </>
          )}
        </div>
      ) : showTable ? (
        <div data-slot="chart-frame-table" className={styles.tableArea()}>
          {table}
        </div>
      ) : (
        <div ref={bodyRef} className={styles.body()}>
          {legendPlacement === 'top' ? legendNode : null}
          <div className={styles.plot()}>{children}</div>
          {legendPlacement === 'bottom' ? legendNode : null}
        </div>
      )}
    </figure>
  );
}
