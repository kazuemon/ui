'use client';

import { type ComponentProps, type Ref, useCallback, useRef } from 'react';

import { focusRingInProse } from '../../internal/focus-styles';
import { blockquoteStyles, dividerStyles, figureImageStyles } from '../../internal/reading/blocks';
import { codeStyles, kbdStyles } from '../../internal/reading/code';
import { codeBlockStyles } from '../../internal/reading/code-block';
import { footnoteRefStyles, footnotesStyles } from '../../internal/reading/footnote';
import { headingStyles } from '../../internal/reading/heading';
import { listStyles } from '../../internal/reading/list';
import { tableStyles } from '../../internal/reading/table';
import { textStyles } from '../../internal/reading/text';
import {
  textLinkPrimaryInProse,
  textLinkSizeReset,
  textLinkStyles,
} from '../../internal/reading/text-link';
import { useScrollTabStops } from '../../internal/use-scrollable';
import { inlineStyles } from './inline-styles';

// 記事の本文。Markdown を変換した素の HTML（h1〜h6・p・a・strong・em・del・mark・code・kbd・br・ul・ol・li・チェックリスト・
//   blockquote・pre.shiki・table・img・hr・GFM の脚注）に、読む部品と同じ見た目を当てる
// 見た目のクラス列は部品と同じもの（src/internal/reading/）。根に付けると、中の要素に効く（根には data-prose を付け、根そのものには効かせない）
//   部品の既定の見た目だけを当てる（引用は左のグレーの線、区切り線は幅いっぱい、表は lines、コードは surface）。リンクは Primary の青
//   見た目を変えたいときは、Prose で素の HTML に当てるのではなく、利用者が部品を直接使う（Prose は props で見た目を選ばない）
//   文字のリンクの大きさは、中では周りの文字のまま（1em。記事の中なので 16px）
// 根に data-reading を付ける（読む文字は指でもマウスと同じ大きさ。表とコードは部品と同じく指で 14px／どちらも 14px）
// 素の HTML では、部品の機能は付かない（表の名前の付いた包み・コードのコピーのボタン）。表と pre は、それ自身が横にスクロールする
//   横にはみ出しているあいだだけ tabindex="0" を付け、キーボードで止まるようにする（下の scrollers）
//
// 要素のあいだの余白（軸 70。値は tokens の --prose-*。マウスでは見出しと区切り線の上を広く、指では詰める）
//   後ろの要素の上（margin-top）にだけ付ける。最初の要素の上と最後の要素の下には付かない
//   並びの入れ物は、根（HTML を子の div 1 つに入れたときは、その div）・blockquote・li
//   詳細度で選ぶ: 要素のあいだ（block）< 段落と段落（paragraph）< 画像だけの段落の上下（block）
//     見出しの後ろ（heading-N-after）< 見出しの上（前が見出しでないとき。heading-N-before）
//     区切り線の上下（divider。見出しの後ろの区切り線は見出しの後ろの余白）
//   部品の見た目の余白（区切り線の my-0 など）は詳細度 0 なので、ここの規則が勝つ

const s = inlineStyles();

const flow = [
  '[:is(&,&>div:only-child)>*+*]:mt-(--prose-block-gap)',
  '[:is(&,&>div:only-child)>p+p]:mt-(--prose-paragraph-gap)',
  // 画像だけの段落は、段落ではなく画像として上下を空ける（見出しと区切り線の隣は、それぞれの規則）
  '[:is(&,&>div:only-child)>:not(hr,h1,h2,h3,h4,h5,h6)+p:has(>img:only-child)]:mt-(--prose-block-gap)',
  '[:is(&,&>div:only-child)>p:has(>img:only-child)+:not(hr,h1,h2,h3,h4,h5,h6)]:mt-(--prose-block-gap)',
  // 見出しの上（前が見出しでないとき）と、見出しのすぐ後ろ
  '[:is(&,&>div:only-child)>:not(h1,h2,h3,h4,h5,h6)+h1]:mt-(--prose-heading-1-before) [:is(&,&>div:only-child)>h1+*]:mt-(--prose-heading-1-after)',
  '[:is(&,&>div:only-child)>:not(h1,h2,h3,h4,h5,h6)+h2]:mt-(--prose-heading-2-before) [:is(&,&>div:only-child)>h2+*]:mt-(--prose-heading-2-after)',
  '[:is(&,&>div:only-child)>:not(h1,h2,h3,h4,h5,h6)+h3]:mt-(--prose-heading-3-before) [:is(&,&>div:only-child)>h3+*]:mt-(--prose-heading-3-after)',
  '[:is(&,&>div:only-child)>:not(h1,h2,h3,h4,h5,h6)+:is(h4,h5,h6)]:mt-(--prose-heading-4-before) [:is(&,&>div:only-child)>:is(h4,h5,h6)+*]:mt-(--prose-heading-4-after)',
  // 見出しのすぐ後ろが段落でないとき（軸 72）。リストは --prose-heading-list-extra（4px）、
  //   引用・コード・表・画像だけの段落は --prose-heading-block-extra（マウス 12px・指 0）だけ、見出しの後ろの余白に足す
  '[:is(&,&>div:only-child)>h1+:is(ul,ol)]:mt-[calc(var(--prose-heading-1-after)+var(--prose-heading-list-extra))]',
  '[:is(&,&>div:only-child)>h1+:is(blockquote,pre,table,p:has(>img:only-child))]:mt-[calc(var(--prose-heading-1-after)+var(--prose-heading-block-extra))]',
  '[:is(&,&>div:only-child)>h2+:is(ul,ol)]:mt-[calc(var(--prose-heading-2-after)+var(--prose-heading-list-extra))]',
  '[:is(&,&>div:only-child)>h2+:is(blockquote,pre,table,p:has(>img:only-child))]:mt-[calc(var(--prose-heading-2-after)+var(--prose-heading-block-extra))]',
  '[:is(&,&>div:only-child)>h3+:is(ul,ol)]:mt-[calc(var(--prose-heading-3-after)+var(--prose-heading-list-extra))]',
  '[:is(&,&>div:only-child)>h3+:is(blockquote,pre,table,p:has(>img:only-child))]:mt-[calc(var(--prose-heading-3-after)+var(--prose-heading-block-extra))]',
  '[:is(&,&>div:only-child)>:is(h4,h5,h6)+:is(ul,ol)]:mt-[calc(var(--prose-heading-4-after)+var(--prose-heading-list-extra))]',
  '[:is(&,&>div:only-child)>:is(h4,h5,h6)+:is(blockquote,pre,table,p:has(>img:only-child))]:mt-[calc(var(--prose-heading-4-after)+var(--prose-heading-block-extra))]',
  // 区切り線の上下
  '[:is(&,&>div:only-child)>:not(h1,h2,h3,h4,h5,h6)+hr]:mt-(--prose-divider-gap) [:is(&,&>div:only-child)>hr+*]:mt-(--prose-divider-gap)',
  // 脚注の一覧: 区切り線と同じだけ空ける。線などの区切りは付けない（見た目を付けるのは利用者）
  '[:is(&,&>div:only-child)>*+[data-footnotes]]:mt-(--prose-divider-gap)',
  // 引用の中の段落のあいだ
  '[&_blockquote>*+*]:mt-(--prose-paragraph-gap)',
  // リストの項目の中の段落・コード・表などのあいだ（ゆるいリストの段落と同じ）。入れ子のリストの上はリストの規則
  '[&_li>*+:not(ul,ol)]:mt-(--list-item-gap-loose)',
];

