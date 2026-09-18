import { Tabs } from '@base-ui/react/tabs';
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
import { tv } from '../../internal/tv';
import type { CodeBlockProps } from '../code-block/CodeBlock';

// 同じことを別のやり方で書いたコードを、タブで切り替える（pnpm / npm / yarn、TypeScript / JavaScript など）
//   外枠・面・角・色は CodeBlock と同じ（src/internal/reading/code-block.ts）。ページと同じレイヤーなので影はない（原則1）
//   題の帯の場所にタブを並べる。中の CodeBlock は題とコピーのボタンを出さず、帯は外の枠が 1 つだけ持つ
//     中の CodeBlock の面は外枠と同じ色なので、重ねても境目は出ない
//   タブは平らな押すもの（原則3）。hover で文字の色を淡く敷き、押すと沈む。選んだタブは文字を濃く太くし、下に部品の色の線を引く（軸 146）
//     塗りは --flat-bg（theme.css で登録）に置き、background-color ではなく変数を動かす（ADR-0112）
//   キーボードと読み上げ（tablist・tab・tabpanel、←→ で移る）は Base UI の Tabs に任せる
//   コピーのボタンは、いま開いているタブのコードを写す（CodeBlock の題があるときと同じ場所・同じ見た目）
const codeGroup = tv({
  slots: {
    root: ['group/code-group relative flex min-w-0 flex-col', ...codeBlockStyles.surface],
    // 帯: CodeBlock の題の帯と同じ高さ・同じ下の線。タブが入りきらないときは帯だけが横にスクロールする
    list: [
      '[--cb-head-h:calc(var(--spacing-control)+var(--spacing)*2)]',
      'flex min-w-0 items-stretch gap-(--code-group-tab-gap) overflow-x-auto px-(--code-group-list-px)',
      // 下の余白は線の太さの分。選んだタブの下の線を、帯とコードの境界線に重ねて引くための場所
      'min-h-[calc(var(--cb-head-h)+var(--code-group-bar))] pb-(--code-group-bar)',
      // コピーのボタンの分だけ右を空ける
      'pr-[calc(var(--spacing-control)+var(--spacing)*3)]',
      'bg-(color:--cb-head-bg) [box-shadow:inset_0_calc(var(--border-width-thin)*-1)_0_0_var(--cb-line)]',
      '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    ],
    tab: [
      'relative inline-flex shrink-0 cursor-pointer items-center whitespace-nowrap',
      'my-(--code-group-tab-inset) rounded-(--code-group-tab-radius) px-(--code-group-tab-px)',
      'font-mono text-(length:--text-body-sm-fine) leading-(--leading-label) text-(color:--cb-muted)',
      // 選んだタブ: 文字を濃く太く（どの印でも）。印は下の線（軸 146）
      'aria-selected:text-(color:--cb-fg) aria-selected:[&_[data-slot=code-group-tab-label]]:font-bold',
      'bg-(color:--flat-bg) [--flat-bg:var(--code-group-tab-rest)]',
      'aria-selected:[--flat-bg:var(--code-group-tab-selected)]',
      'hover:[--flat-bg:color-mix(in_oklab,var(--cb-fg)_var(--flat-hover-mix),var(--code-group-tab-rest))]',
      'aria-selected:hover:[--flat-bg:color-mix(in_oklab,var(--cb-fg)_var(--flat-hover-mix),var(--code-group-tab-selected))]',
      'active:translate-y-(--flat-press-depth)',
      'active:[--flat-bg:color-mix(in_oklab,var(--cb-fg)_var(--flat-press-mix),var(--code-group-tab-rest))]',
      '[transition:--flat-bg_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)]',
      'motion-reduce:[transition:none]',
      // 選んだタブの下の線。帯とコードの境界線に重ねる
      "aria-selected:after:pointer-events-none aria-selected:after:absolute aria-selected:after:inset-x-(--code-group-bar-inset) aria-selected:after:bottom-(--code-group-bar-bottom) aria-selected:after:h-(--code-group-bar) aria-selected:after:rounded-pill aria-selected:after:bg-(color:--code-group-bar-color) aria-selected:after:content-['']",
      ...focusRing,
      // 線はタブの内側に引く（外に離すと、帯の下の線を越えてしまう）。Tabs 部品のタブと同じ位置
      'focus-visible:[outline-offset:var(--code-group-tab-focus-offset)]',
    ],
    // 太字にしても幅が動かないよう、太字の写しで幅を取っておく
    label: 'col-start-1 row-start-1',
    labelSizer: 'invisible col-start-1 row-start-1 font-bold',
    labelBox: 'grid place-items-center',
    panel: 'min-w-0',
    copy: [
      'absolute z-1 inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap',
      // 帯の中: 上と右に (帯の高さ − ボタン) / 2 = 4px（CodeBlock の題があるときと同じ）
      'top-[calc((var(--spacing-control)+var(--spacing)*2-var(--spacing-control))/2)] right-1',
      'h-(--spacing-control) min-w-(--spacing-control) px-[calc((var(--spacing-control)-var(--spacing-icon))/2)]',
      'rounded-control text-(color:--cb-muted)',
      'hover:[background-image:linear-gradient(var(--color-flat-hover),var(--color-flat-hover))]',
      'active:translate-y-(--flat-press-depth) active:[background-image:linear-gradient(var(--color-flat-press),var(--color-flat-press))]',
      '[transition:background-color_var(--duration-press)_var(--ease-press),translate_var(--duration-press)_var(--ease-press),outline-color_var(--focus-ring-duration)_var(--ease-press),outline-offset_var(--focus-ring-duration)_var(--ease-press)] motion-reduce:[transition:none]',
      ...focusRing,
      'focus-visible:[outline-offset:calc(var(--focus-ring-width)*-1)]',
    ],
    copied: 'text-body-sm font-bold',
  },
  variants: {
    // 選んでいるタブの印（軸 146）。line は下の線、text は文字の濃さと太さだけ
    indicator: {
      line: {},
      text: { tab: '[--code-group-bar:0px]' },
    },
    appearance: {
      surface: { root: codeBlockStyles.surfaceColors },
      dark: {
        root: [
          '[--cb-bg:var(--color-codeblock-dark-bg)] [--cb-fg:var(--color-codeblock-dark-fg)] [--cb-muted:var(--color-codeblock-dark-muted)]',
          '[--cb-head-bg:var(--color-codeblock-dark-head-bg)] [--cb-line:var(--color-codeblock-dark-line)]',
          '[--cb-copy-line:var(--color-codeblock-dark-copy-line)]',
          '[--code-group-bar-color:var(--color-codeblock-dark-highlight)]',
          '[--color-focus-ring:var(--cb-fg)]',
        ],
      },
    },
  },
  defaultVariants: { appearance: 'surface', indicator: 'line' },
});

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
  const s = codeGroup({ appearance, indicator });
  const frameRef = useRef<HTMLDivElement>(null);
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const current = value ?? uncontrolled;
  const { copied, copy } = useCopy(2000);

  const blocks = Children.toArray(children).filter((child): child is CodeChild =>
    isValidElement<CodeBlockProps>(child)
  );
  const currentBlock = blocks[current];
  const currentTitle = currentBlock?.props.title;

  return (
    <Tabs.Root
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
      <Tabs.List aria-label={label} className={s.list()}>
        {blocks.map((block, index) => (
          <Tabs.Tab key={index} value={index} data-slot="code-group-tab" className={s.tab()}>
            <span className={s.labelBox()}>
              {/* 太字にしても幅が動かないよう、太字の写しで幅を取っておく */}
              <span aria-hidden="true" className={s.labelSizer()}>
                {block.props.title ?? `コード ${index + 1}`}
              </span>
              <span data-slot="code-group-tab-label" className={s.label()}>
                {block.props.title ?? `コード ${index + 1}`}
              </span>
            </span>
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {blocks.map((block, index) => (
        <Tabs.Panel key={index} value={index} className={s.panel()}>
          {cloneElement(block, { title: false, copyButton: false, appearance })}
        </Tabs.Panel>
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
    </Tabs.Root>
  );
}
