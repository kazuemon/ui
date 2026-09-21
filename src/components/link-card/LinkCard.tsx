'use client';

import { useRender } from '@base-ui/react/use-render';
import {
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  useId,
} from 'react';

import { focusRing } from '../../internal/focus-styles';
import { ArrowUpRightIcon } from '../../internal/icons';
import { newTabNaming, opensNewTab, renderPropOf } from '../../internal/link-parts';
import { tv } from '../../internal/tv';
import { Image } from '../image/Image';

// リンクカード — 軸 115〜117 で決定（ADR-0143〜0145）
//   記事の中から別のページへ移るカード。題・説明・サイト（favicon とドメイン）・画像を並べ、カード全体が 1 つのリンクになる
//   カードの仲間なので、面・角・輪郭・影・hover・押下はカード（Card）と同じ（原則1・3・5、ADR-0169）
//     ボタンと同じ薄い影を付け、hover で落ち影を消して面を淡く塗り（--card-fill。theme.css で登録）、押すと沈む
//     hover で画像を少し大きくする動きは、imageZoom を渡したときだけ（既定はなし）
//   並び（画像の位置）は layout（既定 end。文が左・画像が右）。start・top も選べる。画像がないときはどれも文だけの 1 列
//     画像の枠は --link-card-media-aspect の比を最小の高さにして、行の高さまで伸ばす（文が長いと縦に伸び、はみ出た分を切る）
//   サイトの行の位置は sitePlacement（既定 top。題の上）。favicon は渡したときだけ出す（既定は渡さない＝出さない）
//   新しいタブで開くときは、読み上げに「新しいタブで開きます」を足し（原則7）、サイトの行の後ろに ↗ を付ける（常に）
//   題・説明の行数は titleLines・descriptionLines（既定 2・2）。超えた分は … で切る。題の大きさは本文の太字で固定（見出しの大きさは採らなかった）
//   読み上げの名前は題だけにし、説明とサイトは説明（aria-describedby）に回す。中の文を全部名前にすると長すぎるため
//
// Prose の中に置いても崩れないようにする
//   Prose は中の a・img に文字のリンクと画像の見た目を詳細度 0 で当てる。ここで同じ性質を書いて打ち消す（下線・余白・角・輪郭・色）
//   Prose は押した文字のリンクを top で沈める（詳細度が高い）。カードも top で同じだけ沈め、二重に沈まないようにする
//   上下の余白は Prose が付ける（要素のあいだの余白）。部品は外側の余白を持たない
const styles = tv({
  slots: {
    root: [
      'group/link-card relative top-0 m-0 block overflow-hidden rounded-card p-0 text-fg no-underline',
      'border-(length:--border-width-thin) border-surface-line',
      'bg-(color:--card-fill) [--card-fill:var(--color-surface)]',
      'cursor-pointer',
      ...focusRing,
      'shadow-raised hover:shadow-raised-hover hover:[--card-fill:var(--card-fill-hover)]',
      'active:top-(--press-depth) active:shadow-(--shadow-raised-press)',
      '[transition:--card-fill_var(--duration-press)_var(--ease-press),box-shadow_var(--duration-press)_var(--ease-press),top_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
    ],
    body: [
      'flex min-w-0 flex-col justify-center gap-(--link-card-gap) p-(--link-card-padding) [grid-area:body]',
    ],
    title: ['line-clamp-(--link-card-title-lines) text-body font-bold [overflow-wrap:anywhere]'],
    description:
      'line-clamp-(--link-card-description-lines) text-body-sm [overflow-wrap:anywhere] text-fg-muted',
    site: ['flex min-w-0 items-center gap-1.5', 'text-caption text-fg-subtle'],
    favicon: 'm-0 size-4 shrink-0 rounded-xs [outline:none]',
    siteName: 'min-w-0 truncate',
    external: 'size-3.5 shrink-0',
    media:
      'relative aspect-(--link-card-media-aspect) w-full min-w-0 self-stretch [grid-area:media]',
    image: [
      'm-0 max-w-none [outline:none]',
      '[transition:scale_var(--duration-normal)_var(--ease-press)] motion-reduce:[transition:none]',
      'group-data-image-zoom/link-card:group-hover/link-card:scale-(--card-hover-media-scale)',
    ],
  },
  variants: {
    hasMedia: {
      true: { root: 'grid' },
      false: {},
    },
    // 画像の位置（軸 115）。end: 文 → 画像（横）、start: 画像 → 文（横）、top: 画像 → 文（縦）
    layout: {
      end: {
        root: "[grid-template-columns:minmax(0,1fr)_var(--link-card-media-width)] [grid-template-areas:'body_media']",
      },
      start: {
        root: "[grid-template-columns:var(--link-card-media-width)_minmax(0,1fr)] [grid-template-areas:'media_body']",
      },
      top: {
        root: "[grid-template-columns:minmax(0,1fr)] [grid-template-areas:'media'_'body']",
      },
    },
    // サイトの行の位置（軸 116）。top: 題の上、bottom: 説明の下（body の最後に描いているので、順は変えなくてよい）
    sitePlacement: {
      top: { site: 'order-first' },
      bottom: {},
    },
  },
  defaultVariants: { hasMedia: false, layout: 'end', sitePlacement: 'top' },
});

