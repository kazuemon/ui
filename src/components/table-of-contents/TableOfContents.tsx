import { type ComponentProps, type MouseEvent, useEffect, useMemo, useRef } from 'react';

import { focusRing } from '../../internal/focus-styles';
import { tv } from '../../internal/tv';
import { revealInScrollArea } from './reveal-current';
import { type TableOfContentsItem, type TocNode, buildTocTree } from './toc-tree';
import { useCurrentHeading } from './use-current-heading';

// ブログ記事の目次 — 軸 165・166
//   構造: <nav aria-label> ＞ ul ＞ li ＞ a（#id へのリンク）＋入れ子の ul。見出しの段から木を組む（toc-tree.ts）
//     見える題（「目次」）は nav の名前と同じ文なので、読み上げでは題を読まず、nav の名前として一度だけ読む（原則15）
//   今読んでいる見出しは aria-current="location"。スクロールのたびに DOM を読んで求める（current-heading.ts）か、
//     currentId で外から渡す
//   行は平らな押すもの（原則3）。hover で文字の色を淡く敷き、押すと濃くして 1px 沈む。影はない（原則1）
//     行の高さは部品の高さにしない。記事の横に並ぶ文字のリンクの一覧で、44px の行では目次が長くなりすぎるため（原則にない判断）
//     文字はラベルと同じ大きさで、入力方式で変えない（原則11。記事の横の補足の文字）
//   一覧の左に細い線を引き、今の見出しの印はその線の上に重ねる（軸 165: --toc-current-*）
//     どの印でも今の見出しは太字。太字の写しを重ねて幅を取っておくので、太くなっても折り返しが変わらない
//   入れ子の段は字下げで見せる（軸 166: --toc-indent・--toc-guide-*・--toc-nested-color）
//   ScrollArea の中に置くと、今の見出しの行が枠の外に出たとき、枠の中だけをスクロールして見せる（reveal-current.ts）
const styles = tv({
  slots: {
    root: 'flex min-w-0 flex-col gap-(--toc-gap) text-(length:--text-label) leading-(--leading-label)',
    title: 'font-bold text-fg',
    // 一覧の左の細い線（今の見出しの印が載る）
    list: [
      'flex flex-col ps-(--toc-track-gap)',
      'border-s-(length:--toc-track-width) border-(color:--toc-track-color)',
    ],
    // 入れ子の並び。段ごとの細い線（--toc-guide-width）は、ふだんは 0
    group: [
      'ms-(--toc-guide-margin) flex flex-col ps-(--toc-indent)',
      'border-s-(length:--toc-guide-width) border-(color:--toc-track-color)',
    ],
    link: [
      'relative grid rounded-control px-(--toc-item-px) py-(--toc-item-py) no-underline',
      '[overflow-wrap:anywhere]',
      'text-(color:--toc-link-color) [--toc-link-color:var(--toc-item-color)]',
      'data-nested:[--toc-link-color:var(--toc-nested-color)]',
      // 塗り: ふだんは --toc-item-rest（今の見出しは --toc-current-bg）。hover と押下は、その上に文字の色を淡く敷く
      // 塗りは --flat-bg（theme.css で登録）に置き、background-color ではなく変数を動かす（ADR-0112）
      'bg-(color:--flat-bg) [--flat-bg:var(--toc-item-rest)] [--toc-item-rest:transparent]',
      'hover:[--flat-bg:color-mix(in_oklab,currentColor_var(--flat-hover-mix),var(--toc-item-rest))]',
      'active:translate-y-(--flat-press-depth) active:[--flat-bg:color-mix(in_oklab,currentColor_var(--flat-press-mix),var(--toc-item-rest))]',
      '[transition:--flat-bg_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
      ...focusRing,
      // 今の見出し: 太字にし、文字の色と塗りを印のものにする
      'aria-[current=location]:font-bold',
      'aria-[current=location]:[--toc-item-rest:var(--toc-current-bg)] aria-[current=location]:[--toc-link-color:var(--toc-current-fg)]',
      // 今の見出しの印の線。一覧の左の線の中心に、段にかかわらず重ねる
      "before:absolute before:inset-y-0 before:hidden before:w-(--toc-current-bar-width) before:rounded-pill before:bg-(color:--toc-current-bar-color) before:content-['']",
      'before:start-[calc(-1*(var(--toc-track-width)*0.5+var(--toc-current-bar-width)*0.5+var(--toc-track-gap)+var(--toc-depth)*(var(--toc-guide-margin)+var(--toc-guide-width)+var(--toc-indent))))]',
      'aria-[current=location]:before:block',
    ],
    // 見える文字と、幅を取るための太字の写しを同じ場所に重ねる
    text: '[grid-area:1/1]',
    ghost: 'invisible font-bold [grid-area:1/1]',
  },
});

