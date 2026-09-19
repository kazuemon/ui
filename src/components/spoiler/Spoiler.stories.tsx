import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { Spoiler, type SpoilerAppearance } from './Spoiler';
import { Blockquote } from '../blockquote/Blockquote';
import { Callout } from '../callout/Callout';
import { Heading } from '../heading/Heading';
import { Prose } from '../prose/Prose';
import { Text } from '../text/Text';
import { Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { type MatrixColumn, sourceCode, statePseudo } from '../../stories/story-states';

const meta = {
  title: 'Components/Spoiler',
  component: Spoiler,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '文の中で隠しておき、押すと見える言葉です。ネタバレや、クイズの答えに使います。',
          '',
          '- 押すか、フォーカスして Enter・Space で見せます。既定では、一度見せたら隠し直しません。もう一度押して隠し直せるようにするには `toggleable` を付けます。',
          '- 隠し方は `appearance` で選びます。既定の `hatched` は斜線の模様、`soft` は淡い面で覆います。`blur` は文字をぼかすので、おおよその長さと形が見えます。短い数字や英字は形から推し量れることがあるので、答えを隠すときは `hatched` か `soft` にします。',
          '- 見せる・隠すときは、すぐに切り替えます。移り変わりを付けたいときは `duration` に長さ（ms）を渡します。動きを減らす設定では、指定があってもすぐに切り替えます。',
          '- 隠しているあいだは、中身を読み上げず、`label`（既定は「ネタバレを表示」）のボタンとして読みます。何が隠れているかを伝えたいときは、「犯人の名前を表示」のように `label` を変えます。',
          '- 隠しているあいだは、中身を選んで写したり、中のリンクを押したりできません。',
          '- 文の中にそのまま置けます。行をまたいでも折り返します。記事（Prose）の中では、MDX から部品として置きます。',
          '- 段落や画像のような大きなまとまりを隠すときは、開閉（Collapsible）で「答えを見る」のように置きます。',
        ].join('\n'),
      },
    },
  },
  args: { children: '犯人は語り手でした', label: 'ネタバレを表示', onRevealedChange: fn() },
  argTypes: {
    children: { control: 'text' },
    appearance: { control: 'inline-radio', options: ['hatched', 'soft', 'blur'] },
    toggleable: { control: 'boolean' },
    duration: { control: 'number' },
    defaultRevealed: { control: 'boolean' },
  },
  render: (args) => (
    <Text>
      最後の章で分かるのは、
      <Spoiler {...args} />
      ということです。
    </Text>
  ),
} satisfies Meta<typeof Spoiler>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: '押下', state: 'active' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
];

export const States: Story = {
  tags: ['visual'],
  name: '状態',
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({
      hover: '[data-slot="spoiler"]',
      active: '[data-slot="spoiler"]',
      focusVisible: '[data-slot="spoiler"]',
    }),
    docs: {
      description: { story: '隠しているときの状態と、見せたあとです。' },
    },
  },
  render: () => (
    <Matrix
      rows={['隠している', '見せたあと'] as const}
      columns={stateColumns}
      rowLabel={(row) => row}
      renderCell={(row) => (
        <Text>
          答えは<Spoiler defaultRevealed={row === '見せたあと'}>42</Spoiler>です。
        </Text>
      )}
    />
  ),
};

const appearances: SpoilerAppearance[] = ['hatched', 'soft', 'blur'];

export const Appearances: Story = {
  tags: ['visual'],
  name: '隠し方',
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({ hover: '[data-slot="spoiler"]' }),
    docs: {
      description: {
        story:
          '`appearance` ごとの、隠しているとき・hover・見せたあとです。どれも面と文字の色は周りの文字の色から作ります。',
      },
    },
  },
  render: () => (
    <Matrix
      rows={appearances}
      columns={[
        { label: '隠している' },
        { label: 'hover', state: 'hover' },
        { label: '見せたあと' },
      ]}
      columnWidth="14rem"
      rowLabel={(row) => row}
      renderCell={(row, column) => (
        <Text>
          最後の章で、
          <Spoiler appearance={row} defaultRevealed={column.label === '見せたあと'}>
            語り手が犯人
          </Spoiler>
          だと分かります。
        </Text>
      )}
    />
  ),
};

