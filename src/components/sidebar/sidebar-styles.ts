import { focusRing } from '../../internal/focus-styles';
import { tv } from '../../internal/tv';

// ページの横に並ぶ列 — ADR-0350〜0357
//   行は Tree の行と同じ考え（一覧の項目の仲間。hover は入力欄の塗り、いまいる行は部品の色に従う。原則3・6）
//   開いた形と畳んだ形で、アイコンの位置が動かない（行の左右の余白を、畳んだ列の幅の中央から決める）
//   幅は Tailwind の width ではなく、部品のトークン（--sidebar-width・--sidebar-rail-width）で動かす
const colorScope = {
  primary:
    '[--sidebar-current-bg:var(--color-primary-subtle)] [--sidebar-current-fg:var(--color-on-primary-subtle)]',
  secondary:
    '[--sidebar-current-bg:var(--color-secondary-subtle)] [--sidebar-current-fg:var(--color-on-secondary-subtle)]',
  neutral: '',
};

export const sidebar = tv({
  slots: {
    // 広い画面の列
    // 内側の余白は、題・スクロールの中身・下端のボタンがそれぞれ持つ（スクロールの枠の外に余白を取ると、影が列の端まで届かず、下に空きができる）
    // 面の地と本文との境の線は、部品のトークン（軸 382 で比較中）
    root: [
      'relative flex shrink-0 flex-col overflow-hidden border-e-(length:--sidebar-line-width) border-line bg-(color:--sidebar-bg)',
      'data-resizing:transition-none',
    ],
    // 上下に固定する場所（header・footer）。スクロールする中身との境に線を引く（軸 379 で比較中）
    head: 'shrink-0 border-b-(length:--sidebar-edge-line-width) border-line bg-(color:--sidebar-edge-bg) px-(--sidebar-padding) pt-(--sidebar-padding) pb-2',
    // Drawer の中の並び
    drawer: 'flex flex-col gap-1',
    // 行の並び（ScrollArea の枠）。余白は中身に持たせ、スクロールとともに動く。フォーカスの線が切れない
    list: 'min-h-0 flex-1',
    listContent: 'p-(--sidebar-padding)',
    footer:
      'flex shrink-0 flex-col gap-0.5 border-t-(length:--sidebar-edge-line-width) border-line bg-(color:--sidebar-edge-bg) px-(--sidebar-padding) pt-2 pb-(--sidebar-padding)',
    // 列の端の幅を変えるつまみ。本文との境の線の上に、つかめる幅を半分ずつ重ねる（軸 383 で比較中）
    handleSlot: 'relative z-3 w-0 shrink-0',
    handle: [
      'group/sidebar-handle absolute inset-y-0 -start-[calc(var(--sidebar-handle-hit)/2)] w-(--sidebar-handle-hit) cursor-col-resize touch-none outline-none',
      // 線: 載せたとき・動かしているとき・フォーカスしたときに出す
      'before:absolute before:inset-y-0 before:start-1/2 before:w-(--sidebar-handle-line-width) before:-translate-x-1/2 before:bg-transparent',
      'before:[transition:background-color_var(--duration-fast)_var(--ease-press)] motion-reduce:before:[transition:none]',
      'hover:before:bg-(color:--sidebar-handle-line-color) data-resizing:before:bg-(color:--sidebar-handle-line-color)',
      'focus-visible:before:bg-(color:--color-primary)',
    ],
    // ふだんから見せる小さなつまみ（縦の短い棒）
    grip: [
      'pointer-events-none absolute start-1/2 top-1/2 h-8 w-1 -translate-1/2 rounded-pill bg-line-strong',
      '[display:var(--sidebar-handle-grip-display)]',
    ],
    row: [
      'group/sidebar-row relative flex h-(--spacing-control) w-full shrink-0 cursor-pointer items-center gap-(--sidebar-gap)',
      'rounded-control px-(--sidebar-row-px) text-start no-underline select-none',
      'text-(length:--text-control) leading-(--leading-control) text-fg',
      // 塗りは --flat-bg（theme.css で登録）に置き、background-color ではなく変数を動かす（ADR-0112）
      'bg-(color:--flat-bg) [--flat-bg:var(--sidebar-row-rest)]',
      'hover:[--flat-bg:var(--sidebar-row-hover)]',
      'active:translate-y-(--flat-press-depth) active:[--flat-bg:var(--sidebar-row-press)]',
      '[transition:--flat-bg_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
      // いまいる行（ADR-0353）: 文字を太くし、部品の色の面を敷く。畳んだ列では、いまいる行を含む親のアイコンにも同じ印
      'aria-[current=page]:font-bold aria-[current=page]:text-(color:--sidebar-current-fg)',
      'aria-[current=page]:[--sidebar-row-rest:var(--sidebar-current-bg)]',
      'aria-[current=page]:hover:[--flat-bg:var(--sidebar-current-hover)]',
      'data-current-branch:font-bold data-current-branch:text-(color:--sidebar-current-fg)',
      'data-current-branch:[--sidebar-row-rest:var(--sidebar-current-bg)]',
      'data-current-branch:hover:[--flat-bg:var(--sidebar-current-hover)]',
      // 押せない行
      'data-disabled:cursor-not-allowed data-disabled:text-(color:--color-on-field-disabled)',
      'data-disabled:hover:[--flat-bg:var(--sidebar-row-rest)] data-disabled:active:translate-y-0',
      ...focusRing,
      'focus-visible:z-2',
    ],
    icon: 'grid size-(--spacing-icon) shrink-0 place-items-center [&_svg]:size-(--spacing-icon)',
    label: 'min-w-0 flex-1 truncate',
    // 行の件数（軸 380 で比較中）。開いた列では文字の後ろに置く
    count: [
      'shrink-0 rounded-pill px-(--sidebar-count-px) text-center text-xs leading-5 font-bold tabular-nums',
      'min-w-5 bg-(color:--sidebar-count-bg) text-(color:--sidebar-count-fg)',
    ],
    // 畳んだ列では、アイコンの右上に点か数字の札を重ねる。列の地の色の縁で、アイコンと分ける
    railIcon: 'relative',
    railDot: [
      'pointer-events-none absolute -end-0.5 -top-0.5 size-2 rounded-full bg-(color:--sidebar-rail-mark-bg)',
      '[display:var(--sidebar-rail-dot-display)] shadow-[0_0_0_var(--border-width-thick)_var(--sidebar-bg)]',
    ],
    railCount: [
      'pointer-events-none absolute -end-2.5 -top-2 h-4 min-w-4 rounded-pill px-1 text-center text-[10px] leading-4 font-bold tabular-nums',
      'bg-(color:--sidebar-rail-mark-bg) text-(color:--sidebar-rail-mark-fg)',
      '[display:var(--sidebar-rail-count-display)] shadow-[0_0_0_var(--border-width-thick)_var(--sidebar-bg)]',
    ],
    // 行ごとのメニューを開くボタン（軸 381 で比較中）。行の右端に重ね、行はそのぶん右の余白を空ける
    actionRow: 'pe-[calc(var(--sidebar-row-px)+var(--spacing-icon)+var(--spacing)*2)]',
    action: [
      'absolute end-[calc(var(--sidebar-row-px)-var(--spacing))] top-[calc((var(--spacing-control)-var(--spacing)*6)/2)] grid size-6 cursor-pointer place-items-center rounded-control text-fg-subtle',
      'opacity-(--sidebar-action-rest-opacity) data-current:opacity-(--sidebar-action-current-opacity)',
      'group-hover/sidebar-li:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100 [@media(hover:none)]:opacity-100',
      'hover:bg-(color:--sidebar-row-press) hover:text-fg data-popup-open:bg-(color:--sidebar-row-press) data-popup-open:text-fg',
      '[transition:opacity_var(--duration-fast)_var(--ease-press)] motion-reduce:[transition:none]',
      ...focusRing,
    ],
    // 入れ子の開閉の印。閉じているときは右、開くと下を向く
    caret: [
      'grid size-(--spacing-icon) shrink-0 -rotate-90 place-items-center text-fg-subtle',
      '[transition:rotate_var(--duration-fast)_var(--ease-press)] motion-reduce:[transition:none]',
      'group-aria-expanded/sidebar-row:rotate-0',
    ],
    // 節（SidebarSection）。題は行と同じ左の位置から始める。畳んだ列では題を出さず、節のあいだに線を引く
    section: 'flex flex-col not-first:mt-4',
    sectionTitle: 'px-(--sidebar-row-px) pb-1 text-xs text-fg-subtle',
    // 畳める節の題（軸 384 で比較中）。題を押すと、節の行を開け閉めする。印の位置と濃さは部品のトークン
    sectionToggle: [
      'group/sidebar-section mb-0.5 flex w-full cursor-pointer items-center gap-1 rounded-control px-(--sidebar-row-px) py-0.5 text-start text-xs text-fg-subtle',
      'hover:text-fg',
      ...focusRing,
    ],
    sectionCaret: [
      'order-(--sidebar-section-caret-order) grid size-3.5 shrink-0 place-items-center [&_svg]:size-3.5',
      'opacity-(--sidebar-section-caret-rest-opacity) group-hover/sidebar-section:opacity-100 group-focus-visible/sidebar-section:opacity-100',
      '[transition:rotate_var(--duration-fast)_var(--ease-press),opacity_var(--duration-fast)_var(--ease-press)] motion-reduce:[transition:none]',
      '-rotate-90 group-aria-expanded/sidebar-section:rotate-0',
    ],
    sectionPanel: [
      'flex flex-col gap-0.5',
      'h-(--collapsible-panel-height) [overflow:clip] [overflow-clip-margin:var(--sidebar-panel-clip-margin)]',
      'transition-[height] duration-(--collapsible-duration) ease-(--collapsible-ease)',
      'data-ending-style:h-0 data-starting-style:h-0',
      'motion-reduce:[transition:none]',
    ],
    // 入れ子の並び。案内線は、親のアイコンの中心の下に引く
    group: [
      'relative ms-[calc(var(--sidebar-row-px)+var(--spacing-icon)/2)] flex flex-col gap-0.5 border-s border-line',
      'h-(--collapsible-panel-height) [overflow:clip] [overflow-clip-margin:var(--sidebar-panel-clip-margin)]',
      'transition-[height] duration-(--collapsible-duration) ease-(--collapsible-ease)',
      'data-ending-style:h-0 data-starting-style:h-0',
      'motion-reduce:[transition:none]',
    ],
  },
  variants: {
    color: {
      primary: { root: colorScope.primary, drawer: colorScope.primary },
      secondary: { root: colorScope.secondary, drawer: colorScope.secondary },
      neutral: {},
    },
    collapsed: {
      true: { root: 'w-(--sidebar-rail-width)' },
      false: { root: 'w-(--sidebar-width)' },
    },
    // 開け閉めの動き（ADR-0352）。smooth は列の幅を動かし、none はすぐ切り替える
    motion: {
      smooth: {
        root: 'transition-[width] duration-(--duration-normal) ease-out motion-reduce:transition-none',
      },
      none: {},
    },
    // 畳んだ列の節: 題を出さず、次の節との境に線を引く
    railed: {
      true: { section: 'not-first:mt-2 not-first:border-t not-first:border-line not-first:pt-2' },
      false: {},
    },
    // 入れ子の行は、アイコンを持たず、案内線の右から文字を始める
    nested: {
      true: { row: 'ps-(--sidebar-nested-px) text-fg-muted' },
      false: {},
    },
  },
  defaultVariants: {
    color: 'neutral',
    collapsed: false,
    motion: 'smooth',
    nested: false,
    railed: false,
  },
});

export const layout = tv({
  slots: {
    root: 'flex h-full min-h-0 w-full',
    body: 'flex min-h-0 min-w-0 flex-1',
    content: 'min-h-0 min-w-0 flex-1 overflow-auto',
  },
  variants: {
    placement: {
      below: { root: 'flex-col' },
      full: { root: 'flex-row', body: 'flex-col' },
    },
  },
  defaultVariants: { placement: 'below' },
});
