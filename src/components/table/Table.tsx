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
// 見た目（appearance）: lines（既定）は行のあいだの横線と、見出しの下の線。framed は外枠（部品の角）と見出しのグレーの面（軸 62 の A）。
//   banded は見出しの行を丸い帯のグレーの面にし、セルの余白を広げる（D）。縦線は columnLines でどれにも足せる
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
    appearance: {
      lines: { table: tableStyles.lines },
      framed: { scroll: 'rounded-control border border-line', table: '[&_thead_th]:bg-field' },
      banded: {
        table: [
          '[&_:is(th,td)]:px-4 [&_:is(th,td)]:py-3 [&_thead_th]:bg-field',
          '[&_thead_th:first-child]:rounded-s-control [&_thead_th:last-child]:rounded-e-control',
        ],
      },
    },
    columnLines: {
      // 2 列目から左に引く
      true: { table: '[&_tr>*+*]:border-l' },
      false: {},
    },
  },
  defaultVariants: { appearance: 'lines', columnLines: false },
});

export interface TableProps extends ComponentProps<'table'> {
  /**
   * 見た目。lines は行のあいだの横線、framed は外枠と見出しのグレーの面、banded は見出しの行を丸い帯にした形です
   * @default 'lines'
   */
  appearance?: 'lines' | 'framed' | 'banded';
  /**
   * 列のあいだに縦線を引きます
   * @default false
   */
  columnLines?: boolean;
  /**
   * 表の説明。表の下に小さく出し、表とスクロールの包みの名前にもします
   */
  caption?: ReactNode;
  /**
   * caption を出さないときの、表の名前（読み上げ用）。はみ出してスクロールできるとき、包みの名前として読まれます
   */
  label?: string;
}

/**
 * 表。本文の幅より広いときは、表だけが横にスクロールします。
 * スクロールできるときだけ、包みにキーボードで移れるようにします（矢印キーで横に動かせます）
 */
export function Table({
  appearance,
  columnLines,
  caption,
  label,
  className,
  children,
  ...props
}: TableProps) {
  const styles = table({ appearance, columnLines });
  const captionId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollable = useScrollable(scrollRef);
  const labelledBy = caption == null ? undefined : captionId;
  const ariaLabel = caption == null ? label : undefined;
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

/** 行（tr） */
export function TableRow(props: ComponentProps<'tr'>) {
  return <tr {...props} />;
}

type Align = 'left' | 'center' | 'right';

export interface TableHeaderProps extends Omit<ComponentProps<'th'>, 'align'> {
  /**
   * 列の寄せ。数字の列は right にします。Markdown の変換結果と同じく align 属性で出します
   * @default 'left'
   */
  align?: Align;
  /**
   * 見出しがどちらの向きのセルを指すか。見出しの行では col、行の頭では row にします
   * @default 'col'
   */
  scope?: 'col' | 'row';
}

/** 見出しのセル（th） */
export function TableHeader({ align, scope = 'col', ...props }: TableHeaderProps) {
  return <th align={align} scope={scope} {...props} />;
}

export interface TableCellProps extends Omit<ComponentProps<'td'>, 'align'> {
  /**
   * 列の寄せ。数字の列は right にします。見出しのセルと同じ値をそろえて渡します
   * @default 'left'
   */
  align?: Align;
}

/** セル（td） */
export function TableCell({ align, ...props }: TableCellProps) {
  return <td align={align} {...props} />;
}