export const Grounds: Story = {
  tags: ['visual'],
  name: '置く場所',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '見出し・本文・注記、グレーの面、色の面と濃い塗り、行をまたいで折り返したときです。面と文字の色は周りの文字の色から作るので、どの地の上でも一段濃い面になります。',
      },
    },
  },
  render: () => (
    <Gallery columnWidth="18rem">
      {[false, true].map((revealed) => (
        <Specimen key={String(revealed)} label={revealed ? '見せたあと' : '隠している'}>
          <div className="flex flex-col gap-4">
            <Heading level={3}>
              犯人は<Spoiler defaultRevealed={revealed}>語り手</Spoiler>
            </Heading>
            <Text>
              最後の章で、<Spoiler defaultRevealed={revealed}>語り手が犯人</Spoiler>だと分かります。
            </Text>
            <Text size="sm" tone="subtle">
              注記の中の <Spoiler defaultRevealed={revealed}>Spoiler</Spoiler>
            </Text>
            <Blockquote appearance="surface">
              答えは<Spoiler defaultRevealed={revealed}>42</Spoiler>です。
            </Blockquote>
            <Callout color="info">
              答えは<Spoiler defaultRevealed={revealed}>42</Spoiler>です。
            </Callout>
            <Callout color="info" appearance="filled">
              答えは<Spoiler defaultRevealed={revealed}>42</Spoiler>です。
            </Callout>
            <Text className="w-[14rem]">
              読み終えてから開いてください。
              <Spoiler defaultRevealed={revealed}>
                最後の一行で、語り手がはじめから嘘をついていたことが分かります
              </Spoiler>
              。
            </Text>
          </div>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const InProse: Story = {
  name: '記事の中',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'MDX では、部品として文の中に置きます。`label` で、何が隠れているかを読み上げに伝えられます。',
      },
      source: sourceCode(`
        import { Spoiler } from '@kazuemon/ui';

        最後の章で分かるのは、<Spoiler label="犯人を表示">語り手が犯人</Spoiler>ということです。
      `),
    },
  },
  render: () => (
    <Prose>
      <h2>読み終えた人へ</h2>
      <p>
        最後の章で分かるのは、<Spoiler label="犯人を表示">語り手が犯人</Spoiler>
        ということです。<a href="#spoiler">ネタバレのない感想</a>も書きました。
      </p>
    </Prose>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  play: async ({ canvas, args }) => {
    const spoiler = canvas.getByRole('button', { name: 'ネタバレを表示' });
    await expect(spoiler).not.toHaveAttribute('aria-expanded');
    // 隠しているあいだは、中身を読まない
    await expect(canvas.queryByText('犯人は語り手でした')).toHaveAttribute('inert');
    // キーボードで見せると、ボタンでなくなり、フォーカスはそのまま残る
    await userEvent.tab();
    await expect(spoiler).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onRevealedChange).toHaveBeenCalledWith(true);
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(spoiler).toHaveFocus();
    await expect(canvas.getByText('犯人は語り手でした')).not.toHaveAttribute('inert');
  },
};

export const RevealByClick: Story = {
  name: '押して見せる',
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'ネタバレを表示' }));
    await expect(canvas.getByText('犯人は語り手でした')).not.toHaveAttribute('inert');
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};

export const Toggleable: Story = {
  name: '隠し直せる',
  args: { toggleable: true },
  parameters: {
    docs: {
      description: {
        story:
          '`toggleable` を付けると、見せたあともボタンのままで、もう一度押すと隠し直します。読み上げでは開閉のボタン（見せているかどうか）として読みます。見せたあとの中身はボタンの名前として読まれるので、中にリンクなどの押せるものは置きません。',
      },
      source: sourceCode(`
        <Spoiler toggleable>語り手が犯人</Spoiler>
      `),
    },
  },
  play: async ({ canvas, args }) => {
    const spoiler = canvas.getByRole('button', { name: 'ネタバレを表示' });
    await expect(spoiler).toHaveAttribute('aria-expanded', 'false');
    // キーボードで見せても、ボタンのまま、フォーカスも残る。名前は中身になる
    await userEvent.tab();
    await expect(spoiler).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onRevealedChange).toHaveBeenLastCalledWith(true);
    await expect(spoiler).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('button', { name: '犯人は語り手でした' })).toBe(spoiler);
    await expect(spoiler).toHaveFocus();
    await expect(canvas.getByText('犯人は語り手でした')).not.toHaveAttribute('inert');
    // Space でもう一度押すと隠し直す
    await userEvent.keyboard(' ');
    await expect(args.onRevealedChange).toHaveBeenLastCalledWith(false);
    await expect(spoiler).toHaveAttribute('aria-expanded', 'false');
    await expect(spoiler).toHaveAccessibleName('ネタバレを表示');
    await expect(spoiler).toHaveFocus();
    await expect(canvas.getByText('犯人は語り手でした')).toHaveAttribute('inert');
    // 押しても見せる・隠すを繰り返す
    await userEvent.click(spoiler);
    await expect(spoiler).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(spoiler);
    await expect(spoiler).toHaveAttribute('aria-expanded', 'false');
  },
};
