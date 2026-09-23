import { focusRing } from '../../internal/focus-styles';
import { tv } from '../../internal/tv';

// ページの横に並ぶ列 — 軸 303〜307（design/adr/0313〜0317）
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
    root: 'relative flex shrink-0 flex-col overflow-hidden border-e border-line bg-surface',
    // Drawer の中の並び
    drawer: 'flex flex-col gap-1',
    title:
      'flex shrink-0 items-center px-[calc(var(--sidebar-padding)+var(--sidebar-row-px))] pt-(--sidebar-padding) pb-1 text-xs text-fg-subtle transition-opacity duration-(--duration-fast) motion-reduce:transition-none',
    // 行の並び（ScrollArea の枠）。余白は中身に持たせ、スクロールとともに動く。フォーカスの線が切れない
    list: 'min-h-0 flex-1',
    listContent: 'px-(--sidebar-padding) pt-2 pb-(--sidebar-padding)',
    footer: 'shrink-0 px-(--sidebar-padding) pt-2 pb-(--sidebar-padding)',
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
      // いまいる行（軸 306）: 文字を太くし、部品の色の面を敷く。畳んだ列では、いまいる行を含む親のアイコンにも同じ印
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
    // 入れ子の開閉の印。閉じているときは右、開くと下を向く
    caret: [
      'grid size-(--spacing-icon) shrink-0 -rotate-90 place-items-center text-fg-subtle',
      '[transition:rotate_var(--duration-fast)_var(--ease-press)] motion-reduce:[transition:none]',
      'group-aria-expanded/sidebar-row:rotate-0',
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
      true: { root: 'w-(--sidebar-rail-width)', title: 'opacity-0' },
      false: { root: 'w-(--sidebar-width)' },
    },
    // 開け閉めの動き（軸 305）。smooth は列の幅を動かし、none はすぐ切り替える
    motion: {
      smooth: {
        root: 'transition-[width] duration-(--duration-normal) ease-out motion-reduce:transition-none',
      },
      none: {},
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
