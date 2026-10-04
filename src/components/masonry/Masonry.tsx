'use client';

import { useRender } from '@base-ui/react/use-render';
import {
  Children,
  type ComponentProps,
  type CSSProperties,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  columnsClasses,
  breakpointVars,
  type GridColumns,
  isListElement,
} from '../../internal/breakpoints';
import { useIsomorphicLayoutEffect } from '../../internal/use-isomorphic-layout-effect';
import { tv } from '../../internal/tv';

// 縦横の比率が違う子を、列に振り分けて隙間なく積む枠 — 軸 294〜296
//   中身は問わない（画像専用にしない）。Card・Image・ImageZoom を中に置く想定
//
//   方式（3 つから選んだ）:
//     A. CSS の columns: 軽く Server Components のままだが、1 列目を上から下まで埋めてから 2 列目に移る
//        （縦順）。DOM の順＝タブ順のまま、見た目の並びだけ縦に飛ぶので、キーボードで送る位置が画面のあちこちへ
//        跳ぶ（原則15: 読み上げ・タブ順は見た目の順と揃える）
//     B. grid-template-rows: masonry（Firefox が実験実装を持つのみ。Chrome・Safari は未対応。使えない）
//     C. 採用: CSS Grid の行スパン計算。列数は grid-template-columns: repeat(auto-fill, minmax(...))
//        にまかせ（列の判定に JS もブラウザの実験機能も要らない）、子の高さだけ ResizeObserver で測り、
//        grid-row-end: span N を子ごとに設定して隙間なく積む。grid-auto-flow の既定（row・dense を付けない）
//        は「1 行目を左から右へ、埋まったら次の行へ」と子を渡した順に置くので、DOM の順＝見た目の左上から
//        右下への流れ＝タブ順になる（横順。原則15）。子の高さを測るために 'use client' が要る
//   スクリプトが動く前（初回描画・SSR）は、ふつうのグリッド（grid-auto-rows: auto、span を使わない）で描く。
//   マウント後に高さを測ってから、1 行の高さを --masonry-row-unit に切り替えて隙間なく積む（data-measured）
//   間隔は Stack と同じ間隔の段（ADR-0212）。押すものではないので入力方式では変えない
const ROW_UNIT_PX = 2; // --masonry-row-unit と同じ値（tokens.css）

const masonry = tv({
  base: [
    // items-start: グリッドの既定（stretch）で子を引き伸ばすと、測る前のふつうのグリッド（grid-auto-rows: auto）
    // のときに、同じ行の子がいちばん高い子に合わせて伸びてしまい、ResizeObserver が伸びた高さを測ってしまう
    'grid items-start gap-(--masonry-gap)',
  ],
  variants: {
    // columns を渡すと、Grid と同じ段ごとの列の数（src/internal/breakpoints.ts）。minmax(0, 1fr) で、長い URL などの
    // 縮まない中身があっても列の幅を等しく保つ
    layout: {
      fill: '[grid-template-columns:repeat(auto-fill,minmax(var(--masonry-column-width),1fr))]',
      fixed: [...columnsClasses, '[grid-template-columns:repeat(var(--columns),minmax(0,1fr))]'],
    },
    gap: {
      none: '[--masonry-gap:0px]',
      xs: '[--masonry-gap:var(--stack-gap-xs)]',
      sm: '[--masonry-gap:var(--stack-gap-sm)]',
      md: '[--masonry-gap:var(--stack-gap-md)]',
      lg: '[--masonry-gap:var(--stack-gap-lg)]',
      xl: '[--masonry-gap:var(--stack-gap-xl)]',
    },
  },
  defaultVariants: { layout: 'fill', gap: 'md' },
});

type TokenStyle = CSSProperties & Record<`--${string}`, string>;

export type MasonryGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface MasonryProps extends ComponentProps<'div'> {
  /**
   * 列の最小の幅（px）。入れ物の幅をこの値で割った数だけ列にします（auto-fill）。columns を渡すと固定になります
   * @default 240
   */
  minColumnWidth?: number;
  /**
   * 列の数。渡すと minColumnWidth を無視し、入れ物の幅によらず決まった列の数になります。
   * 数を渡すとどの画面の幅でも同じ（`columns={3}`）、画面の幅の段ごとの数を渡すと画面の幅で変わります（`columns={{ base: 1, md: 2, lg: 3 }}`）。
   * 段は Grid の columns と同じで、渡していない段は 1 つ下の段の数を使います（base もないときは 1 列）
   */
  columns?: GridColumns;
  /**
   * 子の間隔。Stack の gap と同じ段です（none は 0、xs は 4px、sm は 8px、md は 16px、lg は 24px、xl は 40px）
   * @default 'md'
   */
  gap?: MasonryGap;
  /**
   * 描く要素（Base UI の render と同じ）。ul・ol にするときは `render={<ul />}` を渡します。子は li で包みます。
   * ul・ol は要素を直接渡します。ul・ol を中で描く自作の部品を渡しても一覧とはみなさず、子を li で包みません
   */
  render?: ReactElement;
  /** 並べる子。縦横の比率が違っても、渡した順のまま隙間なく積みます */
  children?: ReactNode;
  /** 根の要素（render を渡したときはその要素）に付きます */
  className?: string;
}

