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
import { Tab, TabList, TabPanel, Tabs } from '../tabs/Tabs';

// 同じことを別のやり方で書いたコードを、タブで切り替える（pnpm / npm / yarn、TypeScript / JavaScript など）
//   外枠・面・角・色は CodeBlock と同じ（src/internal/reading/code-block.ts）。ページと同じレイヤーなので影はない（原則1）
//   題の帯の場所にタブを並べる。タブそのものは Tabs 部品（indicator="line"）。印・hover・押下・フォーカスの線は Tabs と同じ
//     色だけをコードの面の色に差し替える（濃い地でも読めるように、--cb-fg・--cb-muted・--cb-line を Tabs の変数に入れる）
//     文字は等幅の 14px（コードと同じ）。左右の余白は、帯の内側の余白と足してコードの左の余白（16px）にそろえる
//   中の CodeBlock は題とコピーのボタンを出さず、帯は外の枠が 1 つだけ持つ
//     中の CodeBlock の面は外枠と同じ色なので、重ねても境目は出ない
//   コピーのボタンは、いま開いているタブのコードを写す（CodeBlock の題があるときと同じ場所・同じ見た目）
const codeGroup = tv({
  slots: {
    root: [
      'group/code-group relative flex min-w-0 flex-col',
      // 帯の高さ（CodeBlock の題の帯と同じ）
      '[--cb-head-h:calc(var(--spacing-control)+var(--spacing)*2)]',
      ...codeBlockStyles.surface,
      // Tabs の色を、コードの面の色に差し替える
      //   選んでいないタブの文字・並びの下の線は、役割のトークンをこの枠の中だけで置き換える
      '[--color-fg-muted:var(--cb-muted)] [--color-line:var(--cb-line)]',
      // 帯とコードの境目の線。印（indicator）がどれでも同じ場所に引く
      //   線の下端を帯の高さにそろえる。選んだタブの下の線（Tabs の印）は、この線に重なって同じ高さに出る
      "before:pointer-events-none before:absolute before:inset-x-0 before:top-[calc(var(--cb-head-h)-var(--border-width-thin))] before:z-1 before:h-(--border-width-thin) before:bg-(color:--cb-line) before:content-['']",
    ],
    // 帯: CodeBlock の題の帯と同じ高さ・同じ下の線（Tabs の並びの線）
    //   タブの並びは、枠の外へ 4px はみ出して同じだけ内側に余白を取る作り（フォーカスの線が切れないように）。
    //   そのため見えている帯の高さは「タブの高さ＋上下の余白」になる
    list: [
      'bg-(color:--cb-head-bg)',
      // 帯の高さを CodeBlock の題の帯にそろえる。タブの下端は、帯とコードの境目の線に接する
      'pt-[calc(var(--cb-head-h)-var(--spacing-control))]',
      // 並びは枠の外へ 4px はみ出す作りだが、左だけは戻す（タブの塗りが枠の角で切られないように）
      //   タブの左右の余白（--code-group-tab-px）が、コードの左の余白（16px）と同じ位置に文字を置く
      'ms-0',
      // コピーのボタンの分だけ、スクロールする範囲を狭める（タブがボタンの下に入らない）
      //   帯とコードの境目の線は外枠が引くので、狭めても線は幅いっぱいのまま
      'pe-[calc(var(--spacing-control)+var(--spacing)*2)]',
    ],
    tab: [
      'font-mono text-(length:--text-body-sm-fine) leading-(--leading-label)',
      'px-(--code-group-tab-px)',
      // 選んだタブの文字は、コードの面の文字の色（Tabs の印ごとの既定より内側で置き換える）
      '[--tabs-tab-color:var(--cb-fg)]',
    ],
    panel: 'mt-0 min-w-0',
    copy: [
      'absolute z-1 inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap',
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
    appearance: {
      surface: { root: codeBlockStyles.surfaceColors },
      dark: {
        root: [
          '[--cb-bg:var(--color-codeblock-dark-bg)] [--cb-fg:var(--color-codeblock-dark-fg)] [--cb-muted:var(--color-codeblock-dark-muted)]',
          '[--cb-head-bg:var(--color-codeblock-dark-head-bg)] [--cb-line:var(--color-codeblock-dark-line)]',
          '[--cb-copy-line:var(--color-codeblock-dark-copy-line)]',
          // 選んだタブの印と、フォーカスの線は、濃い地の上で見える色にする
          '[--tabs-own:var(--color-codeblock-dark-highlight)]',
          '[--color-focus-ring:var(--cb-fg)] [--color-own-focus:var(--color-codeblock-dark-highlight)]',
        ],
      },
    },
  },
  defaultVariants: { appearance: 'surface' },
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
  const s = codeGroup({ appearance });
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
    <div
      ref={frameRef}
      data-slot="code-group"
      data-appearance={appearance}
      className={s.root({ className })}
      {...props}
    >
      <Tabs
        // 印は Tabs の underline（下の線だけ）。帯とコードの境目の線は、外枠がいつも引くのでこちらは出さない
        //   text のときは印を出さない
        indicator={indicator === 'line' ? 'underline' : 'text'}
        color="primary"
        value={current}
        onValueChange={(next) => {
          const index = typeof next === 'number' ? next : 0;
          if (value === undefined) setUncontrolled(index);
          onValueChange?.(index);
        }}
        className="min-w-0"
      >
        <TabList aria-label={label} className={s.list()}>
          {blocks.map((block, index) => (
            <Tab key={index} value={index} data-slot="code-group-tab" className={s.tab()}>
              {block.props.title ?? `コード ${index + 1}`}
            </Tab>
          ))}
        </TabList>
        {blocks.map((block, index) => (
          <TabPanel key={index} value={index} className={s.panel()}>
            {cloneElement(block, { title: false, copyButton: false, appearance })}
          </TabPanel>
        ))}
      </Tabs>
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
    </div>
  );
}
