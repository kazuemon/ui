import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import type { ComponentProps, ReactElement, ReactNode } from 'react';

import { focusRing } from '../../internal/focus-styles';
import { scrollAreaStyles } from '../../internal/scroll-area-styles';
import { tv } from '../../internal/tv';
import { useInlineCues } from '../../internal/use-inline-cues';

// タブ。値は design/tokens.css の --tabs-*
//   振る舞い（矢印キーで移る・読み上げの tablist/tab/tabpanel）は Base UI の Tabs
//   タブは平らな押すもの: hover は本文の色を淡く敷き、押すと沈む（原則3・ADR-0027）。選んでいるタブは押しても変わらないので、hover も沈みもしない
//   選んだタブの印は 1 つの要素（Tabs.Indicator）で描き、選んだタブの位置へ動く。見た目は indicator（軸 118・決定、ADR-0146）、動きは indicatorMotion（軸 119・決定、ADR-0147）
//     色は部品の色（原則6）。指定しないときはグレー（濃いグレーの線・グレーの面）。フォーカスの線も部品の色（ADR-0071）
//     indicator・indicatorMotion が選ぶ値は、Tabs のルートに内部の CSS 変数（--tabs-indicator-*・--tabs-list-*・--tabs-tab-color）として置き、他のスロットはその変数だけを読む
//   選んだタブの文字は太くする。太くしても幅が変わらないよう、太字の写しを見えないまま重ねて幅を取っておく（印が動くあいだにタブが揺れない）
//   並びが入り切らないときは横にスクロールする。続きは左右の端の内側の影で見せ、つまみは載せたときだけ出す（原則1。ScrollArea と同じ）
//     枠そのものには Tab で止まらない（タブにフォーカスすると、そのタブが見える位置までスクロールする）
//     フォーカスの線が枠で切れないよう、枠を外へ広げ、同じだけ内側に余白を取る（--tabs-ring-room）
//   押せないタブは、色を持たない押すものと同じく薄いグレーの文字（原則1）
//   フォーカスの線（軸 120・決定、ADR-0148）: タブは内側に引く（--tabs-tab-focus-offset。外に離すと下の印・並びの線を越える）
//     パネルは全体と同じ離れで、角を小さくする（--tabs-panel-radius。1 行のパネルでも pill に見えない）

export type TabsColor = 'neutral' | 'primary' | 'secondary';

/**
 * 選んだタブの印。line: 下の線＋並び全体の下の境界線（既定）。underline: 下の線だけ（境界線なし）。
 * subtle: 部品の色の淡い面の pill。segmented: 入力欄と同じ溝に白いつまみ。text: 印を出さず、文字の色だけで示す
 */
export type TabsIndicator = 'line' | 'underline' | 'subtle' | 'segmented' | 'text';

/** 選んだタブが変わったときの印の動き。slide: 印が滑って移る（既定）。none: 動かさずすぐ切り替える */
export type TabsIndicatorMotion = 'slide' | 'none';

