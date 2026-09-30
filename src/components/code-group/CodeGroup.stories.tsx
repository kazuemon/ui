import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { CodeGroup } from './CodeGroup';
import { bunHtml, jsxHtml, npmHtml, pnpmHtml, tsxHtml, yarnHtml } from './fixtures';
import { CodeBlock } from '../code-block/CodeBlock';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';
import { type PreviewState, sourceCode, statePseudo } from '../../stories/story-states';
import { Button } from '../button/Button';

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
          '- コピーのボタンは枠に 1 つだけ置き、いま開いているタブのコードを写します。写せなかったときは、ボタンの下に淡い赤の吹き出しで知らせます（文は `copyErrorText`）。',
          '- `variant` は見た目です。`surface`（既定）はグレーの面、`dark` は濃紺の地で、中の `CodeBlock` にも渡ります。',
          '- `indicator` は、開いているタブの印です。`line`（既定）は文字を濃く太くして下に線を引き、`text` は文字の濃さと太さだけにします。',
          '- タブは ← → キーで移れます。タブが入りきらないときは、帯だけが横にスクロールします。',
          '- 開いているタブは、タブの名前（`title` の文字）で `value`・`defaultValue`・`onValueChange` に渡します。',
          '- ページの中の CodeGroup をそろえるときは、同じ `groupId` を付けます。1 つで選ぶと、同じ名前のタブを持つほかの CodeGroup も切り替わり、選んだ名前は端末に覚えて、次に開いたページでも同じタブから始めます。MDX の中でも、状態を渡さずに使えます。',
        ].join('\n'),
      },
    },
  },
  args: { variant: 'surface', indicator: 'line' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['surface', 'dark'] },
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

