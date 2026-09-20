import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { HeadingAnchor } from './HeadingAnchor';
import { Heading } from '../heading/Heading';
import { Prose } from '../prose/Prose';
import { Text } from '../text/Text';
import { HashIcon } from '../../internal/icons';
import { DensityPair, Gallery, Matrix, Specimen } from '../../stories/story-parts';
import { type MatrixColumn, statePseudo } from '../../stories/story-states';

const meta = {
  title: 'Components/HeadingAnchor',
  component: HeadingAnchor,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '見出しに付く、ページ内のその場所へのリンクです。見出し（`Heading` や `Prose` の中の `h2` など）の中に置き、見出しの `id` を `href` で指します。',
          '',
          '```tsx',
          '<Heading id="usage">',
          '  使い方',
          '  <HeadingAnchor href="#usage" />',
          '</Heading>',
          '```',
          '',
          '- 見出しに `id` を付けるのは、使う側の仕事です。`href` は `#` に `id` をつないだ文字列です。',
          '- `reveal` は現れ方です。既定の `hover` は、見出しに hover したときとキーボードでフォーカスしたときだけ現します。隠しているあいだも Tab では止まり、止まると現れます。`always` はふだんから見せます。指で操作しているときは hover がないので、どちらでもいつも見えます。',
          '- `placement` は置き場所です。既定の `end` は文字の後ろで、見出しの最後の子に置きます。`start` は見出しの左の余白へ張り出し、見出しの最初の子に置きます。左に余白がないと切れます。',
          '- 印の形は `mark` で選びます。既定の `link` は鎖で、`hash` は井げたです。`children` にアイコンを渡すと、それに置き換えます。大きさは見出しの文字に合わせます。',
          '- 見出しの名前は「見出しの文字 + `label`」と読み上げられます。`label` は見出しの文字を含めない短い文にします。',
          '- 押せる範囲は、印とその周りだけです。見出しの文字は押せません。',
        ].join('\n'),
      },
    },
  },
  args: { href: '#usage' },
  argTypes: {
    reveal: {
      control: 'inline-radio',
      options: ['hover', 'always'],
      table: { defaultValue: { summary: "'hover'" } },
    },
    placement: {
      control: 'inline-radio',
      options: ['end', 'start'],
      table: { defaultValue: { summary: "'end'" } },
    },
    mark: {
      control: 'inline-radio',
      options: ['link', 'hash'],
      table: { defaultValue: { summary: "'link'" } },
    },
    label: { control: 'text' },
    children: { control: false },
  },
} satisfies Meta<typeof HeadingAnchor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  render: (args) => (
    <div className="flex max-w-[28rem] flex-col gap-2 pl-8" data-reading="">
      <Heading id="usage">
        {args.placement === 'start' && <HeadingAnchor {...args} />}
        使い方
        {args.placement !== 'start' && <HeadingAnchor {...args} />}
      </Heading>
      <Text>見出しにマウスを載せると、リンクの印が現れます。</Text>
    </div>
  ),
};

const stateColumns: MatrixColumn[] = [
  { label: '通常' },
  { label: '見出しに hover', state: 'hover' },
  { label: '印に hover', state: 'active' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
];

// 現れ方 × 状態。hover の列は見出しに、印に hover の列は印に hover を当てる
// 隠している（hover）見出しは、ふだんは何も見えない。見出しに hover・フォーカスで現れる
export const States: Story = {
  tags: ['visual'],
  name: '現れ方と状態',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '上が `reveal="hover"`（既定）、下が `reveal="always"` です。「印に hover」は、印の色が Primary になります。',
      },
    },
    pseudo: {
      ...statePseudo({ hover: 'h2', focusVisible: 'a[data-slot="heading-anchor"]' }),
      // 印に hover の列は、印に当てる
      hover: [
        '[data-preview="hover"] h2',
        '[data-preview="active"] h2',
        '[data-preview="active"] a[data-slot="heading-anchor"]',
      ],
    },
  },
  render: () => (
    <Matrix
      rows={['hover', 'always'] as const}
      columns={stateColumns}
      rowLabel={(reveal) => `reveal="${reveal}"`}
      columnWidth="12rem"
      renderCell={(reveal) => (
        <Heading level={2} className="pr-2" data-reading="">
          使い方
          <HeadingAnchor href="#usage" reveal={reveal} />
        </Heading>
      )}
    />
  ),
};

