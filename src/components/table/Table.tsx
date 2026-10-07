'use client';

import { type ComponentProps, type CSSProperties, type ReactNode, useId, useRef } from 'react';

import { tableStyles } from '../../internal/reading/table';
import { ScrollFrame } from '../../internal/ScrollFrame';
import { tv } from '../../internal/tv';
import { useMergedRefs } from '../../internal/use-merged-refs';
import { useScrollable } from '../../internal/use-scrollable';
import { useDragScroll } from './use-drag-scroll';

// 表（軸 62）。Markdown（GFM）を変換した HTML と同じ要素・属性を出す（table・thead・tbody・tr・th・td、列の寄せは align 属性）
// 見た目は table に置いた子孫のセレクタで付ける。Prose が素の HTML に同じセレクタを当てられる
// ページと同じレイヤーなので影は付けない（原則1）
// 本文の幅より広いときは、表の外観ごと（外枠・角・見出しの面も含めて）横にスクロールする（軸 582）
//   スクロールの包みは ScrollArea と同じ枠（ScrollFrame）。包み自体は枠を持たず、その中に外枠つきの表を置く
//   続きがある左右の端に内側の影を落とし、つまみは載せたとき・スクロール中・キーボードで止まったときに出す（原則1）
//   マウスでは、文字のない場所から引っぱって横に動かせる（use-drag-scroll。dragToScroll={false} で切る）
// 文字はマウスで 16/28、指で 14/24。読みもの（data-reading）の中でも、指では小さくする（表は一度に見える列の数を優先する）
//   値は --density-coarse（指 1・マウス 0。読みものの規則では変わらない）と、読む文字の -fine・-coarse から表の要素で計算する
// 見た目（variant）: lines（既定）は行のあいだの横線と、見出しの下の線。framed は外枠（部品の角）と見出しのグレーの面（軸 62 の A）。
//   banded は見出しの行を丸い帯のグレーの面にし、セルの余白を広げる（D）。縦線は showColumnDivider でどれにも足せる
// 縦の寄せ（verticalAlign）は --table-valign で配る。表・行・セルのどこにでも書け、いちばん内側の指定が効く（ADR-0246）
// 詰めた余白（size="sm"）は上下の余白だけを詰め、文字は変えない。文字を小さくするのは textSize で、別に選ぶ
// 縞（showStripes）は偶数行にグレーを敷き、行のあいだの線は残す。線を消すのは hideRowDivider で、別に選ぶ
// 合計の行（TableFoot）は上に濃く太い線を引いて太字にする。variant でグレーの面・二重線にもできる
// maxHeight を渡すと、包みが縦にもスクロールし、見出しの行が上に貼り付く。見出しには地と同じ面を置き、下を通る本文を隠す
//   縦も外観ごと動かす（横と同じ 1 つの包みでスクロールする）。縦のつまみがいつも包みの右端に見え、Tab の止まり先も 1 つのまま
//   包みの上の端の影は見出しに重なるので出さず、貼り付いた見出しの下に影を落とす（DataTable と同じ）
const table = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-2',
    // スクロールの包み（ScrollFrame の根）
    scroll: '',
    // スクロールする要素。relative は、セルの中の sr-only（position: absolute）が、包みの外へはみ出してページを横に伸ばさないため
    //   引っぱれる場所では grab、引っぱっているあいだは grabbing（data-drag-scroll は use-drag-scroll が書く）
    viewport:
      'relative data-[drag-scroll=dragging]:cursor-grabbing data-[drag-scroll=dragging]:select-none data-[drag-scroll=ready]:cursor-grab',
    // 表の外観（framed の外枠と角）。見出しの面が角からはみ出さないよう切り抜く（clip は貼り付く見出しを妨げない）
    frame: '',
    // 表とセルの見た目のクラス列は src/internal/reading/table.ts（Prose も同じものを使う）
    table: [...tableStyles.table, ...tableStyles.cells],
    caption: 'text-body-sm text-fg-subtle',
  },
  variants: {
    variant: {
      lines: { table: tableStyles.lines },
      framed: { frame: [tableStyles.framedFrame, 'overflow-clip'], table: tableStyles.framed },
      banded: { table: tableStyles.banded },
    },
    showColumnDivider: {
      // 2 列目から左に引く
      true: { table: tableStyles.columnDivider },
      false: {},
    },
    verticalAlign: {
      top: { table: '[--table-valign:top]' },
      middle: { table: '[--table-valign:middle]' },
      bottom: { table: '[--table-valign:bottom]' },
    },
    // variant の後に置く。banded の広い余白より、詰めた余白を優先する
    size: {
      md: {},
      sm: { table: tableStyles.sm },
    },
    textSize: {
      md: {},
      sm: { table: tableStyles.textSm },
    },
    showStripes: {
      true: { table: tableStyles.stripes },
      false: {},
    },
    hideRowDivider: {
      true: { table: tableStyles.hideRowDivider },
      false: {},
    },
    scrollY: {
      true: {
        scroll: 'max-h-(--table-max-height)',
        table: [
          '[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-1',
          // 貼り付いた見出しの下の影。スクロールした量（--cue-top）に合わせて濃くする（DataTable と同じ）
          "[&_thead_th]:after:pointer-events-none [&_thead_th]:after:absolute [&_thead_th]:after:inset-x-0 [&_thead_th]:after:top-full [&_thead_th]:after:h-3 [&_thead_th]:after:content-['']",
          '[&_thead_th]:after:bg-linear-to-b [&_thead_th]:after:from-(color:--color-sheet-edge-shadow) [&_thead_th]:after:to-transparent',
          '[&_thead_th]:after:opacity-[var(--cue-top,0)]',
        ],
      },
      false: {},
    },
  },
  compoundVariants: [
    // 貼り付いた見出しの面。lines は地と同じ白、framed・banded はもとのグレーの面
    { scrollY: true, variant: 'lines', class: { table: '[&_thead_th]:bg-bg' } },
  ],
  defaultVariants: {
    variant: 'lines',
    showColumnDivider: false,
    size: 'md',
    textSize: 'md',
    showStripes: false,
    hideRowDivider: false,
    scrollY: false,
  },
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
/** セルの余白の大きさ */
export type TableSize = 'sm' | 'md';
/** 表の文字の大きさ */
export type TableTextSize = 'sm' | 'md';
/** 合計の行の見た目 */
export type TableFootVariant = 'line' | 'filled' | 'double';

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
  /**
   * セルの余白の大きさ。sm は上下の余白を詰め、一度に多くの行を見せます。文字の大きさは変えません（textSize で選びます）
   * @default 'md'
   */
  size?: TableSize;
  /**
   * 表の文字の大きさ。sm は本文の小さい文字にします。余白の大きさ（size）とは別に選べます
   * @default 'md'
   */
  textSize?: TableTextSize;
  /**
   * 本文の行を 1 行おきに塗ります。列の多い横に長い表で、行を目で追いやすくします
   * @default false
   */
  showStripes?: boolean;
  /**
   * 本文の行のあいだの線を消します。縞（showStripes）と合わせると、面だけで行を分けます
   * @default false
   */
  hideRowDivider?: boolean;
  /**
   * 表の高さの上限（数は px、文字は CSS の長さ）。渡すと、はみ出した行は表の中で縦にスクロールし、見出しの行が上に貼り付きます
   */
  maxHeight?: number | string;
  /**
   * はみ出して横にスクロールできるとき、マウスで表を引っぱって動かせるようにします。
   * 文字の上から引っぱると文字の選択に、ボタンやリンクの上では押す操作になり、文字のない場所（セルの余白や罫線）から引っぱったときだけ動きます。
   * タッチでは、この指定によらずブラウザの標準のスクロールです
   * @default true
   */
  dragToScroll?: boolean;
  /** 表の説明。表の下に小さく出し、表とスクロールの包みの名前にもします */
  caption?: ReactNode;
  /**
   * caption を出さないときの、表の名前（読み上げ用）。はみ出してスクロールできるとき、包みの名前として読まれます
   */
  accessibleName?: string;
  /** 行をまとめる TableHead・TableBody・TableFoot を入れます */
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
  size,
  textSize,
  showStripes,
  hideRowDivider,
  maxHeight,
  dragToScroll = true,
  caption,
  accessibleName,
  className,
  children,
  ...props
}: TableProps) {
  const scrollY = maxHeight != null;
  const styles = table({
    variant,
    showColumnDivider,
    verticalAlign,
    size,
    textSize,
    showStripes,
    hideRowDivider,
    scrollY,
  });
  const style: CSSProperties & Record<`--${string}`, string> = {};
  if (scrollY) {
    style['--table-max-height'] = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
  }
  const captionId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollable = useScrollable(scrollRef);
  const dragRef = useDragScroll(dragToScroll);
  const viewportRef = useMergedRefs(scrollRef, dragRef);
  const labelledBy = caption == null ? undefined : captionId;
  const ariaLabel = caption == null ? accessibleName : undefined;
  return (
    <figure className={styles.root({ className })}>
      {/* スクロールできるときだけ、枠は名前付きの領域になり、Tab で止まる（止まるかは Base UI が決める） */}
      <ScrollFrame
        slot="table-scroll"
        className={styles.scroll()}
        style={style}
        viewportClassName={styles.viewport()}
        topEdge={!scrollY}
        orientation={scrollY ? 'both' : 'horizontal'}
        viewportProps={{
          ref: viewportRef,
          ...(scrollable
            ? { role: 'region', 'aria-labelledby': labelledBy, 'aria-label': ariaLabel }
            : {}),
        }}
      >
        <div className={styles.frame()}>
          <table
            className={styles.table()}
            aria-labelledby={labelledBy}
            aria-label={ariaLabel}
            {...props}
          >
            {children}
          </table>
        </div>
      </ScrollFrame>
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

export interface TableFootProps extends ComponentProps<'tfoot'> {
  /**
   * 見た目。line は上に本文の行のあいだより濃く太い線、filled はグレーの面、double は上に二重線を引きます。文字はどれも太字です
   * @default 'line'
   */
  variant?: TableFootVariant;
  /** 合計などの行（TableRow）を入れます */
  children?: ReactNode;
  /** 行をまとめる要素（tfoot）に付きます */
  className?: string;
}

/** 合計などの行をまとめる（tfoot）。本文の下に置き、上に線を引いて太字にします */
export function TableFoot({ variant = 'line', ...props }: TableFootProps) {
  return <tfoot data-variant={variant} {...props} />;
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
   * 見出しがどちらの向きのセルを指すか。見出しの行では col、行の頭では row にします。
   * いくつかの列をまとめる見出し（colSpan を付けた上の段）は colgroup、グループに分けた行の見出し（tbody ごとの見出しの行）は rowgroup にします
   * @default 'col'
   */
  scope?: 'col' | 'row' | 'colgroup' | 'rowgroup';
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
