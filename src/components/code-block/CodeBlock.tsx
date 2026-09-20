import { type ComponentProps, type ReactNode, useEffect, useId, useRef } from 'react';

import { focusRing } from '../../internal/focus-styles';
import { CopiedStatus, CopyErrorTooltip, CopyGlyph } from '../../internal/copy/copy-parts';
import { useCopy } from '../../internal/copy/use-copy';
import { codeBlockStyles } from '../../internal/reading/code-block';
import { tv } from '../../internal/tv';
import { codeTextOf } from '../../internal/reading/code-text';

// 複数行のコード（軸 64・66・67・68・69）
// 色分けはブログ側がビルド時に Shiki で行い、この部品は色分けしたあとの HTML に見た目を付ける
// 受け取る形は Shiki の transformers（@shikijs/transformers）の出力:
//   <pre class="shiki"><code><span class="line">…</span>\n<span class="line">…</span></code></pre>
//   強調行 .line.highlighted・差分 .line.diff.add / .line.diff.remove・フォーカス .line.focused・語の強調 .highlighted-word
//   色は createCssVariablesTheme の CSS 変数（style="color: var(--shiki-token-keyword)"）
// 面（root）と中身（body）の見た目のクラス列は src/internal/reading/code-block.ts（Prose が素の pre.shiki に同じ見た目を当てる）
// 見た目（appearance）: surface（既定）は入力欄のグレーの面・部品の角・上の帯（軸 64 の現行版）。dark は濃紺の地（64 の D）
// 色分けの色は GitHub のテーマ（軸 68 の D）、行番号は地と強調行・差分の面の上で 4.5:1（69 の B）。値は tokens の --palette-code-*
// 題の帯とコピーのボタン（67 の A）: 帯は 52px で、下の線はその外に引く（ボタンが線に重ならない）
//   ボタンは指で押せる 44px（原則11）で、帯の上・下・右に 4px 空ける。帯の中では塗らない
//   題がないときは右上から 4px に浮かせ、下のコードを面の色で隠し、白いボタンと同じ細い輪郭を付ける
//   写せなかったとき（軸 176）は、印を変えずに淡い赤の吹き出しで知らせる（CopyButton の吹き出しと同じ面）
const codeBlock = tv({
  slots: {
    root: [
      '[--cb-head-h:calc(var(--spacing-control)+var(--spacing)*2)]',
      'group/code-block relative flex min-w-0 flex-col',
      // 横のスクロールバーが場所を取るとき（data-scrollbar）は、下の角を丸めない。丸めると、スクロールバーの端が角で切られてなじまない
      //   重ねて出るスクロールバー（macOS の既定など）は場所を取らないので、角は丸いまま
      'data-scrollbar:rounded-b-none',
      ...codeBlockStyles.surface,
    ],
    head: [
      'flex items-center px-4',
      'min-h-[calc(var(--cb-head-h)+var(--border-width-thin))] pb-(--border-width-thin)',
      // コピーのボタンの分だけ右を空ける
      'pr-[calc(var(--spacing-control)+var(--spacing)*3)]',
      'bg-(color:--cb-head-bg) [box-shadow:inset_0_calc(var(--border-width-thin)*-1)_0_0_var(--cb-line)]',
    ],
    title:
      'min-w-0 truncate font-mono text-(length:--text-body-sm-fine) leading-(--leading-label) text-(color:--cb-muted)',
    body: ['min-w-0', ...codeBlockStyles.body],
    copy: [
      'absolute z-1 inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap',
      // 帯の中: 上と右に (帯の高さ − ボタン) / 2 = 4px。題がないとき: 外枠の角から 4px
      'top-(--cb-copy-offset) right-(--cb-copy-offset)',
      '[--cb-copy-offset:var(--spacing)] group-data-titled/code-block:[--cb-copy-offset:calc((var(--cb-head-h)-var(--spacing-control))/2)]',
      'h-(--spacing-control) min-w-(--spacing-control) px-[calc((var(--spacing-control)-var(--spacing-icon))/2)]',
      'rounded-control text-(color:--cb-muted)',
      // 浮かせたときは、下のコードを面の色で隠し、細い輪郭を付ける。帯の中では塗らず、輪郭もない
      'bg-(color:--cb-bg) group-data-titled/code-block:bg-transparent',
      '[box-shadow:inset_0_0_0_var(--border-width-thin)_var(--cb-copy-line)] group-data-titled/code-block:[box-shadow:none]',
      // 平らな要素（原則3）: 文字の色を淡く重ね、押下で沈む。地の塗りは残すので、背景の画像として重ねる
      'hover:[background-image:linear-gradient(var(--color-flat-hover),var(--color-flat-hover))]',
      'active:translate-y-(--flat-press-depth) active:[background-image:linear-gradient(var(--color-flat-press),var(--color-flat-press))]',
      '[transition:background-color_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)] motion-reduce:[transition:none]',
      ...focusRing,
      // 外枠が overflow: clip なので、フォーカスの線を内側に引く
      'focus-visible:[outline-offset:calc(var(--focus-ring-width)*-1)]',
    ],
    copied: 'text-body-sm font-bold',
  },
  variants: {
    appearance: {
      surface: {
        root: codeBlockStyles.surfaceColors,
      },
      dark: {
        root: [
          '[--cb-bg:var(--color-codeblock-dark-bg)] [--cb-fg:var(--color-codeblock-dark-fg)] [--cb-muted:var(--color-codeblock-dark-muted)]',
          '[--cb-head-bg:var(--color-codeblock-dark-head-bg)] [--cb-line:var(--color-codeblock-dark-line)] [--cb-number:var(--color-codeblock-dark-number)]',
          '[--cb-copy-line:var(--color-codeblock-dark-copy-line)]',
          '[--cb-deleted:var(--color-codeblock-dark-deleted)] [--cb-highlight:var(--color-codeblock-dark-highlight)] [--cb-inserted:var(--color-codeblock-dark-inserted)]',
          '[--cb-highlight-bg:color-mix(in_oklab,var(--cb-bg),var(--cb-highlight)_18%)]',
          '[--cb-deleted-bg:color-mix(in_oklab,var(--cb-bg),var(--cb-deleted)_14%)] [--cb-inserted-bg:color-mix(in_oklab,var(--cb-bg),var(--cb-inserted)_12%)]',
          '[--shiki-token-function:var(--palette-code-dark-function)] [--shiki-token-keyword:var(--palette-code-dark-keyword)]',
          '[--shiki-token-constant:var(--palette-code-dark-constant)] [--shiki-token-string:var(--palette-code-dark-string)]',
          '[--shiki-token-comment:var(--palette-code-dark-comment)] [--shiki-token-parameter:var(--palette-code-dark-parameter)]',
          '[--shiki-token-punctuation:var(--palette-code-dark-punctuation)]',
          // 濃い地の上では、フォーカスの線を地の上で見える色にする
          '[--color-focus-ring:var(--cb-fg)]',
        ],
      },
    },
    lineNumbers: {
      // 行番号: 行の左に疑似要素で描く（コピーの文字列に入らない）。区切りの細い線は右端に内側の影で引く
      //   桁の幅 2ch、コードとの間 16px（線はその中央）
      true: {
        body: [
          '[--cb-gutter:calc(2ch+var(--spacing)*4)]',
          '[&_pre_.line]:before:absolute [&_pre_.line]:before:inset-y-0 [&_pre_.line]:before:left-0 [&_pre_.line]:before:select-none',
          '[&_pre_.line]:before:[width:calc(var(--spacing)*4+2ch+var(--spacing)*2)] [&_pre_.line]:before:pr-2',
          '[&_pre_.line]:before:text-end [&_pre_.line]:before:tabular-nums [&_pre_.line]:before:content-[counter(codeblock-line)]',
          '[&_pre_.line]:before:text-(color:--cb-number)',
          '[&_pre_.line]:before:[box-shadow:inset_calc(var(--border-width-thin)*-1)_0_0_0_var(--cb-line)]',
        ],
      },
      false: {},
    },
  },
  defaultVariants: { appearance: 'surface', lineNumbers: false },
});

