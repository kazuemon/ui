import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import {
  Children,
  cloneElement,
  type ComponentProps,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useRef,
  useState,
} from 'react';

import { CopiedStatus, CopyGlyph } from '../../internal/copy/copy-parts';
import { useCopy } from '../../internal/copy/use-copy';
import { focusRing } from '../../internal/focus-styles';
import { codeBlockStyles } from '../../internal/reading/code-block';
import { codeTextOf } from '../../internal/reading/code-text';
import { scrollAreaStyles } from '../../internal/scroll-area-styles';
import { tv } from '../../internal/tv';
import { useInlineCues } from '../../internal/use-inline-cues';
import type { CodeBlockProps } from '../code-block/CodeBlock';

// 同じことを別のやり方で書いたコードを、タブで切り替える（pnpm / npm / yarn、TypeScript / JavaScript など）
//   外枠・面・角・色は CodeBlock と同じ（src/internal/reading/code-block.ts）。ページと同じレイヤーなので影はない（原則1）
//   題の帯の場所にタブを並べる。中の CodeBlock は題とコピーのボタンを出さず、帯は外の枠が 1 つだけ持つ
//     中の CodeBlock の面は外枠と同じ色なので、重ねても境目は出ない
//   見た目の決まりは Tabs 部品（indicator="line"）と同じ考え方。ただし帯の中に置くための寸法と、コードの面の色が違うので、ここに書く
//     タブは平らな押すもの（原則3）。hover は文字の色を淡く敷き（形は pill）、押すと沈む。フォーカスの線はタブの内側に引く（ADR-0148）
//     選んだタブは文字を濃く太くし、帯とコードの境目の線と同じ 1 本の上に、部品の色の線を重ねる（軸 146）
//       太字にしても幅が動かないよう、太字の写しで幅を取っておく。印は 1 つの要素（Base UI の Tabs.Indicator）で描き、選んだタブの位置へ滑って移る
//   タブが入り切らないときは、帯だけが横にスクロールする。続きは端のぼかしで見せ、つまみは載せたときに出す（ScrollArea と同じ・原則1）
//   キーボードと読み上げ（tablist・tab・tabpanel、←→ で移る）は Base UI の Tabs に任せる
//   コピーのボタンは、いま開いているタブのコードを写す（CodeBlock の題があるときと同じ場所・同じ見た目）
const scroll = scrollAreaStyles({ scrollbar: 'scroll' });