// 4 段の見出しに付けたときの、印の大きさ・縦の位置。長い見出しが折り返しても、印は最後の行の終わりに付く
export const Levels: Story = {
  tags: ['visual'],
  name: '見出しの段と折り返し',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '印の大きさは見出しの文字に比例します。長い見出しが折り返すときは、最後の行の終わりに付きます。',
      },
    },
  },
  render: () => (
    <div className="flex max-w-[24rem] flex-col gap-4 pl-8" data-reading="">
      {([1, 2, 3, 4] as const).map((level) => (
        <Heading key={level} level={level}>
          {level} 段目の見出し
          <HeadingAnchor href="#usage" reveal="always" />
        </Heading>
      ))}
      <Heading level={3}>
        見出しが長くて、二行に折り返すときは最後の行の終わりに付きます
        <HeadingAnchor href="#usage" reveal="always" />
      </Heading>
    </div>
  ),
};

// 左の余白へ張り出す形と、印の差し替え
export const Variants: Story = {
  tags: ['visual'],
  name: '置き場所と印',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`placement="start"` は見出しの左の余白へ張り出し、文字の位置は動きません。`mark="hash"` は印を井げたにします。`children` に別のアイコンを渡すと、印を置き換えます。',
      },
    },
  },
  render: () => (
    <Gallery>
      <Specimen label='placement="start"（左に余白のある記事）'>
        <div className="pl-10" data-reading="">
          <Heading level={2}>
            <HeadingAnchor href="#usage" reveal="always" placement="start" />
            使い方
          </Heading>
        </div>
      </Specimen>
      <Specimen label='mark="hash"（井げた）'>
        <Heading level={2} data-reading="">
          使い方
          <HeadingAnchor href="#usage" reveal="always" mark="hash" />
        </Heading>
      </Specimen>
      <Specimen label="印を差し替える（children）">
        <Heading level={2} data-reading="">
          使い方
          <HeadingAnchor href="#usage" reveal="always">
            <HashIcon />
          </HeadingAnchor>
        </Heading>
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
      description: {
        story:
          '左がマウス、右が指です。マウスでは `reveal="hover"` の印はふだん見えませんが、指では hover がないので、いつも見えます。',
      },
    },
  },
  render: () => (
    <DensityPair>
      <div className="flex w-[22rem] flex-col gap-3">
        <Heading level={2}>
          使い方
          <HeadingAnchor href="#usage" />
        </Heading>
        <Heading level={2}>
          いつも見せる
          <HeadingAnchor href="#usage" reveal="always" />
        </Heading>
      </div>
    </DensityPair>
  ),
};

// Prose の中の見出し。Prose の中の a の見た目（Primary の青・下線）にはならない
export const InProse: Story = {
  name: 'Prose の中',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`Prose` の中の見出しに置いても、文字のリンクの下線や色にはならず、印だけが付きます。',
      },
    },
  },
  render: () => (
    <Prose className="max-w-[720px]">
      <h2 id="usage">
        使い方
        <HeadingAnchor href="#usage" />
      </h2>
      <p>本文の段落です。見出しにマウスを載せると、リンクの印が現れます。</p>
      <h3 id="setup">
        セットアップ
        <HeadingAnchor href="#setup" />
      </h3>
      <p>本文の段落です。</p>
    </Prose>
  ),
};

export const Accessibility: Story = {
  name: '読み上げ',
  args: { href: '#usage' },
  render: (args) => (
    <Heading id="usage" data-reading="">
      使い方
      <HeadingAnchor {...args} />
    </Heading>
  ),
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'このセクションへのリンク' });
    await expect(link).toHaveAttribute('href', '#usage');
    // 隠しているあいだも、キーボードで止まれる（見えなくても読み上げには残る）
    await expect(link).not.toHaveAttribute('tabindex', '-1');
    // 見出しの名前は、見出しの文字とリンクの名前を合わせたもの
    await expect(
      canvas.getByRole('heading', { name: '使い方 このセクションへのリンク' })
    ).toBeVisible();
  },
};
