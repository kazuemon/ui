import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { CodeBlock } from './CodeBlock';
import {
  diffHtml,
  focusHtml,
  indentedLongLineHtml,
  longLineHtml,
  shellHtml,
  shellOneLineHtml,
  typescriptHtml,
  wordHtml,
} from './fixtures';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';

const meta = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '複数行のコードです。色分けはブログのビルド時に Shiki で済ませ、色分けしたあとの HTML を `html` に渡します。',
          '',
          "- Shiki は `createCssVariablesTheme`（`variablePrefix: '--shiki-'`）で色分けします。色はこの部品が入れます。ブランドの色は混ざらず、GitHub のテーマに近い専用の色の組で、明るい地と濃い地の両方を持ちます。",
          '- 強調行・差分・フォーカス・語の強調は、`@shikijs/transformers` の `transformerNotationHighlight`・`transformerNotationDiff`・`transformerNotationFocus`・`transformerNotationWordHighlight` の書き方（`// [!code highlight]` など）で付けます。',
          '- `html` はそのまま HTML として入れます。ビルド時に自分で作った HTML だけを渡し、利用者が書いた文や外から取ってきた文をエスケープせずに渡さないでください。',
          '- MDX の `pre` を差し替えるときは、`html` の代わりに `children` に pre の中身を渡せます。Shiki で色分けしていない素の `<code>` でも、同じ余白で並びます。',
          '- `title` でファイル名などの題を上の帯に出し、コピーのボタンを帯の右に置きます。題がないときは、ボタンを右上に浮かせます。',
          '- `variant` は見た目です。`surface`（既定）はグレーの面、`dark` は濃紺の地です。',
          '- `lineNumbers` で行番号を出します。数を渡すと、その番号から数えます。',
          '- `language` で言語の名前（`ts` など）を上の帯に出します。題がなくても帯が出ます。既定は題の前に、淡い丸い面を敷いて出します。`languagePlacement="end"` で題の後ろ（帯の右）に、`hideLanguageBackground` で文字だけにできます。',
          '- `maxHeight` で高さに上限を付けます。超えた分は枠の中でスクロールし、続きがある端に影が出ます。',
          '- `wrap` で長い行を折り返します。続きの行は、その行の字下げ（行頭の空白）と同じだけ下げます。字下げのない行の続きは、行の頭にそろいます。',
          '- コピーのボタンは、表示している行の文字を写します（差分で消した行は写しません）。`copyText` で写す文字を決められます。押すと「コピーしました」に変わり、読み上げでも伝えます。',
          '- 写せなかったとき（権限がない・安全でない接続）は、ボタンの下に淡い赤の吹き出しで知らせます。文は `copyErrorText` で変えられます。',
          '- 文字はパソコンでもスマホでも 14px です。長い行は、コードの部分だけが横にスクロールします。',
        ].join('\n'),
      },
    },
  },
  args: {
    html: typescriptHtml,
    title: 'src/lib/posts.ts',
    variant: 'surface',
    lineNumbers: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['surface', 'dark'] },
    lineNumbers: { control: 'boolean' },
    wrap: { control: 'boolean' },
    language: { control: 'text' },
    languagePlacement: { control: 'inline-radio', options: ['start', 'end'] },
    hideLanguageBackground: { control: 'boolean' },
    maxHeight: { control: 'text' },
    title: { control: 'text' },
    html: { control: false },
  },
  render: (args) => (
    <div data-reading className="max-w-xl">
      <CodeBlock {...args} />
    </div>
  ),
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Variants: Story = {
  tags: ['visual'],
  name: '見た目と題',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="28rem">
      {(['surface', 'dark'] as const).map((variant) => (
        <Specimen key={variant} label={variant}>
          <div data-reading className="flex flex-col gap-4">
            <CodeBlock variant={variant} title="src/lib/posts.ts" html={typescriptHtml} />
            <CodeBlock variant={variant} html={shellHtml} />
            <CodeBlock variant={variant} html={shellOneLineHtml} />
          </div>
        </Specimen>
      ))}
    </Gallery>
  ),
};