const tabs = tv({
  slots: {
    root: 'flex min-w-0 flex-col',
    // フォーカスの線（外に 4px）が枠で切れないよう、枠を広げて内側に余白を取る
    scroller:
      '-m-(--tabs-ring-room) [--tabs-ring-room:calc(var(--focus-ring-offset)+var(--focus-ring-width))]',
    // 並びの下の細い線（line の印と組む）。幅いっぱいに引くので、並びではなく中身の包みに描く
    content: [
      'relative isolate p-(--tabs-ring-room)',
      "after:pointer-events-none after:absolute after:inset-x-(--tabs-ring-room) after:bottom-(--tabs-ring-room) after:-z-1 after:h-(--tabs-line-width) after:bg-line after:opacity-(--tabs-list-line-opacity) after:content-['']",
    ],
    list: [
      'relative isolate flex w-max items-center gap-(--tabs-gap)',
      // 溝（segmented）: 並びにグレーを敷き、内側に余白を取る。角は小物の pill
      'rounded-pill bg-(color:--tabs-list-bg) p-(--tabs-list-pad)',
    ],
    tab: [
      'relative z-1 inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap select-none',
      'h-[calc(var(--spacing-control)-var(--tabs-list-pad)*2)] rounded-(--tabs-tab-radius) px-(--spacing-control-x)',
      'text-(length:--text-control) leading-(--leading-control) text-fg-muted',
      // 選んだタブ: 太く、indicator が選ぶ色（--tabs-tab-color。本文の色か部品の色）
      'data-active:cursor-default data-active:font-bold data-active:text-(color:--tabs-tab-color)',
      // hover と押下は、選んでいない押せるタブだけ
      'bg-(color:--flat-bg) [--flat-bg:transparent]',
      'not-data-active:not-data-disabled:hover:[--flat-bg:color-mix(in_oklab,var(--color-fg)_var(--flat-hover-mix),transparent)]',
      'not-data-active:not-data-disabled:active:translate-y-(--flat-press-depth) not-data-active:not-data-disabled:active:[--flat-bg:color-mix(in_oklab,var(--color-fg)_var(--flat-press-mix),transparent)]',
      'data-disabled:cursor-not-allowed data-disabled:text-on-field-disabled',
      // フォーカスの線は内側に引く（軸 120）
      '[--focus-ring-offset:var(--tabs-tab-focus-offset)]',
      '[transition:--flat-bg_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
      ...focusRing,
    ],
    // 見える中身と、幅を取っておく太字の写し（同じ升に重ねる）
    tabInner: 'inline-grid',
    tabLabel: 'col-start-1 row-start-1 inline-flex items-center justify-center gap-2',
    tabSizer:
      'invisible col-start-1 row-start-1 inline-flex items-center justify-center gap-2 font-bold',
    tabIcon: 'inline-flex shrink-0 [&_svg]:size-(--spacing-icon)',
    indicator: [
      'pointer-events-none absolute z-0',
      // 位置は Base UI が書く --active-tab-*（並びの左上から）
      'right-(--active-tab-right) left-(--active-tab-left)',
      // --active-tab-* は Base UI がこの要素にだけ書くので、位置はここで解く。--tabs-indicator-full が 1 ならタブ全体、0 なら下の線
      '[top:calc(var(--active-tab-top)+(var(--active-tab-height)-var(--tabs-indicator-bar))*(1-var(--tabs-indicator-full)))]',
      '[height:calc(var(--tabs-indicator-bar)+(var(--active-tab-height)-var(--tabs-indicator-bar))*var(--tabs-indicator-full))]',
      'rounded-(--tabs-indicator-radius) opacity-(--tabs-indicator-opacity) shadow-(--tabs-indicator-shadow)',
      'bg-(color:--tabs-indicator-bg)',
      '[transition:left_var(--tabs-indicator-duration)_var(--tabs-indicator-ease),right_var(--tabs-indicator-duration)_var(--tabs-indicator-ease),top_var(--tabs-indicator-duration)_var(--tabs-indicator-ease),height_var(--tabs-indicator-duration)_var(--tabs-indicator-ease)]',
      'motion-reduce:[transition:none]',
    ],
    panel: [
      // 角は小さく、1 行でもフォーカスの線が pill に見えない（軸 120）
      'mt-(--tabs-panel-gap) rounded-(--tabs-panel-radius)',
      '[transition:outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
      ...focusRing,
    ],
  },
  variants: {
    // 利用者が選ぶ色（原則6）。own は印の濃い色、own-subtle は淡い面、own-text は淡い面の上の文字
    color: {
      neutral: {
        root: '[--tabs-own-subtle:var(--color-neutral)] [--tabs-own-text:var(--color-fg)] [--tabs-own:var(--color-neutral-strong)]',
      },
      primary: {
        root: '[--color-own-focus:var(--color-primary)] [--tabs-own-subtle:var(--color-primary-subtle)] [--tabs-own-text:var(--color-on-primary-subtle)] [--tabs-own:var(--color-primary)]',
      },
      secondary: {
        root: '[--color-own-focus:var(--color-fg-secondary)] [--tabs-own-subtle:var(--color-secondary-subtle)] [--tabs-own-text:var(--color-on-secondary-subtle)] [--tabs-own:var(--color-fg-secondary)]',
      },
    },
    // 選んだタブの印（軸 118・決定、ADR-0146）。各案が --tabs-indicator-*・--tabs-list-*・--tabs-tab-color を決めきる
    indicator: {
      line: {
        root: [
          '[--tabs-indicator-full:0]',
          '[--tabs-indicator-bg:var(--tabs-own)] [--tabs-indicator-opacity:1] [--tabs-indicator-shadow:none]',
          '[--tabs-tab-color:var(--color-fg)]',
          '[--tabs-list-line-opacity:1] [--tabs-list-bg:transparent] [--tabs-list-pad:0px]',
        ].join(' '),
      },
      underline: {
        root: [
          '[--tabs-indicator-full:0]',
          '[--tabs-indicator-bg:var(--tabs-own)] [--tabs-indicator-opacity:1] [--tabs-indicator-shadow:none]',
          '[--tabs-tab-color:var(--color-fg)]',
          '[--tabs-list-line-opacity:0] [--tabs-list-bg:transparent] [--tabs-list-pad:0px]',
        ].join(' '),
      },
      subtle: {
        root: [
          '[--tabs-indicator-full:1]',
          '[--tabs-indicator-bg:var(--tabs-own-subtle)] [--tabs-indicator-opacity:1] [--tabs-indicator-shadow:none]',
          '[--tabs-tab-color:var(--tabs-own-text)]',
          '[--tabs-list-line-opacity:0] [--tabs-list-bg:transparent] [--tabs-list-pad:0px]',
        ].join(' '),
      },
      segmented: {
        root: [
          '[--tabs-indicator-full:1]',
          '[--tabs-indicator-bg:var(--color-surface)] [--tabs-indicator-opacity:1] [--tabs-indicator-shadow:var(--shadow-switch-knob)]',
          '[--tabs-tab-color:var(--tabs-own-text)]',
          '[--tabs-list-line-opacity:0] [--tabs-list-bg:var(--color-field)] [--tabs-list-pad:var(--spacing)]',
        ].join(' '),
      },
      text: {
        root: [
          '[--tabs-indicator-full:0]',
          '[--tabs-indicator-bg:var(--tabs-own)] [--tabs-indicator-opacity:0] [--tabs-indicator-shadow:none]',
          '[--tabs-tab-color:var(--tabs-own-text)]',
          '[--tabs-list-line-opacity:0] [--tabs-list-bg:transparent] [--tabs-list-pad:0px]',
        ].join(' '),
      },
    },
    // 印の動き（軸 119・決定、ADR-0147）。既定は滑る。none はすぐ切り替える
    indicatorMotion: {
      slide: { root: '[--tabs-indicator-duration:var(--duration-normal)]' },
      none: { root: '[--tabs-indicator-duration:0ms]' },
    },
  },
  defaultVariants: { color: 'neutral', indicator: 'line', indicatorMotion: 'slide' },
});