export interface CodeBlockProps extends Omit<ComponentProps<'figure'>, 'title' | 'children'> {
  /**
   * 色分けしたあとの HTML（`<pre class="shiki">…</pre>`）。ブログのビルド時に Shiki の codeToHtml と
   * @shikijs/transformers（強調行・差分・フォーカス・語の強調）で作ったものを渡します。
   * そのまま innerHTML に入れるので、ビルド時に自分で作った HTML だけを渡してください。
   * 利用者が書いた文や外から取ってきた文を、エスケープせずに渡してはいけません（スクリプトが動きます）。
   * children と同時には使いません
   */
  html?: string;
  /**
   * html の代わりに、pre の中身（`<code>` の要素）を React の要素で渡します。MDX の pre を差し替えるときに使います
   */
  children?: ReactNode;
  /**
   * 見た目。surface は入力欄と同じグレーの面、dark は濃紺の地です。色分けの色も地に合わせて変わります
   * @default 'surface'
   */
  appearance?: 'surface' | 'dark';
  /** ファイル名などの題。コードの上の帯に出し、コピーのボタンを帯の右に置きます */
  title?: ReactNode;
  /**
   * 行番号を出します。数を渡すと、その番号から数えます
   * @default false
   */
  lineNumbers?: boolean | number;
  /**
   * コピーのボタンを出します
   * @default true
   */
  copyButton?: boolean;
  /**
   * コピーする文字列。渡さないときは、表示している行の文字を改行でつなぎます（差分で消した行は除きます）
   */
  copyText?: string;
  /**
   * コピーのボタンの読み上げの名前。題があるときは、この名前のあとに題を続けて読みます
   * @default 'コードをコピー'
   */
  copyLabel?: string;
  /**
   * コピーしたあとに、ボタンに出して読み上げる文
   * @default 'コピーしました'
   */
  copiedLabel?: string;
  /**
   * 写せなかったとき（権限がない・安全でない接続）に、吹き出しに出して読み上げる文
   * @default 'コピーできませんでした'
   */
  copyErrorLabel?: string;
}

