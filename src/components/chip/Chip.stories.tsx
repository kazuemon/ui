import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';

import { Chip } from './Chip';
import { DensityPair, Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { type MatrixColumn, statePseudo } from '../../stories/story-states';

const userColors = ['primary', 'secondary', 'neutral'] as const;
const statusColors = ['info', 'success', 'warning', 'danger'] as const;
const allColors = [...userColors, ...statusColors];

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: '消すボタンの hover', state: 'hover' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
];

const meta = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '選んだ値や入力した語を並べる、消せる小さな印です。複数選択の欄や、語を並べて入力する欄の中で使います。',
          '',
          '- 色は `Tag` と同じです。`primary`・`secondary`・`neutral`（既定）と、状態を表す `info`・`success`・`warning`・`danger` があります。',
          '- `onRemove` を渡すと右端に消すボタン（×）が出ます。読み上げの名前を `removeName` で必ず渡します（「デザインを外す」など）。',
          '- `disabled` は押せない見た目で、消すボタンも押せません。`readOnly` は消すボタンを出しません。',
          '- Base UI の `Combobox.Chip` の `render` に `Chip` を、`Combobox.ChipRemove` の `render` に `ChipRemove` を渡して、複数選択の欄に組み込めます。',
        ].join('\n'),
      },
    },
  },
  args: {
    children: 'デザイン',
    color: 'neutral',
    onRemove: fn(),
    removeName: 'デザインを外す',
  },
  argTypes: {
    children: { control: 'text' },
    color: {
      control: 'inline-radio',
      options: allColors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
    disabled: { table: { defaultValue: { summary: 'false' } } },
    readOnly: { table: { defaultValue: { summary: 'false' } } },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'inherit'],
      table: { defaultValue: { summary: "'md'" } },
    },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Colors: Story = {
  tags: ['visual'],
  name: '色',
  parameters: { controls: { exclude: ['color'] } },
  render: (args) => (
    <Gallery>
      <Specimen label="利用者が選ぶ色">
        <div className="flex flex-wrap gap-2">
          {userColors.map((color) => (
            <Chip key={color} {...args} color={color}>
              {color}
            </Chip>
          ))}
        </div>
      </Specimen>
      <Specimen label="状態の色">
        <div className="flex flex-wrap gap-2">
          {statusColors.map((color) => (
            <Chip key={color} {...args} color={color}>
              {color}
            </Chip>
          ))}
        </div>
      </Specimen>
    </Gallery>
  ),
};

export const States: Story = {
  tags: ['visual'],
  name: '状態',
  parameters: {
    controls: { exclude: ['color', 'disabled', 'readOnly', 'onRemove', 'removeName'] },
    pseudo: statePseudo({
      hover: '[data-slot="chip-remove"]',
      focusVisible: '[data-slot="chip-remove"]',
    }),
    docs: {
      description: {
        story:
          'フォーカスの線はキーボードで操作したときだけ、消すボタンに出ます。押せないときは色を残して薄くなり、読み取り専用は消すボタンが出ません。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-col gap-8">
      <Matrix
        rows={['neutral', 'primary', 'secondary'] as const}
        columns={stateColumns}
        columnWidth="11rem"
        rowLabel={(color) => color}
        renderCell={(color) => <Chip {...args} color={color} />}
      />
      <Gallery>
        <Specimen label="押せない">
          <div className="flex flex-wrap gap-2">
            {(['neutral', 'primary', 'secondary'] as const).map((color) => (
              <Chip key={color} {...args} color={color} disabled />
            ))}
          </div>
        </Specimen>
        <Specimen label="読み取り専用">
          <div className="flex flex-wrap gap-2">
            {(['neutral', 'primary', 'secondary'] as const).map((color) => (
              <Chip key={color} {...args} color={color} readOnly />
            ))}
          </div>
        </Specimen>
        <Specimen label="消せない（onRemove なし）">
          <div className="flex">
            <Chip>デザイン</Chip>
          </div>
        </Specimen>
      </Gallery>
    </div>
  ),
};

export const Sizes: Story = {
  tags: ['visual'],
  name: '大きさ',
  parameters: {
    controls: { exclude: ['size'] },
    docs: {
      description: {
        story:
          'sm・md（既定）・lg の 3 段です（ADR-0259）。sm は消す × の丸をチップの高さいっぱいに広げます（原則にない判断）。inherit は段を持たず、周りの文字の大きさに従います。',
      },
    },
  },
  render: (args) => (
    <Gallery>
      <Specimen label="sm・md・lg">
        <div className="flex flex-wrap items-center gap-2">
          <Chip {...args} size="sm">
            sm
          </Chip>
          <Chip {...args} size="md">
            md
          </Chip>
          <Chip {...args} size="lg">
            lg
          </Chip>
        </div>
      </Specimen>
      <Specimen label="inherit（本文 16px）">
        <p style={{ fontSize: 16 }}>
          デザインのタグ{' '}
          <Chip readOnly size="inherit" color="primary">
            デザイン
          </Chip>{' '}
          が付いています
        </p>
      </Specimen>
      <Specimen label="inherit（注記 14px）">
        <p style={{ fontSize: 14 }} className="text-fg-muted">
          デザインのタグ{' '}
          <Chip readOnly size="inherit" color="primary">
            デザイン
          </Chip>{' '}
          が付いています
        </p>
      </Specimen>
    </Gallery>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: {
    docs: {
      description: { story: '高さと文字の大きさは、ボタンと同じく密度に従います。' },
    },
  },
  render: (args) => (
    <DensityPair>
      <div className="flex flex-wrap gap-2">
        <Chip {...args} color="primary" />
        <Chip {...args} />
        <Chip color="success">公開中</Chip>
      </div>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  args: { onRemove: fn() },
  play: async ({ canvas, args }) => {
    const remove = canvas.getByRole('button', { name: 'デザインを外す' });
    await expect(remove).toBeVisible();
    await userEvent.click(remove);
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
    // キーボードでも消せる
    remove.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onRemove).toHaveBeenCalledTimes(2);
  },
};

export const DisabledAndReadOnly: Story = {
  name: '押せない・読み取り専用',
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="flex gap-2">
      <Chip {...args} disabled>
        押せない
      </Chip>
      <Chip {...args} readOnly>
        読み取り専用
      </Chip>
    </div>
  ),
  play: async ({ canvas, args }) => {
    // 押せないときは消すボタンも押せない。読み取り専用は消すボタンを出さない
    const remove = canvas.getByRole('button', { name: 'デザインを外す' });
    await expect(remove).toBeDisabled();
    await userEvent.click(remove);
    await expect(args.onRemove).not.toHaveBeenCalled();
    await expect(canvas.getAllByRole('button')).toHaveLength(1);
  },
};