export const Variants: Story = {
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
        <CodeGroup variant="dark">
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
        <div className="max-w-[13rem]">
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

export const CopyError: Story = {
  name: 'コピーできなかったとき',
  tags: ['visual'],
  args: { variant: 'dark' },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'クリップボードを使えなくして押しています。印は変わらず、淡い赤の吹き出しで知らせます。濃い地の上でも、吹き出しは同じ色です。',
      },
    },
  },
  play: async ({ canvas, canvasElement }) => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error('denied');
        },
      },
    });
    try {
      const button = canvas.getByRole('button', { name: 'コードをコピー pnpm' });
      await userEvent.click(button);
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

export const Controlled: Story = {
  name: '外から開くタブを決める',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`value` と `onValueChange` で、開くタブを外から決めます。値はタブの名前（`title` の文字）です。',
      },
      source: sourceCode(`
        const [manager, setManager] = useState('npm');

        <CodeGroup value={manager} onValueChange={setManager}>
          <CodeBlock title="pnpm" html={pnpmHtml} />
          <CodeBlock title="npm" html={npmHtml} />
          <CodeBlock title="yarn" html={yarnHtml} />
        </CodeGroup>
      `),
    },
  },
  args: { onValueChange: fn() },
  render: function Render({ onValueChange, ...args }) {
    const [manager, setManager] = useState('npm');
    return (
      <div data-reading className="flex max-w-xl flex-col gap-3">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setManager('yarn')}>
            yarn にする
          </Button>
        </div>
        <CodeGroup
          {...args}
          value={manager}
          onValueChange={(next) => {
            setManager(next);
            onValueChange?.(next);
          }}
        >
          <CodeBlock title="pnpm" html={pnpmHtml} />
          <CodeBlock title="npm" html={npmHtml} />
          <CodeBlock title="yarn" html={yarnHtml} />
        </CodeGroup>
      </div>
    );
  },
  play: async ({ args, canvas }) => {
    await expect(canvas.getByRole('tab', { name: 'npm' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(canvas.getByRole('tab', { name: 'pnpm' }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith('pnpm');
    await waitFor(() =>
      expect(canvas.getByRole('tab', { name: 'pnpm' })).toHaveAttribute('aria-selected', 'true')
    );
    await userEvent.click(canvas.getByRole('button', { name: 'yarn にする' }));
    await waitFor(() =>
      expect(canvas.getByRole('tab', { name: 'yarn' })).toHaveAttribute('aria-selected', 'true')
    );
  },
};

const syncGroupId = 'story-package-manager';

export const Synced: Story = {
  name: 'ページの中でそろえる',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '同じ `groupId` の CodeGroup は、同じ名前のタブがそろって切り替わります。選んだ名前は端末に覚えます。その名前のタブを持たない CodeGroup（下の 2 つ目は yarn がない）は、そのままです。',
      },
      source: sourceCode(`
        <CodeGroup groupId="package-manager">
          <CodeBlock title="pnpm" html={pnpmHtml} />
          <CodeBlock title="npm" html={npmHtml} />
          <CodeBlock title="yarn" html={yarnHtml} />
        </CodeGroup>

        <CodeGroup groupId="package-manager">
          <CodeBlock title="pnpm" html={pnpmHtml} />
          <CodeBlock title="npm" html={npmHtml} />
        </CodeGroup>
      `),
    },
  },
  render: (args) => (
    <div data-reading className="flex max-w-xl flex-col gap-4">
      <CodeGroup {...args} groupId={syncGroupId} data-testid="first">
        <CodeBlock title="pnpm" html={pnpmHtml} />
        <CodeBlock title="npm" html={npmHtml} />
        <CodeBlock title="yarn" html={yarnHtml} />
      </CodeGroup>
      <CodeGroup {...args} groupId={syncGroupId} data-testid="second">
        <CodeBlock title="pnpm" html={pnpmHtml} />
        <CodeBlock title="npm" html={npmHtml} />
      </CodeGroup>
    </div>
  ),
  beforeEach: () => {
    const key = `kazuemon-ui:code-group:${syncGroupId}`;
    try {
      localStorage.removeItem(key);
    } catch {
      // 保存が使えない環境では、消すものもない
    }
    return () => {
      try {
        localStorage.removeItem(key);
      } catch {
        // 同上
      }
    };
  },
  play: async ({ canvas }) => {
    const first = within(canvas.getByTestId('first'));
    const second = within(canvas.getByTestId('second'));
    // 1 つ目で npm を選ぶと、2 つ目も npm になり、端末に覚える
    await userEvent.click(first.getByRole('tab', { name: 'npm' }));
    await waitFor(() =>
      expect(second.getByRole('tab', { name: 'npm' })).toHaveAttribute('aria-selected', 'true')
    );
    await expect(localStorage.getItem(`kazuemon-ui:code-group:${syncGroupId}`)).toBe('npm');
    // 2 つ目にない yarn を選んでも、2 つ目は npm のまま
    await userEvent.click(first.getByRole('tab', { name: 'yarn' }));
    await waitFor(() =>
      expect(first.getByRole('tab', { name: 'yarn' })).toHaveAttribute('aria-selected', 'true')
    );
    await expect(second.getByRole('tab', { name: 'npm' })).toHaveAttribute('aria-selected', 'true');
    // 2 つ目で pnpm を選ぶと、1 つ目も pnpm に戻る
    await userEvent.click(second.getByRole('tab', { name: 'pnpm' }));
    await waitFor(() =>
      expect(first.getByRole('tab', { name: 'pnpm' })).toHaveAttribute('aria-selected', 'true')
    );
    // ほかのブラウザのタブで npm を選んだとき（storage イベント）も、両方が npm になる
    const key = `kazuemon-ui:code-group:${syncGroupId}`;
    localStorage.setItem(key, 'npm');
    window.dispatchEvent(new StorageEvent('storage', { key, oldValue: 'pnpm', newValue: 'npm' }));
    await waitFor(() =>
      expect(first.getByRole('tab', { name: 'npm' })).toHaveAttribute('aria-selected', 'true')
    );
    await expect(second.getByRole('tab', { name: 'npm' })).toHaveAttribute('aria-selected', 'true');
  },
};

const hydrateGroupId = 'story-hydrate';

export const Hydration: Story = {
  name: 'サーバーで描いたとき',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'サーバーで描いた HTML は、覚えた名前を読まずに最初のタブで描きます。ブラウザで水和（hydration）したあとで、覚えたタブに切り替えます。サーバーの HTML とずれません。',
      },
    },
  },
  render: () => <div data-reading className="max-w-xl" data-testid="host" />,
  play: async ({ canvas }) => {
    const key = `kazuemon-ui:code-group:${hydrateGroupId}`;
    localStorage.setItem(key, 'yarn');
    try {
      const group = (
        <CodeGroup groupId={hydrateGroupId}>
          <CodeBlock title="pnpm" html={pnpmHtml} />
          <CodeBlock title="npm" html={npmHtml} />
          <CodeBlock title="yarn" html={yarnHtml} />
        </CodeGroup>
      );
      const host = canvas.getByTestId('host');
      host.innerHTML = renderToString(group);
      // サーバーの HTML は最初のタブ
      await expect(within(host).getByRole('tab', { name: 'pnpm' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      const errors: unknown[] = [];
      const root = hydrateRoot(host, group, { onRecoverableError: (error) => errors.push(error) });
      // 水和のあとで、覚えたタブに切り替わる
      await waitFor(() =>
        expect(within(host).getByRole('tab', { name: 'yarn' })).toHaveAttribute(
          'aria-selected',
          'true'
        )
      );
      await expect(errors).toEqual([]);
      root.unmount();
    } finally {
      localStorage.removeItem(key);
    }
  },
};