const codeGroup = tv({
  slots: {
    root: [
      '[--cb-head-h:calc(var(--spacing-control)+var(--spacing)*2)]',
      'group/code-group relative flex min-w-0 flex-col',
      ...codeBlockStyles.surface,
    ],
    // 帯: CodeBlock の題の帯と同じ高さ。下の線は帯とコードの境目に 1 本だけ引き、選んだタブの印がその上に重なる
    //   続きのぼかしが帯からはみ出さないよう、帯の中で切る（タブのフォーカスの線は内側に引くので切れない）
    head: [
      'relative h-(--cb-head-h) overflow-clip bg-(color:--cb-head-bg)',
      "before:pointer-events-none before:absolute before:inset-x-0 before:bottom-0 before:h-(--code-group-bar) before:bg-(color:--cb-line) before:content-['']",
    ],
    // スクロールする範囲は、コピーのボタンの手前で終わらせる（タブがボタンの下に入らない）
    scroller: 'h-full pe-[calc(var(--spacing-control)+var(--spacing)*2)]',
    viewport: 'flex items-end',
    list: 'relative flex w-max items-center gap-(--code-group-tab-gap) px-(--code-group-list-px)',
    tab: [
      'relative z-1 inline-flex shrink-0 cursor-pointer items-center whitespace-nowrap select-none',
      'my-(--code-group-tab-inset) h-(--spacing-control) rounded-(--code-group-tab-radius) px-(--code-group-tab-px)',
      'font-mono text-(length:--text-body-sm-fine) leading-(--leading-label) text-(color:--cb-muted)',
      // 選んだタブ: 文字を濃く太く（印は下の線）
      'data-active:cursor-default data-active:text-(color:--cb-fg)',
      'data-active:[&_[data-slot=code-group-tab-label]]:font-bold',
      // hover と押下は、選んでいないタブだけ。塗りは --flat-bg（theme.css で登録）に置く（ADR-0112）
      'bg-(color:--flat-bg) [--flat-bg:transparent]',
      'not-data-active:hover:[--flat-bg:color-mix(in_oklab,var(--cb-fg)_var(--flat-hover-mix),transparent)]',
      'not-data-active:active:translate-y-(--flat-press-depth)',
      'not-data-active:active:[--flat-bg:color-mix(in_oklab,var(--cb-fg)_var(--flat-press-mix),transparent)]',
      '[transition:--flat-bg_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
      // フォーカスの線はタブの内側に引く（外に離すと、帯の下の線を越える）
      '[--focus-ring-offset:var(--code-group-tab-focus-offset)]',
      ...focusRing,
    ],
    // 見える文字と、幅を取っておく太字の写し（同じ升に重ねる）
    tabInner: 'inline-grid',
    tabLabel: 'col-start-1 row-start-1',
    tabSizer: 'invisible col-start-1 row-start-1 font-bold',
    // 選んだタブの印。位置は Base UI が書く --active-tab-*（並びの左上から）。帯とコードの境目の線に重ねる
    indicator: [
      'pointer-events-none absolute bottom-0 z-0 h-(--code-group-bar) bg-(color:--code-group-bar-color)',
      'right-(--active-tab-right) left-(--active-tab-left)',
      '[transition:left_var(--code-group-bar-duration)_var(--code-group-bar-ease),right_var(--code-group-bar-duration)_var(--code-group-bar-ease)]',
      'motion-reduce:[transition:none]',
    ],
    panel: 'min-w-0',
    copy: [
      'absolute z-2 inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap',
      // 帯の中: 上と右に (帯の高さ − ボタン) / 2 = 4px（CodeBlock の題があるときと同じ）
      'top-[calc((var(--cb-head-h)-var(--spacing-control))/2)] right-(--code-group-copy-inset)',
      'h-(--spacing-control) min-w-(--spacing-control) px-[calc((var(--spacing-control)-var(--spacing-icon))/2)]',
      'rounded-control text-(color:--cb-muted)',
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
    // 選んでいるタブの印（軸 146）。line は下の線、text は文字の濃さと太さだけ
    indicatorKind: {
      line: {},
      text: { indicator: 'hidden' },
    },
    appearance: {
      surface: { root: codeBlockStyles.surfaceColors },
      dark: {
        root: [
          '[--cb-bg:var(--color-codeblock-dark-bg)] [--cb-fg:var(--color-codeblock-dark-fg)] [--cb-muted:var(--color-codeblock-dark-muted)]',
          '[--cb-head-bg:var(--color-codeblock-dark-head-bg)] [--cb-line:var(--color-codeblock-dark-line)]',
          '[--cb-copy-line:var(--color-codeblock-dark-copy-line)]',
          // 選んだタブの印とフォーカスの線は、濃い地の上で見える色にする
          '[--code-group-bar-color:var(--color-codeblock-dark-highlight)]',
          '[--color-focus-ring:var(--cb-fg)]',
        ],
      },
    },
  },
  defaultVariants: { appearance: 'surface', indicatorKind: 'line' },
});

/** 選んでいるタブの印（軸 146）。line は下の線、text は文字の濃さと太さだけ */
export type CodeGroupIndicator = 'line' | 'text';

type CodeChild = ReactElement<CodeBlockProps>;

export interface CodeGroupProps extends Omit<ComponentProps<'div'>, 'children' | 'onChange'> {
  /**
   * 切り替えるコード。`CodeBlock` を並べます。タブの名前は、それぞれの `title`（言語名やファイル名）です
   */
  children?: ReactNode;
  /**
   * 見た目。surface は入力欄と同じグレーの面、dark は濃紺の地です。中の `CodeBlock` にも渡ります
   * @default 'surface'
   */
  appearance?: 'surface' | 'dark';
  /**
   * 選んでいるタブの印。line は文字を濃く太くして下に部品の色の線を引き、text は文字の濃さと太さだけにします
   * @default 'line'
   */
  indicator?: CodeGroupIndicator;
  /** はじめに開いておくタブ（0 から数えた番号）。 @default 0 */
  defaultValue?: number;
  /** 開いているタブ（0 から数えた番号）。自分で持つときに渡します */
  value?: number;
  /** タブが変わったときに呼ばれます */
  onValueChange?: (value: number) => void;
  /**
   * コピーのボタンを出します
   * @default true
   */
  copyButton?: boolean;
  /**
   * コピーのボタンの読み上げの名前。開いているタブの名前を、このあとに続けて読みます
   * @default 'コードをコピー'
   */
  copyLabel?: string;
  /**
   * コピーしたあとに、ボタンに出して読み上げる文
   * @default 'コピーしました'
   */
  copiedLabel?: string;
  /** タブの並び（tablist）の読み上げの名前 @default 'コードの書き方' */
  label?: string;
}

/**
 * 同じことを別のやり方で書いたコードを、タブで切り替えて見せます。`CodeBlock` を並べて入れ、タブの名前はそれぞれの `title` です
 */
export function CodeGroup({
  children,
  appearance = 'surface',
  indicator = 'line',
  defaultValue = 0,
  value,
  onValueChange,
  copyButton = true,
  copyLabel = 'コードをコピー',
  copiedLabel = 'コピーしました',
  label = 'コードの書き方',
  className,
  ...props
}: CodeGroupProps) {
  const s = codeGroup({ appearance, indicatorKind: indicator });
  const frameRef = useRef<HTMLDivElement>(null);
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const current = value ?? uncontrolled;
  const { copied, copy } = useCopy(2000);
  const inlineCues = useInlineCues();

  const blocks = Children.toArray(children).filter((child): child is CodeChild =>
    isValidElement<CodeBlockProps>(child)
  );
  const currentBlock = blocks[current];
  const currentTitle = currentBlock?.props.title;

  return (
    <BaseTabs.Root
      value={current}
      onValueChange={(next) => {
        const index = typeof next === 'number' ? next : 0;
        if (value === undefined) setUncontrolled(index);
        onValueChange?.(index);
      }}
      data-slot="code-group"
      data-appearance={appearance}
      render={<div ref={frameRef} />}
      className={s.root({ className })}
      {...props}
    >
      <div className={s.head()}>
        <BaseScrollArea.Root
          data-slot="code-group-scroller"
          className={scroll.root({ className: s.scroller() })}
        >
          {/* 枠には Tab で止まらない（スクロールはタブへのフォーカスで起こる） */}
          <BaseScrollArea.Viewport
            ref={inlineCues}
            tabIndex={-1}
            className={scroll.viewport({ className: s.viewport() })}
          >
            <BaseScrollArea.Content>
              <BaseTabs.List aria-label={label} data-slot="code-group-list" className={s.list()}>
                <BaseTabs.Indicator data-slot="code-group-indicator" className={s.indicator()} />
                {blocks.map((block, index) => {
                  const title = block.props.title ?? `コード ${index + 1}`;
                  return (
                    <BaseTabs.Tab
                      key={index}
                      value={index}
                      data-slot="code-group-tab"
                      className={s.tab()}
                    >
                      <span className={s.tabInner()}>
                        {/* 太字にしても幅が動かないよう、太字の写しで幅を取っておく */}
                        <span aria-hidden="true" className={s.tabSizer()}>
                          {title}
                        </span>
                        <span data-slot="code-group-tab-label" className={s.tabLabel()}>
                          {title}
                        </span>
                      </span>
                    </BaseTabs.Tab>
                  );
                })}
              </BaseTabs.List>
            </BaseScrollArea.Content>
          </BaseScrollArea.Viewport>
          <div className={scroll.edges()}>
            <div
              aria-hidden
              className={scroll.edgeX({ className: 'left-0 bg-linear-to-r' })}
              style={{ opacity: 'var(--cue-x-start)' }}
            />
            <div
              aria-hidden
              className={scroll.edgeX({ className: 'right-0 bg-linear-to-l' })}
              style={{ opacity: 'var(--cue-x-end)' }}
            />
          </div>
          <BaseScrollArea.Scrollbar orientation="horizontal" className={scroll.scrollbar()}>
            <BaseScrollArea.Thumb className={scroll.thumb()} />
          </BaseScrollArea.Scrollbar>
        </BaseScrollArea.Root>
      </div>
      {blocks.map((block, index) => (
        <BaseTabs.Panel key={index} value={index} className={s.panel()}>
          {cloneElement(block, { title: false, copyButton: false, appearance })}
        </BaseTabs.Panel>
      ))}
      {copyButton ? (
        <button
          type="button"
          data-slot="code-group-copy"
          className={s.copy()}
          data-copied={copied ? '' : undefined}
          // 名前は「コードをコピー ＋ 開いているタブの名前」。どのコードを写すのかが分かる
          aria-label={typeof currentTitle === 'string' ? `${copyLabel} ${currentTitle}` : copyLabel}
          onClick={() => {
            const text =
              currentBlock?.props.copyText ??
              (frameRef.current ? codeTextOf(frameRef.current) : '');
            void copy(text);
          }}
        >
          {copied ? (
            <span aria-hidden="true" className={s.copied()}>
              {copiedLabel}
            </span>
          ) : null}
          <CopyGlyph copied={copied} standalone />
        </button>
      ) : null}
      {/* コピーしたことを読み上げる。箱は先に置いておき、中身だけを入れる */}
      <CopiedStatus copied={copied} label={copiedLabel} />
    </BaseTabs.Root>
  );
}