const scroll = scrollAreaStyles({ scrollbar: 'scroll' });

export interface TabsProps extends Omit<
  ComponentProps<typeof BaseTabs.Root>,
  'className' | 'color' | 'orientation' | 'render'
> {
  /** 選んでいるタブの value（外で持つとき）。onValueChange と組みます */
  value?: BaseTabs.Root.Props['value'];
  /**
   * はじめに選んでおくタブの value（外で持たないとき）
   * @default 0
   */
  defaultValue?: BaseTabs.Root.Props['defaultValue'];
  /** 選ぶタブが変わったとき */
  onValueChange?: BaseTabs.Root.Props['onValueChange'];
  /**
   * 色。選んだタブの印とフォーカスの線の色です。primary・secondary は利用者が選ぶ色で、指定しないときはグレー（neutral）です
   * @default 'neutral'
   */
  color?: TabsColor;
  /**
   * 選んだタブの印。line は下の線＋並び全体の下の境界線、underline は下の線だけ、subtle は部品の色の淡い面の
   * pill、segmented は入力欄と同じ溝に白いつまみ、text は印を出さず文字の色だけで示します
   * @default 'line'
   */
  indicator?: TabsIndicator;
  /**
   * 選んだタブが変わったときの印の動き。slide は印が滑って移り、none はすぐ切り替えます
   * @default 'slide'
   */
  indicatorMotion?: TabsIndicatorMotion;
  className?: string;
  /** TabList と TabPanel を並べます */
  children?: ReactNode;
}

/**
 * タブ。見出し（Tab）を 1 列に並べ、選んだものの中身（TabPanel）だけを出します
 */
export function Tabs({ color, indicator, indicatorMotion, className, ...props }: TabsProps) {
  return (
    <BaseTabs.Root
      data-slot="tabs"
      className={tabs({ color, indicator, indicatorMotion }).root({ className })}
      {...props}
    />
  );
}

export interface TabListProps extends Omit<
  ComponentProps<typeof BaseTabs.List>,
  'className' | 'render'
