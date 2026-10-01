import { focusRing } from '../../internal/focus-styles';
import { tv } from '../../internal/tv';

// ページの横に並ぶ列 — ADR-0350〜0357
//   行は Tree の行と同じ考え（一覧の項目の仲間。hover は入力欄の塗り、いまいる行は部品の色に従う。原則3・6）
//   開いた形と畳んだ形で、アイコンの位置が動かない（行の左右の余白を、畳んだ列の幅の中央から決める）
//   幅は Tailwind の width ではなく、部品のトークン（--sidebar-width・--sidebar-rail-width）で動かす
// 他のトークンから決める値。:root で計算すると、途中の要素で差し替えた部品の高さ（密度）や、
// color で差し替えたいまいる行の色に追従しないので、列（と Drawer の中の並び）の要素の上で計算する
//   rail-width: 畳んだ列の幅。行が角丸の正方形になるよう、部品の高さと左右の余白から決める
//   row-px: 行の左右の余白。畳んだ列の幅の中でアイコンが中央に来る値（開いた形と畳んだ形でアイコンの位置が動かない）
//   current-hover: いまいる行に載せたときの塗り
const derived = [
  '[--sidebar-rail-width:calc(var(--spacing-control)+var(--sidebar-padding)*2)]',
  '[--sidebar-row-px:calc((var(--sidebar-rail-width)-var(--spacing-icon))/2-var(--sidebar-padding))]',
  '[--sidebar-current-hover:color-mix(in_oklab,var(--sidebar-current-bg),var(--color-fg)_8%)]',
];

const colorScope = {
  primary:
    '[--sidebar-current-bg:var(--color-primary-subtle)] [--sidebar-current-fg:var(--color-on-primary-subtle)]',
  secondary:
    '[--sidebar-current-bg:var(--color-secondary-subtle)] [--sidebar-current-fg:var(--color-on-secondary-subtle)]',
  neutral: '',
};

// ふだんの濃さを書くクラス。Tailwind がクラスを拾えるよう、文字列はそのまま書く
const indicator = {
  subtle: (part: 'menu' | 'section') =>
    part === 'menu'
      ? '[--sidebar-menu-idle:var(--sidebar-indicator-subtle-opacity)]'
      : '[--sidebar-section-idle:var(--sidebar-indicator-subtle-opacity)]',
  always: (part: 'menu' | 'section') =>
    part === 'menu' ? '[--sidebar-menu-idle:1]' : '[--sidebar-section-idle:1]',
  hover: (part: 'menu' | 'section') =>
    part === 'menu'
      ? '[--sidebar-menu-idle:var(--density-coarse)]'
      : '[--sidebar-section-idle:var(--density-coarse)]',
};

/** 行の件数・点の色（SidebarItem の color）。neutral は開いた列で淡いグレーの札、畳んだ列で濃いグレー（tokens.css の既定） */
export const countColor = {
  neutral: '',
  primary:
    '[--sidebar-count-bg:var(--color-primary)] [--sidebar-count-fg:var(--color-on-primary)] [--sidebar-mark-bg:var(--color-primary)] [--sidebar-mark-fg:var(--color-on-primary)]',
  secondary:
    '[--sidebar-count-bg:var(--color-fg-secondary)] [--sidebar-count-fg:var(--color-on-secondary)] [--sidebar-mark-bg:var(--color-fg-secondary)] [--sidebar-mark-fg:var(--color-on-secondary)]',
  info: '[--sidebar-count-bg:var(--color-info)] [--sidebar-count-fg:var(--color-on-info)] [--sidebar-mark-bg:var(--color-info)] [--sidebar-mark-fg:var(--color-on-info)]',
  success:
    '[--sidebar-count-bg:var(--color-success)] [--sidebar-count-fg:var(--color-on-success)] [--sidebar-mark-bg:var(--color-success)] [--sidebar-mark-fg:var(--color-on-success)]',
  warning:
    '[--sidebar-count-bg:var(--color-warning)] [--sidebar-count-fg:var(--color-on-warning)] [--sidebar-mark-bg:var(--color-warning)] [--sidebar-mark-fg:var(--color-on-warning)]',
  danger:
    '[--sidebar-count-bg:var(--color-danger)] [--sidebar-count-fg:var(--color-on-danger)] [--sidebar-mark-bg:var(--color-danger)] [--sidebar-mark-fg:var(--color-on-danger)]',
} as const;