export type { TableOfContentsItem };

export interface TableOfContentsProps extends Omit<ComponentProps<'nav'>, 'children'> {
  /** 並べる見出し（id・文字・段）。記事の順に渡します。段は h2 なら 2 で、いちばん小さい段が 1 段目になります */
  items: readonly TableOfContentsItem[];
  /**
   * 目次の名前。一覧の上に題として出し、読み上げでは nav の名前として読みます
   * @default '目次'
   */
  label?: string;
  /**
   * 題を出しません。名前は読み上げにだけ残ります。見出しや Collapsible の行など、目次の外に題があるときに使います
   * @default false
   */
  hideLabel?: boolean;
  /**
   * 今読んでいる見出しの id。渡すと、スクロールから求めずにこの id を今の見出しにします（null なら、どれも示さない）。
   * 渡さないときは、スクロールのたびに求めます
   */
  currentId?: string | null;
  /** スクロールから求めた今の見出しが変わったときに呼ばれます。currentId を渡しているときは呼ばれません */
  onCurrentChange?: (id: string | null) => void;
  /**
   * 見出しが、スクロールする枠（なければ画面）の上からこの距離（px）より上に来たら、今読んでいる見出しにします。
   * 見出しに scroll-margin-top があれば、それより手前にはしません（リンクで移った見出しが、必ず今の見出しになります）。
   * 渡さないときは、枠の高さの 4 分の 1 です
   */
  offset?: number;
  /** 見出しのリンクを押したときに呼ばれます。狭い画面で、開いた目次を閉じるときなどに使います */
  onItemClick?: (id: string, event: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * ブログ記事の目次。見出しの一覧を入れ子の一覧で並べ、今読んでいる見出しを示します
 */
export function TableOfContents({
  items,
  label = '目次',
  hideLabel = false,
  currentId,
  onCurrentChange,
  offset,
  onItemClick,
  className,
  ...props
}: TableOfContentsProps) {
  const slots = styles();
  const tree = useMemo(() => buildTocTree(items), [items]);
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const controlled = currentId !== undefined;
  const tracked = useCurrentHeading(ids, offset, !controlled);
  const current = controlled ? currentId : tracked;
  const navRef = useRef<HTMLElement>(null);

  // 求めた今の見出しが変わったら知らせる。最初の null は知らせない
  const reported = useRef<string | null>(null);
  useEffect(() => {
    if (controlled || tracked === reported.current) return;
    reported.current = tracked;
    onCurrentChange?.(tracked);
  }, [controlled, tracked, onCurrentChange]);

  // ScrollArea の中に置いたとき、今の見出しの行を枠の中に見せる
  useEffect(() => {
    if (current == null) return;
    const link = navRef.current?.querySelector<HTMLElement>('[aria-current="location"]');
    if (link) revealInScrollArea(link);
  }, [current]);

  if (items.length === 0) return null;

  const renderNodes = (nodes: TocNode[]) =>
    nodes.map((node) => (
      <li key={node.id} className="flex flex-col">
        <a
          href={`#${node.id}`}
          data-slot="table-of-contents-link"
          data-nested={node.depth > 0 ? '' : undefined}
          aria-current={node.id === current ? 'location' : undefined}
          className={slots.link()}
          style={{ ['--toc-depth' as string]: node.depth }}
          onClick={onItemClick ? (event) => onItemClick(node.id, event) : undefined}
        >
          <span className={slots.text()}>{node.text}</span>
          <span aria-hidden="true" className={slots.ghost()}>
            {node.text}
          </span>
        </a>
        {node.children.length > 0 && (
          <ul className={slots.group()}>{renderNodes(node.children)}</ul>
        )}
      </li>
    ));

  return (
    <nav
      ref={navRef}
      aria-label={label}
      data-slot="table-of-contents"
      className={slots.root({ className })}
      {...props}
    >
      {!hideLabel && (
        <p aria-hidden="true" className={slots.title()}>
          {label}
        </p>
      )}
      <ul className={slots.list()}>{renderNodes(tree)}</ul>
    </nav>
  );
}