> {
  /**
   * 矢印キーで移ったとき、すぐにそのタブを選ぶか。false のときは Enter か Space で選びます。
   * 中身を出すのが軽いときは true にすると、見比べやすくなります
   * @default false
   */
  activateOnFocus?: boolean;
  /**
   * 端のタブで矢印キーを押したとき、反対の端へ回るか
   * @default true
   */
  loopFocus?: boolean;
  /** 並びの読み上げの名前（aria-label）。見出しが近くにないときに付けます */
  'aria-label'?: string;
  /** 並べる Tab */
  children?: ReactNode;
  className?: string;
}

/**
 * Tab を横に並べる列。入り切らないときは横にスクロールします
 */
export function TabList({ className, children, ...props }: TabListProps) {
  const s = tabs();
  const inlineCues = useInlineCues();
  return (
    <BaseScrollArea.Root
      data-slot="tab-list-scroller"
      className={scroll.root({ className: s.scroller({ className }) })}
    >
      {/* 枠には Tab で止まらない（スクロールはタブへのフォーカスで起こる） */}
      <BaseScrollArea.Viewport ref={inlineCues} tabIndex={-1} className={scroll.viewport()}>
        <BaseScrollArea.Content className={s.content()}>
          <BaseTabs.List data-slot="tab-list" className={s.list()} {...props}>
            <BaseTabs.Indicator data-slot="tab-indicator" className={s.indicator()} />
            {children}
          </BaseTabs.List>
        </BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      <div className={scroll.edges()}>
        <div
          aria-hidden
          className={scroll.edgeX({ className: 'left-0 bg-linear-to-r' })}
          style={{ opacity: 'var(--cue-x-start)' }}
        />
        <div
          aria-hidden
          className={scroll.edgeX({ className: 'right-0 bg-linear-to-l' })}
          style={{ opacity: 'var(--cue-x-end)' }}
        />
      </div>
      <BaseScrollArea.Scrollbar orientation="horizontal" className={scroll.scrollbar()}>
        <BaseScrollArea.Thumb className={scroll.thumb()} />
      </BaseScrollArea.Scrollbar>
    </BaseScrollArea.Root>
  );
}

export interface TabProps extends Omit<
  ComponentProps<typeof BaseTabs.Tab>,
  'className' | 'render' | 'nativeButton' | 'children'
> {
  /** このタブの値。同じ値の TabPanel を出します */
  value: BaseTabs.Tab.Props['value'];
  /**
   * 押せなくします。矢印キーでは止まり（読み上げで「利用不可」と分かる）、選べません
   * @default false
   */
  disabled?: boolean;
  /** 見出しの前に置くアイコン。部品の中の文字と並ぶ大きさになります */
  icon?: ReactNode;
  /** 見出し。後ろに Badge（件数）を置けます */
  children?: ReactNode;
  /**
   * 描く要素（Base UI の render と同じ）。ページを移るタブにするときは、リンク（Next.js の Link など）を渡します
   */
  render?: ReactElement;
  className?: string;
}

/**
 * タブの見出し。TabList の中に並べます
 */
export function Tab({ icon, children, render, className, ...props }: TabProps) {
  const s = tabs();
  const content = (
    <>
      {icon && <span className={s.tabIcon()}>{icon}</span>}
      {children}
    </>
  );
  return (
    <BaseTabs.Tab
      data-slot="tab"
      render={render}
      nativeButton={render === undefined}
      className={s.tab({ className })}
      {...props}
    >
      <span className={s.tabInner()}>
        <span className={s.tabLabel()}>{content}</span>
        <span aria-hidden="true" className={s.tabSizer()}>
          {content}
        </span>
      </span>
    </BaseTabs.Tab>
  );
}

export interface TabPanelProps extends Omit<
  ComponentProps<typeof BaseTabs.Panel>,
  'className' | 'render'
> {
  /** 対応する Tab の value */
  value: BaseTabs.Panel.Props['value'];
  /**
   * 選んでいないあいだも中身を DOM に残すか（入力した値やスクロールの位置を残したいとき）
   * @default false
   */
  keepMounted?: boolean;
  className?: string;
}

/**
 * タブの中身。同じ value の Tab を選んでいるときだけ出します
 *
 * キーボードでフォーカスすると線が出ます。1 行だけの中身でも線が pill に見えないよう、角は小さくしてあります。`className` で角を大きくすると、線が pill に見えます
 */
export function TabPanel({ className, ...props }: TabPanelProps) {
  return (
    <BaseTabs.Panel data-slot="tab-panel" className={tabs().panel({ className })} {...props} />
  );
}
