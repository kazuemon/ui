import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import { CodeBlock } from './CodeBlock';
import { diffHtml, focusHtml, shellHtml, typescriptHtml, wordHtml } from './fixtures';
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
          "- Shiki は `createCssVariablesTheme`（`variablePrefix: '--shiki-'`）で色分けします。色はこの部品が入れます。",
          '- 強調行・差分・フォーカス・語の強調は、`@shikijs/transformers` の `transformerNotationHighlight`・`transformerNotationDiff`・`transformerNotationFocus`・`transformerNotationWordHighlight` の書き方（`// [!code highlight]` など）で付けます。',
          '- `html` はそのまま HTML として入れます。ビルド時に自分で作った HTML だけを渡し、利用者が書いた文や外から取ってきた文をエスケープせずに渡さないでください。',
          '- MDX の `pre` を差し替えるときは、`html` の代わりに `children` に pre の中身を渡せます。',
          '- `title` でファイル名などの題を上の帯に出し、コピーのボタンを帯の右に置きます。題がないときは、ボタンを右上に浮かせます。',
          '- `appearance` は見た目です。`surface`（既定）はグレーの面、`dark` は濃紺の地です。',
          '- `lineNumbers` で行番号を出します。数を渡すと、その番号から数えます。',
          '- コピーのボタンは、表示している行の文字を写します（差分で消した行は写しません）。`copyText` で写す文字を決められます。押すと「コピーしました」に変わり、読み上げでも伝えます。',
          '- 文字はパソコンでもスマホでも 14px です。長い行は、コードの部分だけが横にスクロールします。',
        ].join('\n'),
      },
    },
  },
  args: {
    html: typescriptHtml,
    title: 'src/lib/posts.ts',
    appearance: 'surface',
    lineNumbers: false,
  },
  argTypes: {
    appearance: { control: 'inline-radio', options: ['surface', 'dark'] },
    lineNumbers: { control: 'boolean' },
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

export const Appearances: Story = {
  tags: ['visual'],
  name: '見た目と題',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="28rem">
      {(['surface', 'dark'] as const).map((appearance) => (
        <Specimen key={appearance} label={appearance}>
          <div data-reading className="flex flex-col gap-4">
            <CodeBlock appearance={appearance} title="src/lib/posts.ts" html={typescriptHtml} />
            <CodeBlock appearance={appearance} html={shellHtml} />
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
      {(['surface', 'dark'] as const).map((appearance) => (
        <Specimen key={appearance} label={appearance}>
          <div data-reading className="flex flex-col gap-4">
            <CodeBlock
              appearance={appearance}
              title="astro.config.ts"
              html={diffHtml}
              lineNumbers
            />
            <CodeBlock appearance={appearance} title="code-block.css" html={focusHtml} />
            <CodeBlock appearance={appearance} title="src/pages/index.ts" html={wordHtml} />
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
      // 横にはみ出す pre だけが Tab で止まる
      await waitFor(() =>
        expect(canvasElement.querySelector('pre')).toHaveAttribute('tabindex', '0')
      );
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
