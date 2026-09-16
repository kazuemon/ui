// ストーリーの雛形。src/components/<kebab-name>/<Name>.stories.tsx に写す
// Docs の文は使い方だけを書く（開発の経緯や ADR の番号は書かない）
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Example } from './Example';
import { DensityPair, Matrix } from '../../stories/story-parts';
import { type MatrixColumn, statePseudo } from '../../stories/story-states';

const colors = ['primary', 'secondary', 'neutral'] as const;
const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
];

const meta = {
  title: 'Components/Example',
  component: Example,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '部品が何で、いつ使うかを 1〜2 文で書きます。',
          '',
          '- props ごとの使い分けを箇条書きにします。既定の値も書きます。',
        ].join('\n'),
      },
    },
  },
  // Controls で既定の値を選んだ状態から始める（部品の既定と同じ値）
  args: { children: 'ラベル', color: 'neutral' },
  argTypes: {
    children: { control: 'text' },
    // 表の「Default」は、部品の引数の既定値からしか読まれない。既定値を持たない props はここで補う
    color: {
      control: 'inline-radio',
      options: colors,
      table: { defaultValue: { summary: "'neutral'" } },
    },
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

// 色 × 状態の一覧。tags: ['visual'] を付けたストーリーは、見た目の基準画像とくらべる（.storybook/visual-testing.md）
// 操作しないと出ない状態（hover・押下・フォーカス）は statePseudo で固定する
export const States: Story = {
  tags: ['visual'],
  name: '色と状態',
  parameters: {
    controls: { exclude: ['color'] },
    pseudo: statePseudo({ focusVisible: '[data-slot="example"]' }),
  },
  render: (args) => (
    <Matrix
      rows={colors}
      columns={stateColumns}
      rowLabel={(color) => color}
      renderCell={(color) => <Example {...args} data-slot="example" tabIndex={0} color={color} />}
    />
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  render: (args) => (
    <DensityPair>
      <Example {...args} />
    </DensityPair>
  ),
};

// play: 読み上げや props の確かめ。userEvent は play の引数ではなく storybook/test から読む
export const Accessibility: Story = {
  name: '読み上げ',
  play: async ({ canvas }) => {
    await expect(canvas.getByText('ラベル')).toBeVisible();
  },
};
