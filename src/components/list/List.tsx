import type { ComponentProps, ReactNode, Ref } from 'react';
import type { VariantProps } from 'tailwind-variants';

import { CheckCircleIcon, WarningCircleIcon, WarningIcon } from '../../internal/icons';
import { listStyles } from '../../internal/reading/list';
import { cn, tv } from '../../internal/tv';

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
// 印のアイコンは文字の 1.25 倍（部品の中のアイコンと同じ比）。色は既定で項目の文字の色。iconColor で Tag の color と同じ色から選べる
// 文の色は color で、Tag の color と同じ色から選べる（その色のタグの文字と同じ色）。指定しないときは文字の色
// 状態（status）は、状態の色と形のアイコン（成功は丸のチェック、警告は三角、危険は丸の「!」— 原則6）。文は文字の色のまま。iconColor を書けばそちらが勝つ
// 末尾の枠は、文の列の後ろに置く 2 つ目の列で、右端に寄せる。1 行目の行の高さの中で縦の中央にそろえる
// 中身は使う側が置く JSX なので、文字の大きさや色は決めない
// 文とアイコンの色。Tag・Chip の color と同じ色で、その色のタグの文字と同じ色
const listItemColors = {
  primary: 'text-on-primary-subtle',
  secondary: 'text-on-secondary-subtle',
  neutral: 'text-fg-muted',
  info: 'text-fg-info',
  success: 'text-fg-success',
  warning: 'text-fg-warning',
  danger: 'text-fg-danger',
} as const;

/** 項目の文と印のアイコンの色。Tag の color と同じ色です */
export type ListItemColor = keyof typeof listItemColors;

const listItem = tv({
  slots: {
    root: '',
    icon: [
      'pointer-events-none absolute flex items-center justify-center',
      '[top:calc((var(--list-leading,var(--leading-body))-1.25em)/2)] [right:calc(100%+var(--list-marker-gap))]',
      'size-[1.25em] [&_svg]:size-full',
    ],
    body: 'grid grid-cols-[minmax(0,1fr)_auto] gap-x-4',
    // 文の列。入れ子のリストは li の直下でなくなるので、親の項目の文との間をここで足す（li の直下と同じ間）
    text: 'min-w-0 [&>:is(ul,ol)]:mt-(--list-item-gap)',
    trailing: 'flex h-[var(--list-leading,var(--leading-body))] items-center',
  },
  variants: {
    // 末尾に文字（数）だけを渡されたときは、補足として小さい淡い文字で描く。要素には文字の大きさや色を付けない
    trailingText: { true: { trailing: 'text-caption leading-caption text-fg-muted' } },
    marker: {
      true: {
        root: 'before:[content:none]',
      },
    },
    status: {
      success: {
        root: '[--list-status-color:var(--color-fg-success)]',
        icon: 'text-(color:--list-status-color)',
      },
      warning: {
        root: '[--list-status-color:var(--color-fg-warning)]',
        icon: 'text-(color:--list-status-color)',
      },
      danger: {
        root: '[--list-status-color:var(--color-fg-danger)]',
        icon: 'text-(color:--list-status-color)',
      },
    },
    // 印のアイコンの色。status の色より後ろに置き、書いたときは status の色に勝つ。書かないときは、状態の色か、項目の文字の色
    iconColor: {
      primary: { icon: listItemColors.primary },
      secondary: { icon: listItemColors.secondary },
      neutral: { icon: listItemColors.neutral },
      info: { icon: listItemColors.info },
      success: { icon: listItemColors.success },
      warning: { icon: listItemColors.warning },
      danger: { icon: listItemColors.danger },
    },
  },
});

/** 項目の状態 */
export type ListItemStatus = 'success' | 'warning' | 'danger';

const statusIcons = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  danger: WarningCircleIcon,
} as const;

export interface ListItemProps extends Omit<ComponentProps<'li'>, 'color'> {
  /**
   * チェックリストの項目にします。true は済み、false はまだです。箱は押せません（記事の中の表示です）。
   * 項目の頭は箱が使うので、status・icon・iconColor は効きません。trailing は効きます
   */
  checked?: boolean;
  /**
   * 項目の状態。印を状態の色と形のアイコン（success は丸のチェック、warning は三角、danger は丸の「!」）にします。
   * 文は文字の色のままです（文の色は color で選びます）。印は読み上げないので、状態は文でも伝えてください
   */
  status?: ListItemStatus;
  /**
   * 印の代わりに出すアイコン。status のアイコンより優先します。大きさは文字の 1.25 倍で、色は iconColor で選びます。
   * 飾りとして扱い、読み上げません
   */
  icon?: ReactNode;
  /**
   * 印のアイコン（icon・status）の色。Tag の color と同じ色から選びます（その色のタグの文字と同じ色）。
   * 書かないと、status があれば状態の色、なければ項目の文字の色（color）です
   */
  iconColor?: ListItemColor;
  /**
   * 項目の文の色。Tag の color と同じ色から選びます（その色のタグの文字と同じ色）。書かないと、文字の色です
   */
  color?: ListItemColor;
  /**
   * 項目の末尾に置くもの（数・日付・タグ・ボタンなど）。右端に寄せ、1 行目の行の高さの中で縦の中央にそろえます。
   * 文字（数）だけを渡すと、補足として小さい淡い文字で描きます。要素を渡したときは文字の大きさや色を付けないので、置くものに指定してください
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
  iconColor,
  color,
  trailing,
  className: classNameProp,
  children,
  ...props
}: ListItemProps) {
  // 文の色は、利用者の className で上書きできるよう tailwind-merge でまとめる
  const className = cn(color && listItemColors[color], classNameProp) || undefined;
  // チェックリストの項目は、頭を箱が使うので、印のアイコン（status・icon）を出さない
  const StatusIcon = checked == null && status ? statusIcons[status] : undefined;
  // 描かれない値（false・true・空の文字）は、icon を書かなかったのと同じに扱う（印を消して空の枠を出さない）
  const iconShown = icon != null && typeof icon !== 'boolean' && icon !== '' ? icon : null;
  const marker = checked == null ? (iconShown ?? (StatusIcon ? <StatusIcon /> : null)) : null;
  // 末尾に文字（数）だけを渡されたときは、補足として小さい淡い文字で描く
  const trailingText = typeof trailing === 'string' || typeof trailing === 'number';
  const s = listItem({
    marker: marker != null,
    status: checked == null ? status : undefined,
    iconColor,
    trailingText,
  });
  // 末尾の枠があるときは、文と末尾を 2 列に並べる。チェックリストの項目でも同じ
  const content =
    trailing != null ? (
      <div className={s.body()}>
        <div className={s.text()}>{children}</div>
        <div data-slot="list-item-trailing" className={s.trailing()}>
          {trailing}
        </div>
      </div>
    ) : (
      children
    );
  if (checked != null) {
    return (
      <li className={['task-list-item', className].filter(Boolean).join(' ')} {...props}>
        <input type="checkbox" disabled readOnly checked={checked} />
        {trailing != null ? content : <> {children}</>}
      </li>
    );
  }
  if (marker != null || trailing != null) {
    return (
      <li className={s.root({ className })} data-status={status} {...props}>
        {marker != null && (
          <span aria-hidden="true" data-slot="list-item-icon" className={s.icon()}>
            {marker}
          </span>
        )}
        {content}
      </li>
    );
  }
  return (
    <li className={className} {...props}>
      {children}
    </li>
  );
}