/**
 * 複数行のコード。色分けはビルド時に済ませ、色分けしたあとの HTML を渡します。
 * 横にはみ出す行は、コードの部分だけが横にスクロールします。スクロールできるときだけ、キーボードで移れます
 */
export function CodeBlock({
  html,
  children,
  appearance,
  title,
  lineNumbers = false,
  copyButton = true,
  copyText,
  copyLabel = 'コードをコピー',
  copiedLabel = 'コピーしました',
  copyErrorLabel = 'コピーできませんでした',
  className,
  style,
  ...props
}: CodeBlockProps) {
  const styles = codeBlock({ appearance, lineNumbers: lineNumbers !== false });
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const copyId = useId();
  const { copied, failed, copy } = useCopy(2000);

  // スクロールできる pre だけを Tab で止まるようにする（Shiki は pre にいつも tabindex="0" を付ける）
  // 横のスクロールバーが場所を取っているか（pre の高さと中身の高さの差）を、外枠の data-scrollbar に書く
  // 中身（html・children）が変わると pre が入れ替わるので、描くたびに探し直す
  useEffect(() => {
    const pre = bodyRef.current?.querySelector('pre');
    if (!pre) return undefined;
    const measure = () => {
      if (pre.scrollWidth > pre.clientWidth + 1) pre.setAttribute('tabindex', '0');
      else pre.removeAttribute('tabindex');
      const root = pre.closest('[data-slot="code-block"]');
      if (pre.offsetHeight - pre.clientHeight > 0) root?.setAttribute('data-scrollbar', '');
      else root?.removeAttribute('data-scrollbar');
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(pre);
    return () => observer.disconnect();
  });

  const start = typeof lineNumbers === 'number' ? lineNumbers - 1 : undefined;
  const hasTitle = title != null && title !== false;

  return (
    <figure
      className={styles.root({ className })}
      data-slot="code-block"
      data-appearance={appearance ?? 'surface'}
      data-titled={hasTitle ? '' : undefined}
      data-line-numbers={lineNumbers !== false ? '' : undefined}
      style={start == null ? style : { ...style, ['--cb-start' as string]: start }}
      {...props}
    >
      {hasTitle ? (
        <figcaption className={styles.head()}>
          <span id={titleId} className={styles.title()}>
            {title}
          </span>
        </figcaption>
      ) : null}
      {html != null ? (
        <div
          ref={bodyRef}
          className={styles.body()}
          // ビルド時に作った HTML だけを受け取る（JSDoc の html を参照）
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div ref={bodyRef} className={styles.body()}>
          <pre>{children}</pre>
        </div>
      )}
      {copyButton ? (
        // 写せなかったとき（軸 176）は、淡い赤の吹き出しで知らせる。濃い地の上では、ボタンの中では伝わらないため
        <CopyErrorTooltip open={failed} label={copyErrorLabel}>
          <button
            type="button"
            id={copyId}
            className={styles.copy()}
            data-copied={copied ? '' : undefined}
            aria-label={copyLabel}
            aria-labelledby={hasTitle ? `${copyId} ${titleId}` : undefined}
            onClick={() => {
              const text = copyText ?? (bodyRef.current ? codeTextOf(bodyRef.current) : '');
              void copy(text);
            }}
          >
            {copied ? (
              <span aria-hidden="true" className={styles.copied()}>
                {copiedLabel}
              </span>
            ) : null}
            {/* アイコン単体なので Bold（design/adr/0018） */}
            <CopyGlyph copied={copied} standalone />
          </button>
        </CopyErrorTooltip>
      ) : null}
      {/* コピーの結果を読み上げる。箱は先に置いておき、中身だけを入れる */}
      <CopiedStatus
        copied={copied}
        label={copiedLabel}
        failed={failed}
        errorLabel={copyErrorLabel}
      />
    </figure>
  );
}