export const sidebar = tv({
  slots: {
    // 広い画面の列
    // 内側の余白は、題・スクロールの中身・下端のボタンがそれぞれ持つ（スクロールの枠の外に余白を取ると、影が列の端まで届かず、下に空きができる）
    // 面の地は variant で選ぶ（ADR-0361）。本文との境の細い線は、地の色によらずいつも引く
    root: [
      'relative flex shrink-0 flex-col overflow-hidden border-e border-line bg-(color:--sidebar-bg)',
      'data-resizing:transition-none',
      ...derived,
    ],
    // 上下に固定する場所（header・footer。ADR-0358）。スクロールする中身との境に細い線を引く（hideDivider で消す）。
    // 淡い面は、上・下それぞれに敷ける（headerVariant・footerVariant の filled）
    head: 'shrink-0 border-b border-line px-(--sidebar-padding) pt-(--sidebar-padding) pb-2',
    // Drawer の中の並び
    drawer: ['flex flex-col gap-1', ...derived],
    // 行の並び（ScrollArea の枠）。余白は中身に持たせ、スクロールとともに動く。フォーカスの線が切れない
    list: 'min-h-0 flex-1',
    listContent: 'p-(--sidebar-padding)',
    footer:
      'flex shrink-0 flex-col gap-0.5 border-t border-line px-(--sidebar-padding) pt-2 pb-(--sidebar-padding)',
    // 列の端の幅を変えるつまみ（ADR-0362）。本文との境の線の上に、つかめる幅を半分ずつ重ねる
    handleSlot: 'relative z-3 w-0 shrink-0',
    handle: [
      'group/sidebar-handle absolute inset-y-0 -start-[calc(var(--sidebar-handle-hit)/2)] w-(--sidebar-handle-hit) cursor-col-resize touch-none outline-none',
      // 線: 載せたとき・動かしているとき・フォーカスしたときに出す
      'before:absolute before:inset-y-0 before:start-1/2 before:w-(--sidebar-handle-line-width) before:-translate-x-1/2 before:bg-transparent',
      'before:[transition:background-color_var(--duration-fast)_var(--ease-press)] motion-reduce:before:[transition:none]',
      'hover:before:bg-line-strong data-resizing:before:bg-line-strong',
      'focus-visible:before:bg-(color:--color-primary)',
    ],
    // ふだんから見せる小さなつまみ（縦の短い棒。resizeHandle="grip"）
    grip: 'pointer-events-none absolute start-1/2 top-1/2 h-8 w-1 -translate-1/2 rounded-pill bg-line-strong',
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
    // 行の件数（ADR-0359）。開いた列では文字の後ろに札を置く。色は行の color（既定はグレー）
    count: [
      'min-w-5 shrink-0 rounded-pill px-1.5 text-center text-xs leading-5 font-bold tabular-nums',
      'bg-(color:--sidebar-count-bg) text-(color:--sidebar-count-fg)',
    ],
    // 数字のない点（badge の shape が dot）。開いた列では文字の後ろに置く
    dot: 'mx-1.5 size-2 shrink-0 rounded-full bg-(color:--sidebar-mark-bg)',
    // 畳んだ列では、アイコンの右上に数字の札か点を重ねる（collapsedItemBadgeShape・badge.collapsedShape）。列の地の色の縁で、アイコンと分ける
    railIcon: 'relative',
    railDot: [
      'pointer-events-none absolute -end-0.5 -top-0.5 size-2 rounded-full bg-(color:--sidebar-mark-bg)',
      'shadow-[0_0_0_var(--border-width-thick)_var(--sidebar-bg)]',
    ],
    railCount: [
      'pointer-events-none absolute -end-2.5 -top-2 h-4 min-w-4 rounded-pill px-1 text-center text-[10px] leading-4 font-bold tabular-nums',
      'bg-(color:--sidebar-mark-bg) text-(color:--sidebar-mark-fg)',
      'shadow-[0_0_0_var(--border-width-thick)_var(--sidebar-bg)]',
    ],
    // 行ごとのメニューを開くボタン（ADR-0360）。行の右端に重ね、行はそのぶん右の余白を空ける
    //   ふだんの濃さは Sidebar の itemMenuIndicator が --sidebar-menu-idle に書く（DataTable の sortIndicator と同じ）
    actionRow: 'pe-[calc(var(--sidebar-row-px)+var(--spacing-icon)+var(--spacing)*2)]',
    action: [
      'absolute end-[calc(var(--sidebar-row-px)-var(--spacing))] top-[calc((var(--spacing-control)-var(--spacing)*6)/2)] grid size-6 cursor-pointer place-items-center rounded-control text-fg-subtle',
      'opacity-(--sidebar-menu-idle) group-hover/sidebar-li:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100',
      'hover:bg-(color:--sidebar-row-press) hover:text-fg data-popup-open:bg-(color:--sidebar-row-press) data-popup-open:text-fg',
      '[transition:opacity_var(--duration-fast)_var(--ease-press)] motion-reduce:[transition:none]',
      ...focusRing,
    ],
    // 入れ子の開閉の印。閉じているときは右、開くと下を向く
    caret: [
      'grid size-(--spacing-icon) shrink-0 -rotate-90 place-items-center text-fg-subtle',
      '[transition:rotate_var(--duration-fast)_var(--ease-press)] motion-reduce:[transition:none]',
      'group-aria-expanded/sidebar-row:rotate-0 group-aria-expanded/sidebar-toggle:rotate-0',
    ],
    // 入れ子を持つリンクの行（軸 501）: 行（リンク）と開け閉めのボタン（山形）を並べる枠
    split: 'group/sidebar-split relative flex',
    // 行（リンク）。山形のぶん右を空け、山形に載せているあいだも行の面を出すかはトークンで決める
    splitRow: [
      'w-auto min-w-0 flex-1 me-(--sidebar-toggle-inset) pe-[calc(var(--sidebar-row-px)+var(--sidebar-toggle-reserve))]',
      'group-has-[[data-slot=sidebar-item-toggle]:hover]/sidebar-split:[--flat-bg:color-mix(in_oklab,var(--sidebar-row-hover)_calc(var(--sidebar-toggle-row-hover)*100%),var(--sidebar-row-rest))]',
      'aria-[current=page]:group-has-[[data-slot=sidebar-item-toggle]:hover]/sidebar-split:[--flat-bg:color-mix(in_oklab,var(--sidebar-current-hover)_calc(var(--sidebar-toggle-row-hover)*100%),var(--sidebar-row-rest))]',
    ],
    // 開け閉めのボタン（山形）。行の右端に重ねる
    toggle: [
      'group/sidebar-toggle absolute top-[calc((var(--spacing-control)-var(--sidebar-toggle-size))/2)] end-[calc((var(--sidebar-row-px)-var(--spacing))*var(--sidebar-toggle-inside))]',
      'grid size-(--sidebar-toggle-size) cursor-pointer place-items-center rounded-control text-fg-subtle',
      'bg-(color:--flat-bg) [--flat-bg:transparent]',
      'hover:text-fg hover:[--flat-bg:color-mix(in_oklab,var(--sidebar-row-press)_calc(var(--sidebar-toggle-hover-depth)*100%),var(--sidebar-row-hover))]',
      'active:translate-y-(--flat-press-depth) active:[--flat-bg:var(--sidebar-row-press)]',
      // リンクとのあいだの縦の線（toggle-divider が transparent なら見えない）
      "before:pointer-events-none before:absolute before:inset-y-2 before:start-0 before:border-s before:border-(color:--sidebar-toggle-divider) before:content-['']",
      '[transition:--flat-bg_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
      ...focusRing,
      'focus-visible:z-2',
    ],
    // 行ごとのメニュー（︙）もあるとき、山形はその左に置く
    toggleWithMenu: 'me-[calc(var(--spacing)*7)]',
    splitRowWithMenu: 'pe-[calc(var(--sidebar-row-px)+var(--sidebar-toggle-reserve)+var(--spacing)*7)]',
    // 節（SidebarSection）。題は行と同じ左の位置から始める。畳んだ列では題を出さず、節のあいだに線を引く
    section: 'group/sidebar-section-li flex flex-col not-first:mt-4',
    // 畳んだ列の節の区切り。題の代わりに残した場所の、縦の真ん中に引く（最初の節には引かない）
    railDivider:
      'pointer-events-none absolute inset-x-0 top-1/2 hidden border-t border-line group-not-first/sidebar-section-li:block',
    sectionTitle: 'px-(--sidebar-row-px) pb-1 text-xs text-fg-subtle',
    // 畳める節の題（ADR-0363）。題を押すと、節の行を開け閉めする。印は右端
    //   ふだんの濃さは Sidebar の sectionIndicator が --sidebar-section-idle に書く（DataTable の sortIndicator と同じ）
    sectionToggle: [
      'group/sidebar-section mb-0.5 flex w-full cursor-pointer items-center gap-1 rounded-control px-(--sidebar-row-px) py-0.5 text-start text-xs text-fg-subtle',
      'hover:text-fg',
      ...focusRing,
    ],
    sectionCaret: [
      'grid size-3.5 shrink-0 place-items-center [&_svg]:size-3.5',
      'opacity-(--sidebar-section-idle) group-hover/sidebar-section:opacity-100 group-focus-visible/sidebar-section:opacity-100',
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
      // 行の塗りは案内線に着けず、Tree と同じ間（--sidebar-nested-gap）だけ離す
      'relative ms-[calc(var(--sidebar-row-px)+var(--spacing-icon)/2)] flex flex-col gap-0.5 border-s border-line ps-(--sidebar-nested-gap)',
      'h-(--collapsible-panel-height) [overflow:clip] [overflow-clip-margin:var(--sidebar-panel-clip-margin)]',
      'transition-[height] duration-(--collapsible-duration) ease-(--collapsible-ease)',
      'data-ending-style:h-0 data-starting-style:h-0',
      'motion-reduce:[transition:none]',
    ],
  },
  variants: {
    // 列の地（ADR-0361）。muted は淡いグレーにし、行の hover・押下と上下の淡い面を一段濃くする。Drawer の中では使わない
    variant: {
      plain: {},
      muted: {
        root: [
          '[--sidebar-bg:var(--color-field)]',
          '[--sidebar-row-hover:color-mix(in_oklab,var(--color-field),var(--color-fg)_4%)]',
          '[--sidebar-row-press:color-mix(in_oklab,var(--color-field),var(--color-fg)_8%)]',
          '[--sidebar-edge-fill:color-mix(in_oklab,var(--color-field),var(--color-fg)_5%)]',
        ],
      },
    },
    hideDivider: {
      true: { head: 'border-b-0', footer: 'border-t-0' },
      false: {},
    },
    headerVariant: {
      plain: {},
      filled: { head: 'bg-(color:--sidebar-edge-fill)' },
    },
    footerVariant: {
      plain: {},
      filled: { footer: 'bg-(color:--sidebar-edge-fill)' },
    },
    // ふだんの濃さ（行ごとのメニューのボタン・畳める節の印）。hover は、指の密度（--density-coarse が 1）ではいつも出す（原則16）
    itemMenuIndicator: {
      subtle: { root: indicator.subtle('menu'), drawer: indicator.subtle('menu') },
      always: { root: indicator.always('menu'), drawer: indicator.always('menu') },
      hover: { root: indicator.hover('menu'), drawer: indicator.hover('menu') },
    },
    sectionIndicator: {
      subtle: { root: indicator.subtle('section'), drawer: indicator.subtle('section') },
      always: { root: indicator.always('section'), drawer: indicator.always('section') },
      hover: { root: indicator.hover('section'), drawer: indicator.hover('section') },
    },
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
    // 入れ子の行は、アイコンを持たず、案内線の右から文字を始める
    nested: {
      true: {
        row: 'ps-[calc(var(--sidebar-nested-px)-var(--sidebar-nested-gap))] text-fg-muted',
        // 入れ子の中の入れ子: 親の一覧が空けた間の分だけ戻し、案内線の位置を変えない
        group: 'ms-[calc(var(--sidebar-row-px)+var(--spacing-icon)/2-var(--sidebar-nested-gap))]',
      },
      false: {},
    },
  },
  defaultVariants: {
    variant: 'plain',
    hideDivider: false,
    headerVariant: 'plain',
    footerVariant: 'plain',
    itemMenuIndicator: 'subtle',
    sectionIndicator: 'subtle',
    color: 'neutral',
    collapsed: false,
    motion: 'smooth',
    nested: false,
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
      'under-header': { root: 'flex-col' },
      'full-height': { root: 'flex-row', body: 'flex-col' },
    },
  },
  defaultVariants: { placement: 'under-header' },
});
