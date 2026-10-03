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
//         <a href="#user-content-fnref-1" data-footnote-backref aria-label="…">↩</a></p></li></ol></section>
//   見出しの文と戻るリンクの名前は既定を日本語にしている（remark は footnoteLabel・footnoteBackLabel で変える）
// 見た目のクラス列は src/internal/reading/footnote.ts（Prose も同じものを使う）
// 本文との区切り（線など）は付けない。置く側が Divider などで決める
// id の接頭辞（idPrefix）は remark-rehype の clobberPrefix と同じ。見出しの id だけは、remark と同じく
// 既定の接頭辞のときは付けない（1 ページに 2 つ置くときは、どちらかの idPrefix を変える）

const DEFAULT_ID_PREFIX = 'user-content-';

function labelId(idPrefix: string) {
  return idPrefix === DEFAULT_ID_PREFIX ? 'footnote-label' : `${idPrefix}footnote-label`;
}

const defaultBackrefName = (id: string) => `参照 ${id} に戻る`;

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
  /**
   * id の接頭辞。1 ページに脚注の一覧を 2 つ置くときは、組ごとに変えます。
   * 既定（`'user-content-'`）は remark-gfm の出力と同じです。変えるときは remark-rehype の clobberPrefix にも同じ接頭辞を渡します（渡さないと、本文の脚注番号のリンク先と一覧の id がずれます）
   * @default 'user-content-'
   */
  idPrefix?: string;
}

/**
 * 本文の脚注の参照
 */
export function FootnoteRef({
  id,
  children,
  idPrefix = DEFAULT_ID_PREFIX,
  className,
  ...props
}: FootnoteRefProps) {
  const styles = ref();
  return (
    <sup className={styles.sup()}>
      <a
        href={`#${idPrefix}fn-${id}`}
        id={`${idPrefix}fnref-${id}`}
        data-footnote-ref=""
        aria-describedby={labelId(idPrefix)}
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
   * @default '脚注'
   */
  label?: ReactNode;
  /**
   * id の接頭辞。FootnoteRef・FootnoteItem と同じ値にします。見出しの id は、既定では remark と同じ `footnote-label`、変えたときは `<idPrefix>footnote-label` です。
   * 既定（`'user-content-'`）は remark-gfm の出力と同じです。変えるときは remark-rehype の clobberPrefix にも同じ接頭辞を渡します（渡さないと、本文の脚注番号のリンク先と一覧の id がずれます）
   * @default 'user-content-'
   */
  idPrefix?: string;
  /** FootnoteItem を並べます */
  children?: ReactNode;
}

/**
 * 末尾の脚注の一覧
 */
export function Footnotes({
  label = '脚注',
  idPrefix = DEFAULT_ID_PREFIX,
  className,
  children,
  ...props
}: FootnotesProps) {
  const styles = footnotes();
  return (
    <section
      data-footnotes=""
      className={styles.root({ className: ['footnotes', className].filter(Boolean).join(' ') })}
      {...props}
    >
      <h2 id={labelId(idPrefix)} className={styles.label()}>
        {label}
      </h2>
      <List as="ol">{children}</List>
    </section>
  );
}

export interface FootnoteItemProps extends Omit<ComponentProps<'li'>, 'id'> {
  /** 脚注の識別子。参照（FootnoteRef）の id と同じ値にします */
  id: string;
  /**
   * id の接頭辞。FootnoteRef・Footnotes と同じ値にします。
   * 既定（`'user-content-'`）は remark-gfm の出力と同じです。変えるときは remark-rehype の clobberPrefix にも同じ接頭辞を渡します（渡さないと、本文の脚注番号のリンク先と一覧の id がずれます）
   * @default 'user-content-'
   */
  idPrefix?: string;
  /**
   * 参照へ戻るリンクの読み上げの名前。脚注の識別子を受けて文を返します
   * @default (id) => `参照 ${id} に戻る`
   */
  backrefName?: (id: string) => string;
  /** 脚注の文を入れます */
  children?: ReactNode;
}

/**
 * 脚注の一覧の 1 項目。文の後ろに、参照へ戻るリンク（矢印のアイコン）を付けます
 */
export function FootnoteItem({
  id,
  idPrefix = DEFAULT_ID_PREFIX,
  backrefName = defaultBackrefName,
  children,
  ...props
}: FootnoteItemProps) {
  const styles = footnotes();
  return (
    <li id={`${idPrefix}fn-${id}`} {...props}>
      <p>
        {children}{' '}
        <a
          href={`#${idPrefix}fnref-${id}`}
          data-footnote-backref=""
          aria-label={backrefName(id)}
          className={styles.backref()}
        >
          {/* 大きさと位置は backref の [&_svg] で付ける */}
          <ArrowUDownLeftIcon className="" />
        </a>
      </p>
    </li>
  );
}
