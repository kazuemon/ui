import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { AvatarGroup, type AvatarGroupOverlap } from './AvatarGroup';
import { Avatar, type AvatarProps } from '../avatar/Avatar';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';
import { sourceCode, statePseudo } from '../../stories/story-states';

const members = ['かずえもん', '宮本一也', 'Kazuya Miyamoto', 'Sato', 'Tanaka', 'Suzuki'];

const avatars = (count: number, size?: AvatarProps['size']) =>
  members.slice(0, count).map((name) => <Avatar key={name} name={name} size={size} />);

const sizes = ['sm', 'md', 'lg', 'xl'] as const;
const overlaps: AvatarGroupOverlap[] = ['sm', 'md', 'lg'];

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
          '- `overlap` は隣のアバターと重ねる量です。`md`（既定）は 30%、`sm` は 18%、`lg` は 45% 重ねます。',
          '- `expandOnHover` を付けると、マウスを載せたアバターの右側を隠している次のアバターを退けます。指では hover がないため出ません。',
          '- `moreLabel`・`moreName` で「+N」の文字と読み上げの名前を差し替えられます。',
        ].join('\n'),
      },
      source: { type: 'dynamic' },
    },
  },
  args: { max: 4, size: 'lg', overlap: 'md', expandOnHover: false },
  argTypes: {
    max: { control: { type: 'number', min: 0 } },
    size: {
      control: 'inline-radio',
      options: sizes,
      table: { defaultValue: { summary: undefined } },
    },
    overlap: {
      control: 'inline-radio',
      options: overlaps,
      table: { defaultValue: { summary: "'md'" } },
    },
    expandOnHover: { control: 'boolean', table: { defaultValue: { summary: 'false' } } },
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

// 重なりの量の一覧（ADR-0315）。tags: ['visual'] を付けたストーリーは、見た目の基準画像とくらべる
export const Overlap: Story = {
  tags: ['visual'],
  name: '重なりの量',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`overlap` は隣のアバターと重ねる量です。`md`（既定）は 30%、`sm` は 18%、`lg` は 45% 重ねます（ADR-0315）。',
      },
    },
  },
  render: () => (
    <Gallery columnWidth="12rem">
      {overlaps.map((overlap) => (
        <Specimen key={overlap} label={overlap}>
          <AvatarGroup size="lg" overlap={overlap}>
            {avatars(4)}
          </AvatarGroup>
        </Specimen>
      ))}
    </Gallery>
  ),
};

// hover で隣を退ける（ADR-0315）。先頭のアバターに hover を固定して撮る
export const ExpandOnHover: Story = {
  tags: ['visual'],
  name: 'hover で広げる',
  parameters: {
    controls: { disable: true },
    pseudo: statePseudo({ hover: '[data-avatar-group-item]:first-of-type' }),
    docs: {
      description: {
        story:
          '`expandOnHover` を付けると、マウスを載せたアバターの右側を隠している次のアバターを退け、隠れていた部分を見せます。指では hover がないため出ません。',
      },
    },
  },
  render: () => (
    <Gallery columnWidth="12rem">
      <Specimen label="通常">
        <AvatarGroup size="lg" expandOnHover>
          {avatars(4)}
        </AvatarGroup>
      </Specimen>
      <Specimen label="hover（先頭のアバター）">
        <div data-preview="hover">
          <AvatarGroup size="lg" expandOnHover>
            {avatars(4)}
          </AvatarGroup>
        </div>
      </Specimen>
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

// play: expandOnHover の挙動の確かめ（ADR-0315）
// CSS の :hover は、userEvent（合成イベント）では実ブラウザでも本物の :hover にならない（実際に確かめた）。
// 見た目に :hover で退けるかどうかは、statePseudo を使った上の「hover で広げる」（visual）で確かめる。
// ここでは、expandOnHover の有無で仕込み（margin-left の transition）が切り替わることと、
// 見た目の違いだけで Avatar の中身・読み上げの名前は変わらないことを確かめる
export const ExpandOnHoverBehavior: Story = {
  name: 'hover の挙動',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`expandOnHover` の有無で切り替わることを確かめます。指では hover がないため、マウスの操作でだけ働きます。',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-6">
      <AvatarGroup data-testid="on" size="lg" expandOnHover>
        {avatars(3)}
      </AvatarGroup>
      <AvatarGroup data-testid="off" size="lg">
        {avatars(3)}
      </AvatarGroup>
    </div>
  ),
  play: async ({ canvasElement, canvas }) => {
    const on = canvasElement.querySelector('[data-testid="on"]')!;
    const off = canvasElement.querySelector('[data-testid="off"]')!;
    const onSecond = on.querySelectorAll<HTMLElement>('[data-avatar-group-item]')[1];
    const offSecond = off.querySelectorAll<HTMLElement>('[data-avatar-group-item]')[1];
    // expandOnHover のときだけ、hover で退けるための margin-left の移り変わりを持つ
    await expect(getComputedStyle(onSecond).transitionProperty).toContain('margin-left');
    await expect(getComputedStyle(offSecond).transitionProperty).not.toContain('margin-left');
    // どちらも重なりの量は同じ（既定の overlap="md"）
    await expect(getComputedStyle(onSecond).marginLeft).toBe(
      getComputedStyle(offSecond).marginLeft
    );
    // 見た目の仕込みが違うだけで、読み上げの名前（alt・name）は expandOnHover の有無で変わらない
    const names = canvas.getAllByText('かずえもん');
    await expect(names).toHaveLength(2);
  },
};

export const MoreFollowsFirstSize: Story = {
  name: '「+N」の大きさは先頭の子に合わせる',
  parameters: { controls: { disable: true } },
  render: () => (
    <AvatarGroup max={2}>
      <Avatar name="かずえもん" size="xl" />
      <Avatar name="宮本一也" size="xl" />
      <Avatar name="山田太郎" size="xl" />
    </AvatarGroup>
  ),
  play: async ({ canvasElement }) => {
    const items = canvasElement.querySelectorAll('[data-avatar-group-item]');
    const first = items[0];
    const more = items[items.length - 1];
    await expect(more.getBoundingClientRect().width).toBe(first.getBoundingClientRect().width);
  },
};
