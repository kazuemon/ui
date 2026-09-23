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
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

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
const ROW_UNIT_PX = 4; // --masonry-row-unit と同じ値（tokens.css）

const masonry = tv({
  base: [
    // items-start: グリッドの既定（stretch）で子を引き伸ばすと、測る前のふつうのグリッド（grid-auto-rows: auto）
    // のときに、同じ行の子がいちばん高い子に合わせて伸びてしまい、ResizeObserver が伸びた高さを測ってしまう
    'grid items-start gap-(--masonry-gap)',
    '[grid-template-columns:repeat(auto-fill,minmax(var(--masonry-column-width),1fr))]',
  ],
  variants: {
    gap: {
      none: '[--masonry-gap:0px]',
      xs: '[--masonry-gap:var(--stack-gap-xs)]',
      sm: '[--masonry-gap:var(--stack-gap-sm)]',
      md: '[--masonry-gap:var(--stack-gap-md)]',
      lg: '[--masonry-gap:var(--stack-gap-lg)]',
      xl: '[--masonry-gap:var(--stack-gap-xl)]',
    },
  },
  defaultVariants: { gap: 'md' },
});

type TokenStyle = CSSProperties & Record<`--${string}`, string>;

export type MasonryGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface MasonryProps extends ComponentProps<'div'> {
  /**
   * 列の最小の幅（px）。入れ物の幅をこの値で割った数だけ列にします（auto-fill）。columns を渡すと固定になります
   * @default 240
   */
  minColumnWidth?: number;
  /** 列の数を固定します。渡すと minColumnWidth を無視し、入れ物の幅によらず同じ列数になります */
  columns?: number;
  /**
   * 子の間隔。Stack の gap と同じ段です（none は 0、xs は 4px、sm は 8px、md は 16px、lg は 24px、xl は 40px）
   * @default 'md'
   */
  gap?: MasonryGap;
  /** 描く要素（Base UI の render と同じ）。ul などにするときは `render={<ul />}` を渡します */
  render?: ReactElement;
  /** 並べる子。縦横の比率が違っても、渡した順のまま隙間なく積みます */
  children?: ReactNode;
  /** 根の要素（render を渡したときはその要素）に付きます */
  className?: string;
}

// サーバーで描くときは useLayoutEffect が警告を出すので、ブラウザでだけ使う（Image.tsx と同じ）
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

interface MasonryItemProps {
  measured: boolean;
  span: number | undefined;
  onResize: (height: number) => void;
  children: ReactNode;
}

function MasonryItem({ measured, span, onResize, children }: MasonryItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height;
      if (height != null) onResize(height);
    });
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onResize は index を閉じ込めた安定した関数
  }, []);

  return (
    <div
      ref={ref}
      data-slot="masonry-item"
      style={measured && span != null ? { gridRowEnd: `span ${span}` } : undefined}
    >
      {children}
    </div>
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
  const [heights, setHeights] = useState<number[]>([]);
  const [rowGapPx, setRowGapPx] = useState(0);

  // 渡した子の数が変わったら測り直す（測っていない子は grid-auto-rows: auto の並びに戻す）
  useEffect(() => {
    setHeights((prev) => (prev.length === items.length ? prev : items.map((_, i) => prev[i])));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 数だけを見る
  }, [items.length]);

  const handleResize = useCallback((index: number, height: number) => {
    setHeights((prev) => {
      if (prev[index] === height) return prev;
      const next = prev.slice();
      next[index] = height;
      return next;
    });
  }, []);

  // 実際の行の間隔（gap の段の px）を読む。span の計算に使う
  useIsomorphicLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setRowGapPx(parseFloat(getComputedStyle(el).rowGap) || 0);
  }, [gap]);

  const measured =
    items.length > 0 && heights.length === items.length && heights.every((h) => h != null);

  return useRender({
    render,
    defaultTagName: 'div',
    ref: ref ? [rootRef, ref] : rootRef,
    props: {
      ...props,
      'data-slot': 'masonry',
      'data-measured': measured || undefined,
      className: masonry({ gap, className }),
      style: {
        ...style,
        '--masonry-column-width': `${minColumnWidth}px`,
        ...(columns != null && { gridTemplateColumns: `repeat(${columns}, 1fr)` }),
        gridAutoRows: measured ? 'var(--masonry-row-unit)' : 'auto',
      } satisfies TokenStyle,
      children: items.map((child, i) => (
        <MasonryItem
          key={isValidElement(child) && child.key != null ? child.key : i}
          measured={measured}
          span={
            heights[i] != null
              ? Math.max(1, Math.ceil((heights[i] + rowGapPx) / (ROW_UNIT_PX + rowGapPx)))
              : undefined
          }
          onResize={(height) => handleResize(i, height)}
        >
          {child}
        </MasonryItem>
      )),
    },
  });
}