/** 題・説明の行数を CSS 変数にする（部品の中だけで使う。tokens.css には置かない） */
function lineClampVars(
  titleLines: number,
  descriptionLines: number
): CSSProperties & Record<`--${string}`, string> {
  return {
    '--link-card-title-lines': String(titleLines),
    '--link-card-description-lines': String(descriptionLines),
  };
}

/** 絶対の URL（http・https）から、見せるドメインを作る。先頭の www. は外す */
function domainOf(href: unknown): string | undefined {
  if (typeof href !== 'string' || !/^https?:\/\//i.test(href)) return undefined;
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

export interface LinkCardProps extends Omit<ComponentProps<'a'>, 'title' | 'children'> {
  /** 移る先。Next.js の Link などを使うときは、href を render に渡す要素に書きます */
  href?: string;
  /** 題。移る先のページの題です。読み上げでは、これがリンクの名前になります */
  title: ReactNode;
  /** 説明。移る先のページの概要です。長いときは決まった行数で切ります */
  description?: ReactNode;
  /**
   * 画像（OG 画像など）の URL か、Next.js の Image などの要素です。要素を渡すときは、src・alt をその要素に書きます。
   * 渡さないときは、文だけのカードになります
   */
  image?: string | ReactElement;
  /**
   * 画像の代わりの文。題と同じ内容の画像（OG 画像）は、飾りとして空文字のままにします
   * @default ''
   */
  imageAlt?: string;
  /** サイトのアイコン（favicon）の URL */
  favicon?: string;
  /**
   * サイトの名前。指定しないときは、href が http・https の URL ならそのドメインを出します（先頭の www. は外します）。
   * false でサイトの行を出しません
   */
  site?: ReactNode | false;
  /** リンクの開き方（'_blank' で新しいタブ）。新しいタブのときは、読み上げに「新しいタブで開きます」を足し、サイトの後ろに ↗ を付けます */
  target?: string;
  /** リンクの rel。新しいタブで開くときは、指定しなければ noopener noreferrer を付けます */
  rel?: string;
  /**
   * 描く要素（Base UI の render と同じ）。Next.js の Link などを渡すと、その要素にカードの見た目を重ねます（例: `render={<NextLink href="/blog/1" />}`）
   */
  render?: ReactElement;
  /**
   * 画像の位置。end は文の右、start は文の左、top は文の上です。画像がないときは、どれも文だけの 1 列になります
   * @default 'end'
   */
  layout?: 'end' | 'start' | 'top';
  /**
   * サイトの行（favicon・ドメイン）の位置。top は題の上、bottom は説明の下です
   * @default 'top'
   */
  sitePlacement?: 'top' | 'bottom';
  /**
   * hover したときに画像を少し大きくします。影と面の変化に、画像の動きを足したいときに使います
   * @default false
   */
  imageZoom?: boolean;
  /**
   * 題の最大の行数。超えた分は最後に三点を付けて切ります
   * @default 2
   */
  titleLines?: number;
  /**
   * 説明の最大の行数。超えた分は最後に三点を付けて切ります
   * @default 2
   */
  descriptionLines?: number;
}

/**
 * 記事の中から別のページへ移るカード。題・説明・サイト・画像を並べ、カード全体が 1 つのリンクになります
 */
export function LinkCard({
  href,
  title,
  description,
  image,
  imageAlt = '',
  favicon,
  site,
  target,
  rel,
  render,
  layout = 'end',
  sitePlacement = 'top',
  imageZoom = false,
  titleLines = 2,
  descriptionLines = 2,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...props
}: LinkCardProps) {
  const titleId = useId();
  const descriptionId = useId();
  const siteId = useId();
  const noteId = useId();
  const newTab = target === '_blank' || opensNewTab(render);
  const siteLabel =
    site === false ? null : (site ?? domainOf(href ?? renderPropOf(render, 'href')));
  const showSite = siteLabel != null || (site !== false && favicon != null);
  const hasMedia = image != null;

  // 名前は、利用者が付けていなければ題。新しいタブのときは、名前の後ろに「新しいタブで開きます」を足す
  const labelledBy =
    ariaLabelledBy ??
    (ariaLabel == null && renderPropOf(render, 'aria-label') == null ? titleId : undefined);
  const own = { 'aria-label': ariaLabel, 'aria-labelledby': labelledBy };
  const naming = newTab ? newTabNaming(own, render, noteId) : null;
  const describedBy =
    [ariaDescribedBy, description != null ? descriptionId : null, showSite ? siteId : null]
      .filter(Boolean)
      .join(' ') || undefined;

  const s = styles({ hasMedia, layout, sitePlacement });
  return useRender({
    render,
    defaultTagName: 'a',
    props: {
      ...props,
      ...(href != null && { href }),
      ...(target != null && { target }),
      ...((newTab || rel != null) && { rel: newTab ? (rel ?? 'noopener noreferrer') : rel }),
      'aria-label': ariaLabel,
      'aria-labelledby': labelledBy,
      ...naming?.props,
      'aria-describedby': describedBy,
      'data-slot': 'link-card',
      'data-media': hasMedia || undefined,
      'data-image-zoom': imageZoom || undefined,
      className: s.root({ className }),
      style: { ...style, ...lineClampVars(titleLines, descriptionLines) },
      children: (
        <>
          <span className={s.body()}>
            <span id={titleId} data-slot="link-card-title" className={s.title()}>
              {title}
            </span>
            {description != null && (
              <span
                id={descriptionId}
                data-slot="link-card-description"
                className={s.description()}
              >
                {description}
              </span>
            )}
            {showSite && (
              <span data-slot="link-card-site" className={s.site()}>
                {favicon != null && (
                  <img src={favicon} alt="" width={16} height={16} className={s.favicon()} />
                )}
                <span id={siteId} className={s.siteName()}>
                  {siteLabel}
                </span>
                {newTab && <ArrowUpRightIcon className={s.external()} />}
              </span>
            )}
          </span>
          {hasMedia && (
            <span data-slot="link-card-media" className={s.media()}>
              <Image
                {...(typeof image === 'string' ? { src: image, alt: imageAlt } : { render: image })}
                ratio="auto"
                radius="none"
                hideOutline
                errorText=""
                className={s.image()}
                frameProps={{ className: 'h-full' }}
              />
            </span>
          )}
          {naming?.note}
        </>
      ),
    },
  });
}
