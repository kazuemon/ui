import type { ComponentProps, ReactNode } from 'react';
import type { VariantProps } from 'tailwind-variants';

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
   * チェックリストにします。項目は ListItem の checked で箱を出します
   * @default false
   */
  task?: boolean;
  /** 項目（ListItem）を並べます */
  children?: ReactNode;
  /** 一覧の要素（ul・ol）に付きます */
  className?: string;
}

/**
 * 記事の中のリスト
 */
export function List({
  as = 'ul',
  start,
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
  if (as === 'ol') {
    return <ol className={classes} start={start} {...props} />;
  }
  return <ul className={classes} {...props} />;
}

export interface ListItemProps extends ComponentProps<'li'> {
  /**
   * チェックリストの項目にします。true は済み、false はまだです。箱は押せません（記事の中の表示です）
   */
  checked?: boolean;
  /** 項目の文。入れ子のリストは、この中に List を置きます */
  children?: ReactNode;
  /** 項目の要素（li）に付きます */
  className?: string;
}

/**
 * リストの項目
 */
export function ListItem({ checked, className, children, ...props }: ListItemProps) {
  if (checked == null) {
    return (
      <li className={className} {...props}>
        {children}
      </li>
    );
  }
  return (
    <li className={['task-list-item', className].filter(Boolean).join(' ')} {...props}>
      <input type="checkbox" disabled defaultChecked={checked} /> {children}
    </li>
  );
}
