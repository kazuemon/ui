'use client';

import { type ComponentProps, type ReactNode, useId, useRef } from 'react';

import { focusRing } from '../../internal/focus-styles';
import { tableStyles } from '../../internal/reading/table';
import { tv } from '../../internal/tv';
import { useScrollable } from '../../internal/use-scrollable';

// 表（軸 62）。Markdown（GFM）を変換した HTML と同じ要素・属性を出す（table・thead・tbody・tr・th・td、列の寄せは align 属性）
// 見た目は table に置いた子孫のセレクタで付ける。Prose が素の HTML に同じセレクタを当てられる
// ページと同じレイヤーなので影は付けない（原則1）
// 本文の幅より広いときは、包み（scroll）だけが横にスクロールする。外枠と角丸は包みに付け、スクロールしても枠は動かない
// 文字はマウスで 16/28、指で 14/24。読みもの（data-reading）の中でも、指では小さくする（表は一度に見える列の数を優先する）
//   値は --density-coarse（指 1・マウス 0。読みものの規則では変わらない）と、読む文字の -fine・-coarse から表の要素で計算する
// 見た目（variant）: lines（既定）は行のあいだの横線と、見出しの下の線。framed は外枠（部品の角）と見出しのグレーの面（軸 62 の A）。
//   banded は見出しの行を丸い帯のグレーの面にし、セルの余白を広げる（D）。縦線は showColumnDivider でどれにも足せる
// 縦の寄せ（verticalAlign）は --table-valign で配る。表・行・セルのどこにでも書け、いちばん内側の指定が効く（ADR-0246）
const table = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-2',
    // relative は、セルの中の sr-only（position: absolute）が、包みの外へはみ出してページを横に伸ばさないため
    scroll: ['relative overflow-x-auto', ...focusRing],
    // 表とセルの見た目のクラス列は src/internal/reading/table.ts（Prose も同じものを使う）
    table: [...tableStyles.table, ...tableStyles.cells],
    caption: 'text-body-sm text-fg-subtle',
  },
  variants: {
    variant: {
      lines: { table: tableStyles.lines },
      framed: { scroll: 'rounded-control border border-line', table: '[&_thead_th]:bg-field' },
      banded: {
        table: [
          '[&_:is(th,td)]:px-4 [&_:is(th,td)]:py-3 [&_thead_th]:bg-field',
          '[&_thead_th:first-child]:rounded-s-control [&_thead_th:last-child]:rounded-e-control',
        ],
      },
    },
    showColumnDivider: {
      // 2 列目から左に引く
      true: { table: '[&_tr>*+*]:border-l' },
      false: {},
    },
    verticalAlign: {
      top: { table: '[--table-valign:top]' },
      middle: { table: '[--table-valign:middle]' },
      bottom: { table: '[--table-valign:bottom]' },
    },
  },
  defaultVariants: { variant: 'lines', showColumnDivider: false },
});

// 行・セルの縦の寄せ。--table-valign を自分に書き、中のセルがそれを読む
const valign = tv({
  variants: {
    verticalAlign: {
      top: '[--table-valign:top]',
      middle: '[--table-valign:middle]',
      bottom: '[--table-valign:bottom]',
    },
  },
});

/** 表の見た目 */
export type TableVariant = 'lines' | 'framed' | 'banded';
/** セルの縦の寄せ */
export type TableVerticalAlign = 'top' | 'middle' | 'bottom';
/** セルの横の寄せ */
export type TableCellAlign = 'start' | 'center' | 'end';

// 列の寄せは、GFM を変換した HTML と同じ align 属性で出す（start は left、end は right）
const alignAttr = { start: 'left', center: 'center', end: 'right' } as const;

export interface TableProps extends ComponentProps<'table'> {
  /**
   * 見た目。lines は行のあいだの横線、framed は外枠と見出しのグレーの面、banded は見出しの行を丸い帯にした形です
   * @default 'lines'
   */
  variant?: TableVariant;
  /**
   * 列のあいだに縦線を引きます
   * @default false
   */
  showColumnDivider?: boolean;
  /**
   * セルの縦の寄せ。行（TableRow）・セル（TableCell・TableHeader）で上書きできます
   * @default 'top'
   */
  verticalAlign?: TableVerticalAlign;
  /** 表の説明。表の下に小さく出し、表とスクロールの包みの名前にもします */
  caption?: ReactNode;
  /**
   * caption を出さないときの、表の名前（読み上げ用）。はみ出してスクロールできるとき、包みの名前として読まれます
   */
  accessibleName?: string;
  /** 行をまとめる TableHead・TableBody を入れます */
  children?: ReactNode;
  /** 表とキャプションを包む要素（figure）に付きます。表そのものに付けるクラスは、中の要素に当たるセレクタで書きます */
  className?: string;
}

