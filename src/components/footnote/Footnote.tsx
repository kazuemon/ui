import type { ComponentProps, ReactNode } from 'react';

import { focusRing } from '../../internal/focus-styles';
import { ArrowUDownLeftIcon } from '../../internal/icons';
import { footnoteRefStyles, footnotesStyles } from '../../internal/reading/footnote';
import { tv } from '../../internal/tv';
import { List } from '../list/List';

// 脚注（本文の参照と、末尾の一覧）— 軸 61
// Markdown（GFM）を変換した HTML と同じ要素・属性を出す
//   参照: <sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref aria-describedby="footnote-label">1</a></sup>
//   一覧: <section data-footnotes class="footnotes"><h2 class="sr-only" id="footnote-label">Footnotes</h2><ol><li id="user-content-fn-1"><p>…
//         <a href="#user-content-fnref-1" data-footnote-backref aria-label="Back to reference 1">↩</a></p></li></ol></section>
// 見た目のクラス列は src/internal/reading/footnote.ts（Prose も同じものを使う）
// 本文との区切り（線など）は付けない。置く側が Divider などで決める

const ref = tv({
  slots: {
    sup: footnoteRefStyles.sup,
    link: [...footnoteRefStyles.link, ...focusRing],
  },
});

export interface FootnoteRefProps extends Omit<ComponentProps<'a'>, 'href' | 'id' | 'children'> {
  /** 脚注の識別子。GFM の [^1] の 1。href と id に使います */
  id: string;
  /** 見せる番号。指定しないときは id です */
  children?: ReactNode;
}

/**
 * 本文の脚注の参照
 */
export function FootnoteRef({ id, children, className, ...props }: FootnoteRefProps) {
  const styles = ref();
  return (
    <sup className={styles.sup()}>
      <a
        href={`#user-content-fn-${id}`}
        id={`user-content-fnref-${id}`}
        data-footnote-ref=""
        aria-describedby="footnote-label"
        className={styles.link({ className })}
        {...props}
      >
        {children ?? id}
      </a>
    </sup>
  );
}

const footnotes = tv({
  slots: {
    root: footnotesStyles.root,
    label: footnotesStyles.label,
    backref: [...footnotesStyles.backref, footnotesStyles.backrefIcon, ...focusRing],
  },
});

export interface FootnotesProps extends Omit<ComponentProps<'section'>, 'children'> {
  /**
   * 見出しの文。ふだんは読み上げだけで、参照の説明（aria-describedby）になります
   * @default 'Footnotes'
   */
  label?: ReactNode;
  /** FootnoteItem を並べます */
  children?: ReactNode;
}

/**
 * 末尾の脚注の一覧
 */
export function Footnotes({ label = 'Footnotes', className, children, ...props }: FootnotesProps) {
  const styles = footnotes();
  return (
    <section
      data-footnotes=""
      className={styles.root({ className: ['footnotes', className].filter(Boolean).join(' ') })}
      {...props}
    >
      <h2 id="footnote-label" className={styles.label()}>
        {label}
      </h2>
      <List as="ol">{children}</List>
    </section>
  );
}

export interface FootnoteItemProps extends Omit<ComponentProps<'li'>, 'id'> {
  /** 脚注の識別子。参照（FootnoteRef）の id と同じ値にします */
  id: string;
}

/**
 * 脚注の一覧の 1 項目。文の後ろに、参照へ戻るリンク（矢印のアイコン）を付けます
 */
export function FootnoteItem({ id, children, ...props }: FootnoteItemProps) {
  const styles = footnotes();
  return (
    <li id={`user-content-fn-${id}`} {...props}>
      <p>
        {children}{' '}
        <a
          href={`#user-content-fnref-${id}`}
          data-footnote-backref=""
          aria-label={`Back to reference ${id}`}
          className={styles.backref()}
        >
          {/* 大きさと位置は backref の [&_svg] で付ける */}
          <ArrowUDownLeftIcon className="" />
        </a>
      </p>
    </li>
  );
}
