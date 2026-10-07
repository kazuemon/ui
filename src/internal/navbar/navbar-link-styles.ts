import { focusRing } from '../focus-styles';
import { tv } from '../tv';

// Navbar の行き先（NavbarLink）と並び（NavbarLinks）の見た目。NavigationMenu の開くボタンと帯の行き先も同じ見た目で描く

export const navbarLink = tv({
  base: [
    'relative inline-flex h-(--spacing-control) cursor-pointer items-center whitespace-nowrap no-underline',
    'text-(length:--text-control) leading-(--leading-control)',
    'font-normal text-fg-muted',
    // いまいるページ: 文字を本文の色で太く（どの印でも）
    'aria-[current=page]:font-bold aria-[current=page]:text-fg',
    // 塗り: ふだんは透明、pill の印では --navbar-item-rest に面の色を置く。hover と押下は、その上に本文の色を淡く敷く
    '[--navbar-item-rest:transparent]',
    'bg-(color:--flat-bg) [--flat-bg:var(--navbar-item-rest)]',
    'hover:[--flat-bg:color-mix(in_oklab,var(--color-fg)_var(--flat-hover-mix),var(--navbar-item-rest))]',
    'active:translate-y-(--flat-press-depth) active:[--flat-bg:color-mix(in_oklab,var(--color-fg)_var(--flat-press-mix),var(--navbar-item-rest))]',
    '[transition:--flat-bg_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
    'motion-reduce:[transition:none]',
    ...focusRing,
  ],
  variants: {
    placement: {
      // 帯の中: pill
      bar: 'rounded-pill px-3',
      // メニューの中: 幅いっぱいの行。角は部品の角（一覧の項目と同じ — 原則5）
      menu: 'w-full rounded-control px-3',
    },
    indicator: {
      text: '',
      neutral: 'aria-[current=page]:[--navbar-item-rest:var(--color-neutral)]',
      primary:
        'aria-[current=page]:text-on-primary-subtle aria-[current=page]:[--navbar-item-rest:var(--color-primary-subtle)]',
      underline: '',
    },
  },
  compoundVariants: [
    // 文字の幅の下の線。帯の中だけ
    {
      placement: 'bar',
      indicator: 'underline',
      class:
        "aria-[current=page]:after:pointer-events-none aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-3 aria-[current=page]:after:bottom-1 aria-[current=page]:after:h-(--navbar-current-bar) aria-[current=page]:after:rounded-pill aria-[current=page]:after:bg-primary aria-[current=page]:after:content-['']",
    },
  ],
  defaultVariants: { placement: 'bar', indicator: 'text' },
});

// 行き先の並びの nav。並びの見た目は ul に置き、nav は出す／隠すだけを受け持つ
export const navbarLinks = tv({
  variants: {
    placement: { bar: 'block min-w-0', menu: '' },
    narrowPlacement: { menu: '', bar: '', hidden: '' },
  },
  compoundVariants: [
    {
      placement: 'bar',
      narrowPlacement: ['menu', 'hidden'],
      class: 'hidden @3xl/navbar:block',
    },
  ],
});
