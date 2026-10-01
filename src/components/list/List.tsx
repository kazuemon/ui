import type { ComponentProps, ReactNode, Ref } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { CheckCircleIcon, WarningCircleIcon, WarningIcon } from '../../internal/icons';
import { listStyles } from '../../internal/reading/list';
import { tv } from '../../internal/tv';

// 記事の中のリスト（箇条書き・番号付き・チェックリスト）— 軸 60 の B（印は短い線、番号は右揃え）
// Markdown（GFM）を変換した HTML と同じ要素を出す: <ul>・<ol start>・<li>、チェックリストは
//   <ul class="contains-task-list"><li class="task-list-item"><input type="checkbox" disabled checked> 文</li></ul>
// 見た目のクラス列は src/internal/reading/list.ts（Prose も同じものを使う）

const list = tv({
  base: listStyles.base,
  variants: {
    // 箇条書きの印。dash は短い線（既定）、dot は濃紺の丸（入れ子は白抜きの丸）。入れ子のリストは外側の選び方を引き継ぐ
    markerType: {
      dash: '',
      dot: [
        '[--color-list-bullet:var(--color-fg)] [--list-bullet-height:6px] [--list-bullet-width:6px]',
        '[--color-list-bullet-nested-ring:var(--color-fg)] [--color-list-bullet-nested:transparent] [--list-bullet-nested-height:6px] [--list-bullet-nested-ring:var(--border-width-medium)] [--list-bullet-nested-width:6px]',
      ],
    },
    // 済んだ項目の文。subtle は薄く（既定）、default は本文と同じ色
    checkedVariant: {
      subtle: '',
      default: '[--color-list-task-done:currentColor]',
    },
    as: {
      ul: listStyles.ul,
      ol: listStyles.ol,
    },
  },
  defaultVariants: { as: 'ul' },
});

/** 描く要素 */
export type ListAs = NonNullable<VariantProps<typeof list>['as']>;
/** 箇条書きの印 */
export type ListMarkerType = NonNullable<VariantProps<typeof list>['markerType']>;
/** 済んだ項目の文の見た目 */
export type ListCheckedVariant = NonNullable<VariantProps<typeof list>['checkedVariant']>;

export interface ListProps extends Omit<ComponentProps<'ul'>, 'ref'> {
  /**
   * 描く要素。ul は箇条書き、ol は番号付きです。入れ子にするときは ListItem の中に List を置きます
   * @default 'ul'
   */
  as?: ListAs;
  /**
   * 箇条書きの印。dash は薄いグレーの短い線（入れ子は小さい点）、dot は濃紺の丸（入れ子は白抜きの丸）です。入れ子のリストは外側の印を引き継ぎます
   * @default 'dash'
   */
  markerType?: ListMarkerType;
  /**
   * チェックリストで、済んだ項目の文の色。subtle は薄いグレー、default は本文と同じ色です
   * @default 'subtle'
   */
  checkedVariant?: ListCheckedVariant;
  /** 番号付き（ol）の最初の番号 */
  start?: number;
  /**
   * 番号付き（ol）の番号を、大きい順に振ります（素の HTML の reversed と同じ）
   * @default false
   */
  reversed?: boolean;
  /**
   * チェックリストにします。項目は ListItem の checked で箱を出します
   * @default false
   */
  task?: boolean;
  /** 項目（ListItem）を並べます */
  children?: ReactNode;
  /** 一覧の要素（ul・ol）に付きます */
  className?: string;
  /** 一覧の要素（ul・ol）の ref */
  ref?: Ref<HTMLUListElement | HTMLOListElement>;
}

/**
 * 記事の中のリスト
 */
export function List({
  as = 'ul',
  start,
  reversed = false,
  task = false,
  markerType,
  checkedVariant,
  className,
  ...props
}: ListProps) {
  const classes = list({
    as,
    markerType,
    checkedVariant,
    className: [task ? 'contains-task-list' : '', className ?? ''].join(' ').trim(),
  });
  // ref は props に入れたまま流す（ul と ol で ref の型が違うので、要素ごとの型に合わせる）
  if (as === 'ol') {
    return (
      <ol
        className={classes}
        start={start}
        reversed={reversed || undefined}
        {...(props as ComponentProps<'ol'>)}
      />
    );
  }
  return <ul className={classes} {...props} />;
}

