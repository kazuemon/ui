'use client';

import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { type ComponentProps, type ReactElement, type ReactNode, useEffect, useRef } from 'react';

import { focusRing } from '../../internal/focus-styles';
import { scrollAreaStyles } from '../../internal/scroll-area-styles';
import { tv } from '../../internal/tv';
import { useInlineCues } from '../../internal/use-inline-cues';
import { useMergedRefs } from '../../internal/use-merged-refs';

// タブ。値は design/tokens.css の --tabs-*
//   振る舞い（矢印キーで移る・読み上げの tablist/tab/tabpanel）は Base UI の Tabs
//   タブは平らな押すもの: hover は本文の色を淡く敷き、押すと沈む（原則3・ADR-0027）。選んでいるタブは押しても変わらないので、hover も沈みもしない
//   選んだタブの印は 1 つの要素（Tabs.Indicator）で描き、選んだタブの位置へ動く。見た目は indicator（軸 118・決定、ADR-0146）、動きは indicatorMotion（軸 119・決定、ADR-0147）
//     色は部品の色（原則6）。指定しないときはグレー（濃いグレーの線・グレーの面）。フォーカスの線も部品の色（ADR-0071）
//     indicator・indicatorMotion が選ぶ値は、Tabs のルートに内部の CSS 変数（--tabs-indicator-*・--tabs-list-*・--tabs-tab-color）として置き、他のスロットはその変数だけを読む
//   選んだタブの文字は太くする。太くしても幅が変わらないよう、太字の写しを見えないまま重ねて幅を取っておく（印が動くあいだにタブが揺れない）
//   縦向き（orientation="vertical"）: 並びを左、中身を右に置く。印は縦の棒、並びの線も縦に立てる（軸 264・比べている途中。--tabs-vertical-*）
//   並びが入り切らないときは横にスクロールする。続きは左右の端の内側の影で見せ、つまみは載せたときだけ出す（原則1。ScrollArea と同じ）
//     枠そのものには Tab で止まらない（タブにフォーカスすると、そのタブが見える位置までスクロールする）
//     フォーカスの線が枠で切れないよう、枠を外へ広げ、同じだけ内側に余白を取る（--tabs-ring-room）
//   押せないタブは、色を持たない押すものと同じく薄いグレーの文字（原則1）
//   フォーカスの線（軸 120・決定、ADR-0148）: タブは内側に引く（--tabs-tab-focus-offset。外に離すと下の印・並びの線を越える）
//     パネルは全体と同じ離れで、角を小さくする（--tabs-panel-radius。1 行のパネルでも pill に見えない）
//   はじめに選んでおいたタブが見えている範囲の外にあるとき、マウント時にその位置までスクロールする（動きを減らす設定では滑らせない）
//     縦向きのときはしない（縦の並びは横にあふれず、外の枠まで動いてしまう）

export type TabsColor = 'neutral' | 'primary' | 'secondary';

/**
 * 選んだタブの印。line: 下の線＋並び全体の下の境界線（既定）。underline: 下の線だけ（境界線なし）。
 * subtle: 部品の色の淡い面の pill。segmented: 入力欄と同じ溝に白いつまみ。text: 印を出さず、文字の色だけで示す
 */
export type TabsIndicator = 'line' | 'underline' | 'subtle' | 'segmented' | 'text';

/** 並べる向き。horizontal: 横に並べ、中身は下（既定）。vertical: 縦に積み、中身は右 */
export type TabsOrientation = 'horizontal' | 'vertical';

/** 選んだタブが変わったときの印の動き。slide: 印が滑って移る（既定）。none: 動かさずすぐ切り替える */
export type TabsIndicatorMotion = 'slide' | 'none';

/** タブの値。Tab と TabPanel を結び付けます */
export type TabValue = string | number | null;