// Shiki で色分けしていないコード（MDX の pre を差し替えたときなど）。行の .line がなくても、同じ余白になる
export const PlainCode: Story = {
  tags: ['visual'],
  name: '色分けなし',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="28rem">
      {(['surface', 'dark'] as const).map((variant) => (
        <Specimen key={variant} label={variant}>
          <div data-reading className="flex flex-col gap-4">
            <CodeBlock variant={variant}>
              <code>pnpm add @kazuemon/ui</code>
            </CodeBlock>
            <CodeBlock variant={variant} title="terminal">
              <code>{'pnpm add @kazuemon/ui\npnpm add -D shiki @shikijs/transformers'}</code>
            </CodeBlock>
          </div>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const LineDecorations: Story = {
  tags: ['visual'],
  name: '強調行・差分・フォーカス・行番号',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="28rem">
      {(['surface', 'dark'] as const).map((variant) => (
        <Specimen key={variant} label={variant}>
          <div data-reading className="flex flex-col gap-4">
            <CodeBlock variant={variant} title="astro.config.ts" html={diffHtml} lineNumbers />
            <CodeBlock variant={variant} title="code-block.css" html={focusHtml} />
            <CodeBlock variant={variant} title="src/pages/index.ts" html={wordHtml} />
          </div>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度とはみ出し',
  parameters: { controls: { disable: true } },
  render: () => (
    <DensityPair>
      <div data-reading className="flex w-[20rem] flex-col gap-4">
        <CodeBlock title="src/lib/posts.ts" html={typescriptHtml} />
        <CodeBlock html={shellHtml} />
        <CodeBlock html={shellOneLineHtml} />
      </div>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げとコピー',
  play: async ({ canvas, canvasElement }) => {
    // クリップボードは使えない環境があるので、書き込みを差し替えて、写した文字を確かめる
    const writeText = fn(async (_text: string) => {});
    const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    try {
      const button = canvas.getByRole('button', { name: 'コードをコピー src/lib/posts.ts' });
      const status = canvasElement.querySelector('[role="status"]');
      await expect(status).toHaveTextContent('');
      await userEvent.click(button);
      await waitFor(() => expect(status).toHaveTextContent('コピーしました'));
      await expect(writeText).toHaveBeenCalledTimes(1);
      const text = writeText.mock.calls[0]?.[0] ?? '';
      await expect(text.startsWith("import { createHighlighter } from 'shiki';")).toBe(true);
      // 横にはみ出すときは、スクロールの枠が Tab で止まる（pre は止まらない）
      await waitFor(() =>
        expect(canvasElement.querySelector('[data-slot="scroll-area-viewport"]')).toHaveAttribute(
          'tabindex',
          '0'
        )
      );
      await expect(canvasElement.querySelector('pre')).not.toHaveAttribute('tabindex');
    } finally {
      if (original) Object.defineProperty(navigator, 'clipboard', original);
      else Reflect.deleteProperty(navigator, 'clipboard');
    }
  },
};

export const CopyError: Story = {
  name: 'コピーできなかったとき',
  parameters: {
    docs: {
      description: {
        story:
          'クリップボードを使えなくして押しています。印は変わらず、淡い赤の吹き出しで知らせます。',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: fn(async (_text: string) => {
          throw new Error('denied');
        }),
      },
    });
    try {
      const button = canvas.getByRole('button', { name: 'コードをコピー src/lib/posts.ts' });
      await userEvent.click(button);
      // 吹き出しで知らせる。印（チェック）には変わらない
      await waitFor(() =>
        expect(
          within(document.body).getByText('コピーできませんでした', {
            selector: '[data-slot="tooltip"] *',
          })
        ).toBeVisible()
      );
      await expect(button).not.toHaveAttribute('data-copied');
      // 読み上げは 1 回だけ（吹き出しは読み上げの箱ではない）
      const spoken = [...canvasElement.querySelectorAll('[role="status"]')].filter((box) =>
        box.textContent?.includes('コピーできませんでした')
      );
      await expect(spoken).toHaveLength(1);
    } finally {
      if (original) Object.defineProperty(navigator, 'clipboard', original);
      else Reflect.deleteProperty(navigator, 'clipboard');
    }
  },
};

export const CopyWithoutRemovedLines: Story = {
  name: 'コピー（差分）',
  args: { html: diffHtml, title: 'astro.config.ts', lineNumbers: true },
  play: async ({ canvas }) => {
    const writeText = fn(async (_text: string) => {});
    const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    try {
      await userEvent.click(canvas.getByRole('button', { name: 'コードをコピー astro.config.ts' }));
      await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
      const text = writeText.mock.calls[0]?.[0] ?? '';
      // 消した行・行番号・＋／− の印は写さない
      await expect(text).not.toContain('github-light');
      await expect(text).toContain('theme: cssVariables,');
      await expect(text.split('\n')[0]).toBe(
        "import { transformerNotationDiff } from '@shikijs/transformers';"
      );
    } finally {
      if (original) Object.defineProperty(navigator, 'clipboard', original);
      else Reflect.deleteProperty(navigator, 'clipboard');
    }
  },
};

export const LanguageHeightWrap: Story = {
  name: '言語・最大の高さ・折り返し',
  parameters: { controls: { disable: true } },
  render: () => (
    <div data-reading className="flex max-w-xl flex-col gap-4">
      <CodeBlock title="src/lib/posts.ts" language="ts" html={typescriptHtml} />
      <CodeBlock language="sh" html={shellHtml} />
      <CodeBlock
        title="src/lib/posts.ts"
        language="ts"
        languagePlacement="end"
        hideLanguageBackground
        html={shellHtml}
      />
      <CodeBlock title="長い行" language="ts" maxHeight={96} html={longLineHtml} />
      <CodeBlock title="折り返し" language="ts" wrap lineNumbers html={longLineHtml} />
      <CodeBlock title="字下げした行の折り返し" wrap html={indentedLongLineHtml} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const blocks = [...canvasElement.querySelectorAll<HTMLElement>('[data-slot="code-block"]')];
    // 言語のラベルは帯に出る。題がなくても帯が出る
    await expect(blocks[0]?.querySelector('[data-slot="code-block-language"]')).toHaveTextContent(
      'ts'
    );
    await expect(blocks[1]).toHaveAttribute('data-titled');
    // 既定は題の前に面を敷く。end は題の後ろ、hideLanguageBackground は文字だけ
    const language = (block?: HTMLElement) =>
      block?.querySelector<HTMLElement>('[data-slot="code-block-language"]');
    const title = (block?: HTMLElement) => language(block)?.previousElementSibling;
    const left = (element?: Element | null) => element?.getBoundingClientRect().left ?? 0;
    await expect(left(language(blocks[0]))).toBeLessThan(left(title(blocks[0])));
    await expect(getComputedStyle(language(blocks[0])!).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)'
    );
    await expect(left(language(blocks[2]))).toBeGreaterThan(left(title(blocks[2])));
    await expect(getComputedStyle(language(blocks[2])!).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    // 最大の高さ: 枠がスクロールし、pre は Tab で止まらない
    const frame = blocks[3]?.querySelector<HTMLElement>('[data-slot="code-block-scroll"]');
    await expect(frame).not.toBeNull();
    await expect(frame?.getBoundingClientRect().height).toBeLessThanOrEqual(97);
    await waitFor(() => expect(blocks[3]?.querySelector('pre')).not.toHaveAttribute('tabindex'));
    // 折り返し: 横にはみ出さない
    const wrapped = blocks[4]?.querySelector('pre');
    await waitFor(() =>
      expect(wrapped?.scrollWidth).toBeLessThanOrEqual((wrapped?.clientWidth ?? 0) + 1)
    );
    // 続きの行は、その行の字下げと同じだけ下がる（字下げのない行は 0）
    const lines = [...(blocks[5]?.querySelectorAll<HTMLElement>('pre .line') ?? [])];
    await expect(lines[0]?.style.getPropertyValue('--cb-line-indent')).toBe('0ch');
    await expect(lines[1]?.style.getPropertyValue('--cb-line-indent')).toBe('2ch');
    const range = document.createRange();
    range.selectNodeContents(lines[1]);
    const rects = [...range.getClientRects()];
    const rows = [...new Set(rects.map((rect) => Math.round(rect.top)))];
    await expect(rows.length).toBeGreaterThan(1);
    // 2 行目以降のいちばん左は、1 行目の文字（return）の頭と同じ
    const firstWord = lines[1].querySelector('span')!;
    const wordRange = document.createRange();
    wordRange.setStart(firstWord.firstChild!, 2);
    wordRange.setEnd(firstWord.firstChild!, 3);
    const wordLeft = Math.round(wordRange.getBoundingClientRect().left);
    const continuationLefts = rects
      .filter((rect) => Math.round(rect.top) > rows[0])
      .map((rect) => Math.round(rect.left));
    await expect(Math.min(...continuationLefts)).toBeGreaterThanOrEqual(wordLeft - 1);
    await expect(Math.min(...continuationLefts)).toBeLessThanOrEqual(wordLeft + 1);
  },
};