// 項目の印をアイコンにした形（icon・status）と、末尾の枠（trailing）
// 印のアイコンは、箇条書きの印（li::before）を消して、同じ位置（li の左の外、1 行目の中央）に置く。飾りなので読まない
// 印のアイコンは文字の 1.25 倍（部品の中のアイコンと同じ比）。色は文字の色で、使う側がアイコンに色を付ければその色になる
// 状態（status）は、状態の色と形のアイコン（成功は丸のチェック、警告は三角、危険は丸の「!」— 原則6）。文は文字の色のまま
// 末尾の枠は、文の列の後ろに置く 2 つ目の列で、右端に寄せる。1 行目の行の高さの中で縦の中央にそろえる
// 中身は使う側が置く JSX なので、文字の大きさや色は決めない
const listItem = tv({
  slots: {
    root: '',
    icon: [
      'pointer-events-none absolute flex items-center justify-center',
      '[top:calc((var(--list-leading,var(--leading-body))-1.25em)/2)] [right:calc(100%+var(--list-marker-gap))]',
      'size-[1.25em] [&_svg]:size-full',
    ],
    body: 'grid grid-cols-[minmax(0,1fr)_auto] gap-x-4',
    trailing: 'flex h-[var(--list-leading,var(--leading-body))] items-center',
  },
  variants: {
    marker: {
      true: {
        root: 'before:[content:none]',
      },
    },
    status: {
      success: {
        root: '[--list-status-color:var(--color-fg-success)]',
      },
      warning: {
        root: '[--list-status-color:var(--color-fg-warning)]',
      },
      danger: {
        root: '[--list-status-color:var(--color-fg-danger)]',
      },
    },
  },
  compoundVariants: [
    {
      status: ['success', 'warning', 'danger'],
      class: {
        icon: 'text-(color:--list-status-color)',
      },
    },
  ],
});

/** 項目の状態 */
export type ListItemStatus = 'success' | 'warning' | 'danger';

const statusIcons = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  danger: WarningCircleIcon,
} as const;

export interface ListItemProps extends ComponentProps<'li'> {
  /**
   * チェックリストの項目にします。true は済み、false はまだです。箱は押せません（記事の中の表示です）
   */
  checked?: boolean;
  /**
   * 項目の状態。印を状態の色と形のアイコン（success は丸のチェック、warning は三角、danger は丸の「!」）にします。
   * 文は文字の色のままです。文に色を付けるときは className で指定します。印は読み上げないので、状態は文でも伝えてください
   */
  status?: ListItemStatus;
  /**
   * 印の代わりに出すアイコン。status のアイコンより優先します。大きさは文字の 1.25 倍です。
   * 色は文字の色で、アイコンに色を付けるとその色になります（`<CheckIcon className="text-fg-success" />`）。飾りとして扱い、読み上げません
   */
  icon?: ReactNode;
  /**
   * 項目の末尾に置くもの（数・日付・タグ・ボタンなど）。右端に寄せ、1 行目の行の高さの中で縦の中央にそろえます。
   * 文字の大きさや色は付けないので、薄くするときなどは置くものに指定してください
   */
  trailing?: ReactNode;
  /** 項目の文。入れ子のリストは、この中に List を置きます */
  children?: ReactNode;
  /** 項目の要素（li）に付きます */
  className?: string;
}

/**
 * リストの項目
 */
export function ListItem({
  checked,
  status,
  icon,
  trailing,
  className,
  children,
  ...props
}: ListItemProps) {
  const StatusIcon = status ? statusIcons[status] : undefined;
  const marker = icon ?? (StatusIcon ? <StatusIcon /> : null);
  if (checked == null && (marker != null || trailing != null)) {
    const s = listItem({ marker: marker != null, status });
    return (
      <li className={s.root({ className })} data-status={status} {...props}>
        {marker != null && (
          <span aria-hidden="true" data-slot="list-item-icon" className={s.icon()}>
            {marker}
          </span>
        )}
        {trailing != null ? (
          <div className={s.body()}>
            <div className="min-w-0">{children}</div>
            <div data-slot="list-item-trailing" className={s.trailing()}>
              {trailing}
            </div>
          </div>
        ) : (
          children
        )}
      </li>
    );
  }
  if (checked == null) {
    return (
      <li className={className} {...props}>
        {children}
      </li>
    );
  }
  return (
    <li className={['task-list-item', className].filter(Boolean).join(' ')} {...props}>
      <input type="checkbox" disabled readOnly checked={checked} /> {children}
    </li>
  );
}