/** タブの並びと中身のあいだの余白。段は Stack の gap と同じです */
export type TabsPanelGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const tabs = tv({
  slots: {
    root: [
      'flex min-w-0 flex-col',
      // 縦向き: 並びを左、中身を右に置く（並びは中身の高さに引き伸ばさない）
      'data-[orientation=vertical]:flex-row data-[orientation=vertical]:items-start',
    ],
    // フォーカスの線（外に 4px）が枠で切れないよう、枠を広げて内側に余白を取る
    scroller: [
      '-m-(--tabs-ring-room) [--tabs-ring-room:calc(var(--focus-ring-offset)+var(--focus-ring-width))]',
      // 縦向き: 並びは中身に押し潰されない
      'in-data-[orientation=vertical]:shrink-0',
    ],
    // 並びの下の細い線（line の印と組む）。幅いっぱいに引くので、並びではなく中身の包みに描く
    content: [
      'relative isolate p-(--tabs-ring-room)',
      "after:pointer-events-none after:absolute after:inset-x-(--tabs-ring-room) after:bottom-(--tabs-ring-room) after:-z-1 after:h-(--tabs-line-width) after:bg-line after:opacity-(--tabs-list-line-opacity) after:content-['']",
      // 縦向き: 線は並びの横に立てる。中身に近い側か外側かは --tabs-vertical-side（1 なら中身側。軸 264・比べている途中）
      'in-data-[orientation=vertical]:after:top-(--tabs-ring-room) in-data-[orientation=vertical]:after:right-auto in-data-[orientation=vertical]:after:h-auto in-data-[orientation=vertical]:after:w-(--tabs-line-width)',
      'in-data-[orientation=vertical]:after:left-[calc(var(--tabs-ring-room)+var(--tabs-vertical-side)*(100%-2*var(--tabs-ring-room)-var(--tabs-line-width)))]',
    ],
    list: [
      'relative isolate flex w-max items-center gap-(--tabs-gap)',
      // 溝（segmented）: 並びにグレーを敷き、内側に余白を取る。角は小物の pill
      'rounded-pill bg-(color:--tabs-list-bg) p-(--tabs-list-pad)',
      // 縦向き: タブを縦に積む。並びの幅は --tabs-vertical-list-width、寄せは --tabs-vertical-tab-align（軸 264・比べている途中）
      //   溝（segmented）の角は、縦に長い溝でも pill にせず、タブの pill と同心にする（原則5）
      'data-[orientation=vertical]:w-(--tabs-vertical-list-width) data-[orientation=vertical]:flex-col',
      'data-[orientation=vertical]:rounded-[calc(var(--spacing-control)/2)]',
      'data-[orientation=vertical]:[align-items:var(--tabs-vertical-tab-align)]',
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
      // 縦向き: 文字の寄せは並びの寄せと同じ（stretch のときは行頭から）
      'data-[orientation=vertical]:[justify-content:var(--tabs-vertical-tab-align)]',
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
      // 縦向き: 印はタブの高さいっぱいの縦の棒（full が 1 ならタブ全体）。立てる側は --tabs-vertical-side（軸 264・比べている途中）
      //   棒は並びの端（横向きで並びの線の上に乗るのと同じ）。タブが幅いっぱいでなくても、線と同じ位置に立つ
      'data-[orientation=vertical]:[top:var(--active-tab-top)] data-[orientation=vertical]:[bottom:var(--active-tab-bottom)] data-[orientation=vertical]:[height:auto]',
      'data-[orientation=vertical]:[left:calc(var(--active-tab-left)*var(--tabs-indicator-full)+(1-var(--tabs-indicator-full))*var(--tabs-vertical-side)*(100%-var(--tabs-indicator-bar)))]',
      'data-[orientation=vertical]:[right:calc(var(--active-tab-right)*var(--tabs-indicator-full)+(1-var(--tabs-indicator-full))*(1-var(--tabs-vertical-side))*(100%-var(--tabs-indicator-bar)))]',
      'rounded-(--tabs-indicator-radius) opacity-(--tabs-indicator-opacity) shadow-(--tabs-indicator-shadow)',
      'bg-(color:--tabs-indicator-bg)',
      '[transition:left_var(--tabs-indicator-duration)_var(--tabs-indicator-ease),right_var(--tabs-indicator-duration)_var(--tabs-indicator-ease),top_var(--tabs-indicator-duration)_var(--tabs-indicator-ease),bottom_var(--tabs-indicator-duration)_var(--tabs-indicator-ease),height_var(--tabs-indicator-duration)_var(--tabs-indicator-ease)]',
      'motion-reduce:[transition:none]',
    ],
    panel: [
      // 角は小さく、1 行でもフォーカスの線が pill に見えない（軸 120）
      // 中身の上の余白は panelGap（既定は Stack の md と同じ）。Tabs が --tabs-panel-pad に配る（ADR-0254 の M-04）
      'mt-(--tabs-panel-gap) rounded-(--tabs-panel-radius) pt-(--tabs-panel-pad)',
      // 縦向き: 中身は並びの右。上の余白は横の余白に置き換える
      'data-[orientation=vertical]:mt-0 data-[orientation=vertical]:ml-(--tabs-panel-gap) data-[orientation=vertical]:pt-0 data-[orientation=vertical]:pl-(--tabs-panel-pad)',
      'data-[orientation=vertical]:min-w-0 data-[orientation=vertical]:flex-1',
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
    // 並びと中身のあいだの余白（ADR-0254 の M-04）。段は Stack の gap と同じ値を使う
    panelGap: {
      none: { root: '[--tabs-panel-pad:0px]' },
      xs: { root: '[--tabs-panel-pad:var(--stack-gap-xs)]' },
      sm: { root: '[--tabs-panel-pad:var(--stack-gap-sm)]' },
      md: { root: '[--tabs-panel-pad:var(--stack-gap-md)]' },
      lg: { root: '[--tabs-panel-pad:var(--stack-gap-lg)]' },
      xl: { root: '[--tabs-panel-pad:var(--stack-gap-xl)]' },
    },
  },
  defaultVariants: {
    color: 'neutral',
    indicator: 'line',
    indicatorMotion: 'slide',
    panelGap: 'md',
  },
});

const scroll = scrollAreaStyles({ scrollbar: 'scroll' });

export interface TabsProps extends Omit<ComponentProps<'div'>, 'color' | 'defaultValue'> {
  /** 選んでいるタブの value（制御） */
  value?: TabValue;
  /**
   * はじめに選んでいるタブの value（非制御）
   * @default 0
   */
  defaultValue?: TabValue;
  /** 選ぶタブが変わるときに、次の値を渡して呼びます */
  onValueChange?: (value: TabValue) => void;
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
  /**
   * 並べる向き。horizontal はタブを横に並べて中身を下に、vertical はタブを縦に積んで中身を右に置きます。
   * 縦のときは、上下の矢印キーでタブを移ります
   * @default 'horizontal'
   */
  orientation?: TabsOrientation;
  /**
   * 中身（TabPanel）と並びのあいだの余白。並びとの隙間（--tabs-panel-gap）に足す分で、段は Stack の gap と同じです。
   * none にすると隙間だけになります。すべての TabPanel に配ります
   * @default 'md'
   */
  panelGap?: TabsPanelGap;
  /** いちばん外の要素（div）に付きます */
  className?: string;
  /** TabList と TabPanel を並べます */
  children?: ReactNode;
}

/**
 * タブ。見出し（Tab）を 1 列に並べ、選んだものの中身（TabPanel）だけを出します。
 * `orientation="vertical"` にすると、見出しを縦に積み、中身を右に置きます
 */
export function Tabs({
  value,
  defaultValue,
  onValueChange,
  color,
  indicator,
  indicatorMotion,
  orientation,
  panelGap,
  className,
  ...props
}: TabsProps) {
  return (
    <BaseTabs.Root
      {...props}
      data-slot="tabs"
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (next: TabValue) => onValueChange(next) : undefined}
      orientation={orientation}
      className={tabs({ color, indicator, indicatorMotion, panelGap }).root({ className })}
    />
  );
}