// 部品と作りが違うところ
const htmlOnly = [
  // 部品の引用は、アイコンと中身を横に並べる flex。素の blockquote は段落を縦に並べる
  '[&_blockquote]:block',
  // 部品の表は包みの div が横にスクロールする。素の table は、table そのものを block にしてスクロールさせる
  //   block にした table の中の表は中身の幅になる（幅に満たない表は、部品と違い幅いっぱいに広がらない）
  '[&_table]:block [&_table]:overflow-x-auto',
  // 部品の pre は透明で、面は外枠の figure が持つ。素の pre は面そのものなので、Shiki が style に書く地（--shiki-background）を面の色にする
  '[&_pre]:[--shiki-background:var(--cb-bg)]',
];

const proseClassName = [
  textStyles.size.md,
  textStyles.tone.default,
  textLinkSizeReset,
  // 見出し
  headingStyles.base,
  ...Object.values(headingStyles.size),
  // 文の中
  s.strong(),
  s.em(),
  s.del(),
  s.mark(),
  ...codeStyles.base,
  codeStyles.wrap.normal,
  ...kbdStyles,
  ...textLinkStyles,
  textLinkPrimaryInProse,
  ...focusRingInProse,
  // 脚注
  footnoteRefStyles.sup,
  ...footnoteRefStyles.link,
  footnotesStyles.root,
  footnotesStyles.label,
  ...footnotesStyles.backref,
  ...footnotesStyles.backrefIconInProse,
  // かたまり
  blockquoteStyles.body,
  blockquoteStyles.line,
  blockquoteStyles.neutral,
  dividerStyles.base,
  dividerStyles.full,
  figureImageStyles.base,
  figureImageStyles.outline,
  ...listStyles.base,
  ...listStyles.ul,
  ...listStyles.ol,
  ...tableStyles.table,
  ...tableStyles.cells,
  tableStyles.lines,
  ...codeBlockStyles.surface,
  ...codeBlockStyles.surfaceColors,
  ...codeBlockStyles.body,
  ...htmlOnly,
  ...flow,
].join(' ');

export interface ProseProps extends Omit<ComponentProps<'div'>, 'ref'> {
  /**
   * 描く要素。記事の本文は article、ページの一部は section にします
   * @default 'div'
   */
  as?: 'div' | 'article' | 'section' | 'main';
  /** 根の要素。as で描く要素が変わるので、型は HTMLElement */
  ref?: Ref<HTMLElement>;
}

// 横にスクロールする素の要素（表とコード）。部品（Table・CodeBlock）が中に置かれたときは、部品が自分で持つので触らない
const scrollers =
  'table:not([data-slot="table-scroll"] table), pre:not([data-slot="code-block"] pre)';

/**
 * 記事の本文。Markdown などを変換した素の HTML に、読む部品と同じ見た目と、要素のあいだの余白を付けます
 */
export function Prose({ as: Tag = 'div', className, ref, ...props }: ProseProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  // 横にはみ出している表とコードだけ、キーボードで止まるようにする（原則15）
  // 素の表は display: block で横にスクロールし、Shiki の pre は短いコードにも tabindex を付けるので、はみ出していないものからは外す
  useScrollTabStops(rootRef, scrollers);
  const setRefs = useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );
  return (
    <Tag
      data-prose=""
      data-reading=""
      className={className ? `${proseClassName} ${className}` : proseClassName}
      {...props}
      ref={setRefs}
    />
  );
}