interface MasonryItemProps {
  /** 子を包む要素。ul・ol のときは li */
  as: 'div' | 'li';
  measured: boolean;
  span: number | undefined;
  /** 高さを親に返すときの名前（子の key）。子を外す・並べ替えても、その子の高さに対応させる */
  itemKey: string;
  onResize: (key: string, height: number) => void;
  /** 子を外したとき（key が変わったとき）に、その子の高さを捨てる */
  onRemove: (key: string) => void;
  children: ReactNode;
}

function MasonryItem({
  as: Tag,
  measured,
  span,
  itemKey,
  onResize,
  onRemove,
  children,
}: MasonryItemProps) {
  // div と li のどちらでも受けられる型にする（高さを測るだけ）
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height;
      if (height != null) onResize(itemKey, height);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      onRemove(itemKey);
    };
  }, [itemKey, onResize, onRemove]);

  return (
    <Tag
      ref={ref}
      data-slot="masonry-item"
      style={measured && span != null ? { gridRowEnd: `span ${span}` } : undefined}
    >
      {children}
    </Tag>
  );
}

/**
 * 縦横の比率が違う子を、列に振り分けて隙間なく積む部品。画像やカードなど中身は問いません
 */
export function Masonry({
  minColumnWidth = 240,
  columns,
  gap,
  className,
  render,
  children,
  ref,
  style,
  ...props
}: MasonryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  // 子の高さは、並びの位置（index）でなく子の key ごとに持つ。子を外す・並べ替えると位置がずれるため。
  // key は Children.toArray が付けたもの（key のない子にも位置から付く）。文字・数の子は位置で数える
  const keys = items.map((child, i) =>
    isValidElement(child) && child.key != null ? child.key : `#${i}`
  );
  const [heights, setHeights] = useState<ReadonlyMap<string, number>>(() => new Map());
  const [gapPx, setGapPx] = useState(0);

  const handleResize = useCallback((key: string, height: number) => {
    setHeights((prev) => {
      if (prev.get(key) === height) return prev;
      return new Map(prev).set(key, height);
    });
  }, []);

  // 外した子の高さを捨てる（足した子は、測るまで grid-auto-rows: auto の並びに戻す）
  const handleRemove = useCallback((key: string) => {
    setHeights((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  // 実際の間隔（gap の段の px）を読む。測ったあとは行の間隔を 0 にして、子の下の間隔を span に含める
  // （行の間隔を残すと、span の行の数だけ間隔も足され、子ごとに下の余りがばらつくため）
  useIsomorphicLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setGapPx(parseFloat(getComputedStyle(el).columnGap) || 0);
  }, [gap]);

  const itemTag = isListElement(render) ? 'li' : 'div';
  const measured = items.length > 0 && keys.every((key) => heights.has(key));

  return useRender({
    render,
    defaultTagName: 'div',
    ref: ref ? [rootRef, ref] : rootRef,
    props: {
      ...props,
      'data-slot': 'masonry',
      'data-measured': measured || undefined,
      className: masonry({ layout: columns == null ? 'fill' : 'fixed', gap, className }),
      style: {
        ...style,
        '--masonry-column-width': `${minColumnWidth}px`,
        ...breakpointVars('columns', columns),
        gridAutoRows: measured ? 'var(--masonry-row-unit)' : 'auto',
        ...(measured && { rowGap: 0 }),
      } satisfies TokenStyle,
      children: items.map((child, i) => {
        const key = keys[i];
        const height = heights.get(key);
        return (
          <MasonryItem
            as={itemTag}
            key={key}
            itemKey={key}
            measured={measured}
            span={
              height != null ? Math.max(1, Math.ceil((height + gapPx) / ROW_UNIT_PX)) : undefined
            }
            onResize={handleResize}
            onRemove={handleRemove}
          >
            {child}
          </MasonryItem>
        );
      }),
    },
  });
}