export interface TabListProps extends ComponentProps<'div'> {
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
  /** 並びの枠（横にスクロールする外側の要素）に付きます */
  className?: string;
}

/**
 * Tab を並べる列。横向きでは横に並べ、入り切らないときは横にスクロールします。
 * Tabs が `orientation="vertical"` のときは縦に積みます
 */
export function TabList({ className, children, ref, ...props }: TabListProps) {
  const s = tabs();
  const inlineCues = useInlineCues();
  const listRef = useRef<HTMLDivElement>(null);
  // 内部の ref（はじめのスクロールに使う）と、利用者が渡した ref をつなぐ（ADR-0250）
  const mergedRef = useMergedRefs(listRef, ref);

  // はじめに選んでおいたタブが、見えている範囲の外にあるとき、その位置までスクロールして見せる
  // 動きを減らす設定では滑らせない。あとでタブを選び直したときは、Base UI のフォーカス移動でスクロールする
  useEffect(() => {
    const list = listRef.current;
    // 縦向きでは滑らせない（縦の並びは横にあふれず、外の枠まで動いてしまう）
    if (!list || list.dataset.orientation === 'vertical') return;
    const active = list.querySelector<HTMLElement>('[data-slot="tab"][data-active]');
    if (!active) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    active.scrollIntoView({
      behavior: reduceMotion ? 'instant' : 'smooth',
      inline: 'nearest',
      block: 'nearest',
    });
  }, []);

  return (
    <BaseScrollArea.Root
      data-slot="tab-list-scroller"
      className={scroll.root({ className: s.scroller({ className }) })}
    >
      {/* 枠には Tab で止まらない（スクロールはタブへのフォーカスで起こる） */}
      <BaseScrollArea.Viewport ref={inlineCues} tabIndex={-1} className={scroll.viewport()}>
        <BaseScrollArea.Content className={s.content()}>
          <BaseTabs.List {...props} ref={mergedRef} data-slot="tab-list" className={s.list()}>
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

export interface TabProps extends Omit<ComponentProps<'button'>, 'children' | 'value'> {
  /** このタブの値。同じ値の TabPanel を出します */
  value: TabValue;
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
  /** タブ（button。render を渡したときはその要素）に付きます */
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
      {...props}
      data-slot="tab"
      render={render}
      nativeButton={render === undefined}
      className={s.tab({ className })}
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

export interface TabPanelProps extends Omit<ComponentProps<'div'>, 'value' | 'defaultValue'> {
  /** 対応する Tab の value */
  value: TabValue;
  /**
   * 選んでいないあいだも中身を DOM に残すか（入力した値やスクロールの位置を残したいとき）
   * @default false
   */
  keepMounted?: boolean;
  /** 中身。上の余白は Tabs の panelGap で決まります */
  children?: ReactNode;
  /** 中身の要素（div）に付きます */
  className?: string;
  /** 描く要素（Base UI の render と同じ） */
  render?: ReactElement;
}

/**
 * タブの中身。同じ value の Tab を選んでいるときだけ出します
 *
 * キーボードでフォーカスすると線が出ます。1 行だけの中身でも線が pill に見えないよう、角は小さくしてあります。`className` で角を大きくすると、線が pill に見えます
 */
export function TabPanel({ className, ...props }: TabPanelProps) {
  return (
    <BaseTabs.Panel {...props} data-slot="tab-panel" className={tabs().panel({ className })} />
  );
}
