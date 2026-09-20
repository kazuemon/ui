import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { DescriptionItem, DescriptionList } from './DescriptionList';
import { Link } from '../link/Link';
import { Tag } from '../tag/Tag';
import { DensityPair, Gallery, Specimen } from '../../stories/story-parts';

const layouts = ['horizontal', 'stacked'] as const;
const dividers = ['none', 'line', 'framed', 'leader-dotted', 'leader-solid'] as const;
const termAligns = ['start', 'end'] as const;
const termStyles = ['default', 'label'] as const;

const meta = {
  title: 'Components/DescriptionList',
  component: DescriptionList,
  subcomponents: { DescriptionItem },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '用語と説明の組です。経歴・技術・メタ情報のような「名前と値」を並べます。押せません。',
          '',
          '- 1 組を `DescriptionItem` で書きます。`term` が用語（dt）、`children` が説明（dd）になります。',
          '- `layout` で並びを選びます。`horizontal` は用語を左の列に置き、`stacked` は用語の下に説明を置きます。狭い画面では `stacked` にします。',
          '- `termWidth` で用語の列の幅を変えられます（`horizontal` のときだけ効きます）。用語が長いときに広げます。`termAlign="end"` にすると、用語を列の右へ寄せます。',
          '- `termStyle="label"` にすると、用語が入力欄のラベルと同じ見た目（14px・太字）になります。用語より説明を読ませたいときに使います。',
          '- `divider` で組の区切りを選びます。`none` は余白だけ、`line` は行のあいだの細い線、`framed` は外枠と行のあいだの線、`leader-dotted` は用語の右から説明までをつなぐ薄い点線、`leader-solid` は同じ位置の細い実線です（どちらも `horizontal` のときだけ引きます）。',
          '- 説明には、文字のほかに Tag や Link のような部品も置けます。',
        ].join('\n'),
      },
    },
  },
  args: { layout: 'horizontal', divider: 'none' },
  argTypes: {
    layout: {
      control: 'inline-radio',
      options: layouts,
      table: { defaultValue: { summary: "'horizontal'" } },
    },
    divider: {
      control: 'inline-radio',
      options: dividers,
      table: { defaultValue: { summary: "'none'" } },
    },
    termAlign: {
      control: 'inline-radio',
      options: termAligns,
      table: { defaultValue: { summary: "'start'" } },
    },
    termStyle: {
      control: 'inline-radio',
      options: termStyles,
      table: { defaultValue: { summary: "'default'" } },
    },
    termWidth: { control: 'text' },
  },
  render: (args) => (
    <DescriptionList {...args}>
      <DescriptionItem term="所属">フリーランス</DescriptionItem>
      <DescriptionItem term="職種">フロントエンドエンジニア</DescriptionItem>
      <DescriptionItem term="拠点">東京</DescriptionItem>
    </DescriptionList>
  ),
  decorators: [
    (Story) => (
      <div className="w-full max-w-[420px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DescriptionList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
};

export const Layouts: Story = {
  tags: ['visual'],
  name: '並び',
  decorators: [
    (Story) => (
      <div className="w-[760px] max-w-none">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Gallery columnWidth="20rem">
      {layouts.map((layout) => (
        <Specimen key={layout} label={layout}>
          <DescriptionList layout={layout}>
            <DescriptionItem term="所属">フリーランス</DescriptionItem>
            <DescriptionItem term="職種">フロントエンドエンジニア</DescriptionItem>
            <DescriptionItem term="はじめた年">2019 年</DescriptionItem>
          </DescriptionList>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Dividers: Story = {
  tags: ['visual'],
  name: '区切り',
  decorators: [
    (Story) => (
      <div className="w-[1000px] max-w-none">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Gallery columnWidth="20rem">
      {dividers.map((divider) => (
        <Specimen key={divider} label={divider}>
          <DescriptionList divider={divider}>
            <DescriptionItem term="所属">フリーランス</DescriptionItem>
            <DescriptionItem term="職種">フロントエンドエンジニア</DescriptionItem>
            <DescriptionItem term="拠点">東京</DescriptionItem>
          </DescriptionList>
        </Specimen>
      ))}
    </Gallery>
  ),
};

export const Terms: Story = {
  tags: ['visual'],
  name: '用語の見せ方',
  parameters: {
    docs: {
      description: {
        story:
          '`termStyle` は用語の文字、`termAlign` は用語の列の中での寄せ方です。`termAlign` は横に並べたときだけ効きます。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[1000px] max-w-none">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Gallery columnWidth="22rem">
      {termStyles.map((termStyle) =>
        termAligns.map((termAlign) => (
          <Specimen key={`${termStyle}-${termAlign}`} label={`${termStyle} / ${termAlign}`}>
            <DescriptionList termStyle={termStyle} termAlign={termAlign}>
              <DescriptionItem term="所属">フリーランス</DescriptionItem>
              <DescriptionItem term="職種">フロントエンドエンジニア</DescriptionItem>
              <DescriptionItem term="はじめた年">2019 年</DescriptionItem>
            </DescriptionList>
          </Specimen>
        ))
      )}
    </Gallery>
  ),
};

export const Contents: Story = {
  tags: ['visual'],
  name: '説明に部品を置く',
  parameters: {
    docs: {
      description: {
        story:
          '説明には Tag や Link も置けます。用語が長いときは `termWidth` で列を広げます。折り返した説明は、用語の列に回り込みません。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[520px] max-w-none">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <DescriptionList termWidth="7rem">
      <DescriptionItem term="使用技術">
        <div className="flex flex-wrap gap-2">
          <Tag color="primary">TypeScript</Tag>
          <Tag color="primary">React</Tag>
          <Tag color="primary">Tailwind CSS</Tag>
        </div>
      </DescriptionItem>
      <DescriptionItem term="リポジトリ">
        <Link href="https://example.com">github.com/kazuemon/ui</Link>
      </DescriptionItem>
      <DescriptionItem term="担当">
        デザインシステムの設計と、部品の実装をひとりで進めています。長い説明でも、用語の列に回り込まずに折り返します。
      </DescriptionItem>
    </DescriptionList>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  decorators: [
    (Story) => (
      <div className="w-[760px] max-w-none">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <DensityPair>
      <div className="w-[320px]">
        <DescriptionList divider="line">
          <DescriptionItem term="所属">フリーランス</DescriptionItem>
          <DescriptionItem term="職種">フロントエンドエンジニア</DescriptionItem>
        </DescriptionList>
      </div>
    </DensityPair>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  render: () => (
    <>
      <DescriptionList>
        <DescriptionItem term="所属">フリーランス</DescriptionItem>
        <DescriptionItem term="職種">フロントエンドエンジニア</DescriptionItem>
        <DescriptionItem term="拠点">東京</DescriptionItem>
      </DescriptionList>
      <DescriptionList divider="leader-dotted">
        <DescriptionItem term="所属">フリーランス</DescriptionItem>
      </DescriptionList>
    </>
  ),
  play: async ({ canvasElement }) => {
    const list = canvasElement.querySelector('dl[data-slot="description-list"]');
    await expect(list).not.toBeNull();
    // 1 組は dt と dd の 2 つ。組ごとに div で包み、dl の直下に並べる
    const items = list?.querySelectorAll(':scope > [data-slot="description-item"]') ?? [];
    await expect(items).toHaveLength(3);
    const terms = list?.querySelectorAll('dt') ?? [];
    const details = list?.querySelectorAll('dd') ?? [];
    await expect(terms).toHaveLength(3);
    await expect(details).toHaveLength(3);
    // 読み上げの順は見た目の順。用語のすぐ次にその説明が来る
    await expect(terms[0]).toHaveTextContent('所属');
    await expect(details[0]).toHaveTextContent('フリーランス');
    await expect(terms[0].nextElementSibling).toBe(details[0]);
    // つなぐ線（leader-*）は ::after で引くので、読み上げの並びは変わらない
    const leaderList = canvasElement.querySelectorAll('dl[data-slot="description-list"]')[1];
    const leaderTerm = leaderList.querySelector('dt');
    await expect(leaderTerm?.nextElementSibling).toBe(leaderList.querySelector('dd'));
  },
};