/**
 * 表。本文の幅より広いときは、表だけが横にスクロールします。
 * スクロールできるときだけ、包みにキーボードで移れるようにします（矢印キーで横に動かせます）
 */
export function Table({
  variant,
  showColumnDivider,
  verticalAlign,
  caption,
  accessibleName,
  className,
  children,
  ...props
}: TableProps) {
  const styles = table({ variant, showColumnDivider, verticalAlign });
  const captionId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollable = useScrollable(scrollRef);
  const labelledBy = caption == null ? undefined : captionId;
  const ariaLabel = caption == null ? accessibleName : undefined;
  return (
    <figure className={styles.root({ className })}>
      <div
        ref={scrollRef}
        className={styles.scroll()}
        data-slot="table-scroll"
        {...(scrollable
          ? { role: 'region', tabIndex: 0, 'aria-labelledby': labelledBy, 'aria-label': ariaLabel }
          : {})}
      >
        <table
          className={styles.table()}
          aria-labelledby={labelledBy}
          aria-label={ariaLabel}
          {...props}
        >
          {children}
        </table>
      </div>
      {caption == null ? null : (
        <figcaption id={captionId} className={styles.caption()}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** 見出しの行をまとめる（thead） */
export function TableHead(props: ComponentProps<'thead'>) {
  return <thead {...props} />;
}

/** 本文の行をまとめる（tbody） */
export function TableBody(props: ComponentProps<'tbody'>) {
  return <tbody {...props} />;
}

export interface TableRowProps extends ComponentProps<'tr'> {
  /**
   * この行のセルの縦の寄せ。表の指定より優先し、セルでさらに上書きできます
   * @default 'top'
   */
  verticalAlign?: TableVerticalAlign;
  /** この行のセル（TableHeader・TableCell）を入れます */
  children?: ReactNode;
  /** 行の要素（tr）に付きます */
  className?: string;
}

/** 行（tr） */
export function TableRow({ verticalAlign, className, ...props }: TableRowProps) {
  return <tr className={valign({ verticalAlign, className })} {...props} />;
}

export interface TableHeaderProps extends Omit<ComponentProps<'th'>, 'align'> {
  /**
   * 列の寄せ。数字の列は end にします。Markdown の変換結果と同じく align 属性で出します
   * @default 'start'
   */
  align?: TableCellAlign;
  /**
   * このセルの縦の寄せ。表・行の指定より優先します
   * @default 'top'
   */
  verticalAlign?: TableVerticalAlign;
  /**
   * 見出しがどちらの向きのセルを指すか。見出しの行では col、行の頭では row にします
   * @default 'col'
   */
  scope?: 'col' | 'row';
  /** 見出しのセルの中身 */
  children?: ReactNode;
  /** 見出しのセルの要素（th）に付きます */
  className?: string;
}

/** 見出しのセル（th） */
export function TableHeader({
  align,
  verticalAlign,
  scope = 'col',
  className,
  ...props
}: TableHeaderProps) {
  return (
    <th
      align={align && alignAttr[align]}
      scope={scope}
      className={valign({ verticalAlign, className })}
      {...props}
    />
  );
}

export interface TableCellProps extends Omit<ComponentProps<'td'>, 'align'> {
  /**
   * 列の寄せ。数字の列は end にします。見出しのセルと同じ値をそろえて渡します
   * @default 'start'
   */
  align?: TableCellAlign;
  /**
   * このセルの縦の寄せ。表・行の指定より優先します
   * @default 'top'
   */
  verticalAlign?: TableVerticalAlign;
  /** セルの中身 */
  children?: ReactNode;
  /** セルの要素（td）に付きます */
  className?: string;
}

/** セル（td） */
export function TableCell({ align, verticalAlign, className, ...props }: TableCellProps) {
  return (
    <td
      align={align && alignAttr[align]}
      className={valign({ verticalAlign, className })}
      {...props}
    />
  );
}
