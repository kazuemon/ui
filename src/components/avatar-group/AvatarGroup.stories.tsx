import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { AvatarGroup } from './AvatarGroup';
import { Avatar, type AvatarProps } from '../avatar/Avatar';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';
import { sourceCode } from '../../stories/story-states';

const members = ['かずえもん', '宮本一也', 'Kazuya Miyamoto', 'Sato', 'Tanaka', 'Suzuki'];

const avatars = (count: number, size?: AvatarProps['size']) =>
  members.slice(0, count).map((name) => <Avatar key={name} name={name} size={size} />);

const sizes = ['sm', 'md', 'lg', 'xl'] as const;

const meta = {
  title: 'Components/AvatarGroup',
  component: AvatarGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'Avatar を重ねて並べます。同じ場所に集まった人やものをまとめて見せるときに使います。',
          '',
          '- 中に `Avatar` を並べます。重なる部分には、置いた面の色の縁を敷いて区切ります。',
          '- `max` を渡すと、超えた分を「+N」のアバターにまとめます（N は隠れた数）。`max` は「+N」自身の枠も含めた表示の総数です（`max={4}` で 6 個渡すと、アバター 3 個と「+N」の 4 枠になります）。渡さないときは隠さず全部並べます。',
          '- `size` を渡すと、子の Avatar の大きさをそろえて上書きします。渡さないときは、子がそれぞれ持つ大きさのまま重ねます。',
          '- `moreLabel`・`moreName` で「+N」の文字と読み上げの名前を差し替えられます。',
        ].join('\n'),
      },
      source: { type: 'dynamic' },
    },
  },
  args: { max: 4, size: 'lg' },
  argTypes: {
    max: { control: { type: 'number', min: 0 } },
    size: {
      control: 'inline-radio',
      options: sizes,
      table: { defaultValue: { summary: undefined } },
    },
    children: { control: false },
  },
} satisfies Meta<typeof AvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      source: sourceCode(`
        <AvatarGroup max={4}>
          <Avatar name="かずえもん" />
          <Avatar name="宮本一也" />
          <Avatar name="Kazuya Miyamoto" />
          <Avatar name="Sato" />
          <Avatar name="Tanaka" />
          <Avatar name="Suzuki" />
        </AvatarGroup>
      `),
    },
  },
  render: (args) => <AvatarGroup {...args}>{avatars(members.length)}</AvatarGroup>,
};

// 大きさの一覧。tags: ['visual'] を付けたストーリーは、見た目の基準画像とくらべる
export const Sizes: Story = {
  tags: ['visual'],
  name: '大きさ',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`size` を渡すと、子の Avatar の大きさをそろえます。重なりの量は Avatar の大きさに比例します。',
      },
    },
  },
  render: () => (
    <Gallery columnWidth="12rem">
      {sizes.map((size) => (
        <Specimen key={size} label={size}>
          <AvatarGroup size={size}>{avatars(4)}</AvatarGroup>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Overflow: Story = {
  tags: ['visual'],
  name: '超えたとき',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`max` を超える数を渡すと、残りを「+N」のアバターにまとめます。`max` は「+N」の枠も含めた数です。',
      },
    },
  },
  render: () => (
    <Gallery columnWidth="12rem">
      <Specimen label="max なし（全部並べる）">
        <AvatarGroup size="lg">{avatars(6)}</AvatarGroup>
      </Specimen>
      <Specimen label="max={4}">
        <AvatarGroup size="lg" max={4}>
          {avatars(6)}
        </AvatarGroup>
      </Specimen>
      <Specimen label="max={1}">
        <AvatarGroup size="lg" max={1}>
          {avatars(6)}
        </AvatarGroup>
      </Specimen>
    </Gallery>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Avatar は押すものではないので、大きさは入力方式で変わりません。' },
    },
  },
  render: () => (
    <DensityPair>
      <AvatarGroup size="lg" max={4}>
        {avatars(6)}
      </AvatarGroup>
    </DensityPair>
  ),
};

// play: 読み上げの確かめ。userEvent は play の引数ではなく storybook/test から読む
export const Accessibility: Story = {
  name: '読み上げ',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '並べた Avatar は、それぞれの読み上げの名前（`alt` か `name`）をそのまま読みます。「+N」のアバターは、既定では見えている文字（「+N」）と同じ文を読みます。`moreName` で読み上げだけ差し替えられます。',
      },
    },
  },
  render: () => (
    <AvatarGroup size="lg" max={3}>
      {avatars(4)}
    </AvatarGroup>
  ),
  play: async ({ canvas }) => {
    // 表示される先頭 2 つは、それぞれの Avatar の頭文字と読み上げの名前をそのまま持つ
    await expect(canvas.getByText('か').closest('[aria-hidden="true"]')).toBeInTheDocument();
    await expect(canvas.getByText('かずえもん')).toBeInTheDocument();
    await expect(canvas.getByText('宮').closest('[aria-hidden="true"]')).toBeInTheDocument();
    await expect(canvas.getByText('宮本一也')).toBeInTheDocument();
    // 残り 2 つは「+2」のアバターにまとまる。見えている文字と読み上げの名前の両方に出る
    const more = canvas.getAllByText('+2');
    await expect(more).toHaveLength(2);
    await expect(more[0].closest('[aria-hidden="true"]')).toBeInTheDocument();
  },
};
