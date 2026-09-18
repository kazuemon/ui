import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';

import { CodeGroup } from './CodeGroup';
import { bunHtml, jsxHtml, npmHtml, pnpmHtml, tsxHtml, yarnHtml } from './fixtures';
import { CodeBlock } from '../code-block/CodeBlock';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';
import { type PreviewState, statePseudo } from '../../stories/story-states';

const meta = {
  title: 'Components/CodeGroup',
  component: CodeGroup,
  subcomponents: { CodeBlock },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '同じことを別のやり方で書いたコードを、タブで切り替えて見せます。パッケージマネージャごとのコマンドや、TypeScript と JavaScript の書き分けに使います。',
          '',
          '- 中には `CodeBlock` を並べます。タブの名前は、それぞれの `title` です。',
          '- 色分けは `CodeBlock` と同じで、ビルド時に Shiki で済ませた HTML を `html` に渡します。',
          '- コピーのボタンは枠に 1 つだけ置き、いま開いているタブのコードを写します。',
          '- `appearance` は見た目です。`surface`（既定）はグレーの面、`dark` は濃紺の地で、中の `CodeBlock` にも渡ります。',
          '- `indicator` は、開いているタブの印です。`line`（既定）は文字を濃く太くして下に線を引き、`text` は文字の濃さと太さだけにします。',
          '- タブは ← → キーで移れます。タブが入りきらないときは、帯だけが横にスクロールします。',
        ].join('\n'),
      },
    },
  },
  args: { appearance: 'surface', indicator: 'line' },
  argTypes: {
    appearance: { control: 'inline-radio', options: ['surface', 'dark'] },
    indicator: { control: 'inline-radio', options: ['line', 'text'] },
    children: { control: false },
  },
  render: (args) => (
    <div data-reading className="max-w-xl">
      <CodeGroup {...args}>
        <CodeBlock title="pnpm" html={pnpmHtml} />
        <CodeBlock title="npm" html={npmHtml} />
        <CodeBlock title="yarn" html={yarnHtml} />
      </CodeGroup>
    </div>
  ),
} satisfies Meta<typeof CodeGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

const tabColumns: { label: string; state?: PreviewState }[] = [
  { label: '通常' },
  { label: 'hover（選んでいないタブ）', state: 'hover' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
];

export const Appearances: Story = {
  tags: ['visual'],
  name: '見た目',
  parameters: { controls: { disable: true } },
  render: () => (
    <Gallery columnWidth="24rem">
      <Specimen label="surface（既定）">
        <CodeGroup>
          <CodeBlock title="pnpm" html={pnpmHtml} />
          <CodeBlock title="npm" html={npmHtml} />
        </CodeGroup>
      </Specimen>
      <Specimen label="dark">
        <CodeGroup appearance="dark">
          <CodeBlock title="pnpm" html={pnpmHtml} />
          <CodeBlock title="npm" html={npmHtml} />
        </CodeGroup>
      </Specimen>
      <Specimen label='indicator="text"（太字だけ）'>
        <CodeGroup indicator="text">
          <CodeBlock title="pnpm" html={pnpmHtml} />
          <CodeBlock title="npm" html={npmHtml} />
        </CodeGroup>
      </Specimen>
      <Specimen label="言語の切り替え（行番号つき）">
        <CodeGroup>
          <CodeBlock title="Save.tsx" html={tsxHtml} lineNumbers />
          <CodeBlock title="Save.jsx" html={jsxHtml} lineNumbers />
        </CodeGroup>
      </Specimen>
      <Specimen label="タブが多いとき（帯が横にスクロールする）">
        <div className="max-w-[18rem]">
          <CodeGroup>
            <CodeBlock title="pnpm" html={pnpmHtml} />
            <CodeBlock title="npm" html={npmHtml} />
            <CodeBlock title="yarn" html={yarnHtml} />
            <CodeBlock title="bun" html={bunHtml} />
          </CodeGroup>
        </div>
      </Specimen>
    </Gallery>
  ),
};

export const States: Story = {
  tags: ['visual'],
  name: 'タブの状態',
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({
      hover: '[data-slot="code-group-tab"]:last-of-type',
      focusVisible: '[data-slot="code-group-tab"]:last-of-type',
    }),
  },
  render: () => (
    <div className="flex flex-col gap-6">
      {tabColumns.map((column) => (
        <div key={column.label} data-preview={column.state} className="max-w-md">
          <p className="pb-2 text-xs font-bold text-fg-subtle">{column.label}</p>
          <CodeGroup>
            <CodeBlock title="pnpm" html={pnpmHtml} />
            <CodeBlock title="npm" html={npmHtml} />
          </CodeGroup>
        </div>
      ))}
    </div>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: { controls: { disable: true } },
  render: () => (
    <DensityPair>
      <div className="w-[22rem]">
        <CodeGroup>
          <CodeBlock title="pnpm" html={pnpmHtml} />
          <CodeBlock title="npm" html={npmHtml} />
        </CodeGroup>
      </div>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げと操作',
  parameters: { controls: { disable: true } },
  play: async ({ canvas }) => {
    const tabs = canvas.getAllByRole('tab');
    await expect(tabs).toHaveLength(3);
    await expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    // ← → キーでタブのあいだを移り、Enter で開く（移っただけでは切り替わらない）
    await userEvent.click(tabs[0]);
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(async () => {
      await expect(canvas.getAllByRole('tab')[1]).toHaveFocus();
    });
    await userEvent.keyboard('{Enter}');
    await waitFor(async () => {
      await expect(canvas.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true');
    });
    // 開いているタブのコードだけが見えている
    await expect(canvas.getByRole('tabpanel')).toBeVisible();
  },
};
