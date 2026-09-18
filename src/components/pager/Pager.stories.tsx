import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect } from 'storybook/test';

import { Pager } from './Pager';
import { Icon } from '../icon/Icon';
import { DensityPair, Specimen } from '../../stories/story-parts';
import { type PreviewState, sourceCode, statePseudo } from '../../stories/story-states';

const prev = { href: '#prev', title: 'トークンの決め方' };
const next = { href: '#next', title: 'カードの押し心地を詰める' };

const longPrev = {
  href: '#prev',
  title: 'デザインを、候補を並べて選ぶループで決めるようにした話',
};
const longNext = {
  href: '#next',
  title: '密度を入力方式で切り替えると、マウスと指のどちらにも合う部品になる',
};

// 幅を決めた枠（記事の下に置いたところ）。狭い幅で縦に積むところは Narrow で見る
const frame = (children: ReactNode) => <div className="max-w-[40rem]">{children}</div>;

const appearances = ['card', 'text'] as const;

const stateRows: { label: string; state?: PreviewState }[] = [
  { label: '通常' },
  { label: 'hover', state: 'hover' },
  { label: '押下', state: 'active' },
  { label: 'フォーカス（キーボード）', state: 'focus' },
];

const meta = {
  title: 'Components/Pager',
  component: Pager,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '記事の前後へ移るナビです。ブログ記事の下に置き、前の記事と次の記事の 2 つの行き先を並べます。',
          '',
          '- `prev`・`next` に `{ href, title }` を渡します。`title` は記事の題、`label` は題の上の小さい見出しです（既定は「前の記事」「次の記事」）。',
          '- `appearance` は見た目です。`card`（既定）は押せるカードと同じ面で、`text` は面も枠線もない、矢印付きの文字のリンクです。`text` の押せる範囲は矢印と文字の幅だけで、左右に寄せた空きでは反応しません。',
          '- 文字の外側のアイコンは、既定では外向きの矢印（← →）です。`prev`・`next` の `icon` に `<Icon icon={…} />` を渡すと差し替えられます。置き場所（前は左、次は右）は変わりません。',
          '- 片方だけ渡すと、その行き先だけを出します。`keepSpace`（既定 `true`）は、もう片方の場所を空けて位置を保ちます。`false` にすると、1 つのときは幅いっぱいに広がります。',
          '- Next.js の `Link` などは、行き先の `render` に渡します（`href` は渡す要素に書きます）。',
          '- `label` は並び（`nav`）の読み上げの名前です（既定は「前後の記事」）。ページの中に並びが複数あるときに見分けられます。',
          '- 置いた場所の幅が狭いときは、2 つを縦に積みます。画面の幅ではなく、置いた場所の幅で決めます。',
          '- ページ番号を並べる部品ではありません。行き先は前と次の 2 つだけです。',
        ].join('\n'),
      },
    },
  },
  args: { prev, next, appearance: 'card', keepSpace: true },
  argTypes: {
    appearance: {
      control: 'inline-radio',
      options: appearances,
      table: { defaultValue: { summary: "'card'" } },
    },
    label: { control: 'text', table: { defaultValue: { summary: "'前後の記事'" } } },
    keepSpace: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    prev: { control: 'object' },
    next: { control: 'object' },
  },
} satisfies Meta<typeof Pager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      source: sourceCode(`
        <Pager
          prev={{ href: '/blog/tokens', title: 'トークンの決め方' }}
          next={{ href: '/blog/card', title: 'カードの押し心地を詰める' }}
        />
      `),
    },
  },
  render: (args) => frame(<Pager {...args} />),
};

// 状態（原則3）。hover・押下・フォーカスは、前の行き先にだけ当てて、通常の次の行き先と並べて見る
const statePseudoTargets = statePseudo({
  hover: '[data-slot="pager-item"][data-direction="prev"]',
  active: '[data-slot="pager-item"][data-direction="prev"]',
  focusVisible: '[data-slot="pager-item"][data-direction="prev"]',
});

export const States: Story = {
  tags: ['visual'],
  name: '状態（card）',
  parameters: {
    controls: { exclude: ['appearance'] },
    pseudo: statePseudoTargets,
    docs: {
      description: {
        story: '押せるカードと同じ面です。hover で面と輪郭が変わり、押すと沈みます。',
      },
    },
  },
  render: (args) => (
    <div className="flex max-w-[40rem] flex-col gap-6">
      {stateRows.map((row) => (
        <Specimen key={row.label} label={row.label}>
          <div data-preview={row.state}>
            <Pager {...args} appearance="card" />
          </div>
        </Specimen>
      ))}
    </div>
  ),
};

// 文字のリンクの見た目。押せる範囲は矢印と文字の幅だけ（点線は置いた場所の幅）
export const TextStates: Story = {
  tags: ['visual'],
  name: '状態（text）',
  parameters: {
    controls: { exclude: ['appearance'] },
    pseudo: statePseudoTargets,
    docs: {
      description: {
        story:
          '面も枠線もない、矢印付きの文字のリンクです。hover で題の下線が濃くなり、押すと沈みます。押せる範囲は矢印と文字の幅だけで、左右に寄せた空き（点線の中の余り）では反応しません。',
      },
    },
  },
  render: (args) => (
    <div className="flex max-w-[40rem] flex-col gap-6">
      {stateRows.map((row) => (
        <Specimen key={row.label} label={row.label}>
          <div data-preview={row.state} className="rounded-card border border-dashed border-line">
            <Pager {...args} appearance="text" />
          </div>
        </Specimen>
      ))}
    </div>
  ),
};

// 片方だけのとき。keepSpace でもう片方の場所を空けるかを選ぶ
export const OneSide: Story = {
  tags: ['visual'],
  name: '片方だけ',
  parameters: {
    controls: { exclude: ['keepSpace'] },
    docs: {
      description: {
        story:
          '最初の記事には前がなく、最後の記事には次がありません。`keepSpace`（既定 `true`）は、もう片方の場所を空けて位置を保ちます。',
      },
    },
  },
  render: (args) => (
    <div className="flex max-w-[40rem] flex-col gap-6">
      <Specimen label="次だけ・場所を空ける（keepSpace: true）">
        <Pager {...args} prev={undefined} keepSpace />
      </Specimen>
      <Specimen label="前だけ・場所を空ける（keepSpace: true）">
        <Pager {...args} next={undefined} keepSpace />
      </Specimen>
      <Specimen label="次だけ・幅いっぱい（keepSpace: false）">
        <Pager {...args} prev={undefined} keepSpace={false} />
      </Specimen>
      <Specimen label="前だけ・幅いっぱい（keepSpace: false）">
        <Pager {...args} next={undefined} keepSpace={false} />
      </Specimen>
    </div>
  ),
};

// アイコンの差し替え（icon）。置き場所は変わらない
export const Icons: Story = {
  tags: ['visual'],
  name: 'アイコンの差し替え',
  parameters: {
    docs: {
      description: {
        story:
          '既定は外向きの矢印（← →）です。`prev`・`next` の `icon` に `<Icon icon={…} />` を渡すと差し替えられます。',
      },
      source: sourceCode(`
        <Pager
          prev={{
            href: '/blog/tokens',
            title: 'トークンの決め方',
            icon: <Icon icon={CaretLeftIcon} size="control" />,
          }}
          next={{
            href: '/blog/card',
            title: 'カードの押し心地を詰める',
            icon: <Icon icon={CaretRightIcon} size="control" />,
          }}
        />
      `),
    },
  },
  render: (args) => (
    <div className="flex max-w-[40rem] flex-col gap-6">
      <Specimen label="既定（← →）">
        <Pager {...args} />
      </Specimen>
      <Specimen label="差し替え（‹ ›）">
        <Pager
          {...args}
          prev={{ ...prev, icon: <Icon icon={CaretLeftIcon} size="control" /> }}
          next={{ ...next, icon: <Icon icon={CaretRightIcon} size="control" /> }}
        />
      </Specimen>
    </div>
  ),
};

export const LongTitles: Story = {
  tags: ['visual'],
  name: '題が長いとき',
  parameters: {
    docs: {
      description: {
        story: '長い題は折り返します。前後の高さは、背の高いほうにそろいます。',
      },
    },
  },
  args: { prev: longPrev, next: longNext },
  render: (args) => frame(<Pager {...args} />),
};

// 置いた場所の幅が狭いときは縦に積む（原則11: 構造は置いた場所の幅で決める）
export const Narrow: Story = {
  tags: ['visual'],
  name: '狭いとき',
  parameters: {
    docs: {
      description: {
        story:
          '置いた場所が狭いと、2 つを縦に積みます。画面の幅ではなく、置いた場所の幅で決めます。',
      },
    },
  },
  render: (args) => (
    <div className="flex flex-wrap items-start gap-8">
      <Specimen label="幅 320px">
        <div className="w-[320px]">
          <Pager {...args} />
        </div>
      </Specimen>
      <Specimen label="幅 320px・次だけ">
        <div className="w-[320px]">
          <Pager {...args} prev={undefined} />
        </div>
      </Specimen>
    </div>
  ),
};

export const Densities: Story = {
  tags: ['visual'],
  name: '密度',
  render: (args) => (
    <DensityPair>
      <div className="w-[26rem]">
        <Pager {...args} />
      </div>
    </DensityPair>
  ),
};

// 読み上げ: 並びの名前と、リンクの名前（小さい見出しと題の両方が入る）
export const Accessibility: Story = {
  name: '読み上げ',
  render: (args) => frame(<Pager {...args} />),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation', { name: '前後の記事' })).toBeVisible();
    const prevLink = canvas.getByRole('link', { name: /前の記事/ });
    await expect(prevLink).toHaveAccessibleName(/前の記事/);
    await expect(prevLink).toHaveAccessibleName(/トークンの決め方/);
    await expect(prevLink).toHaveAttribute('href', '#prev');
    const nextLink = canvas.getByRole('link', { name: /次の記事/ });
    await expect(nextLink).toHaveAccessibleName(/次の記事/);
    await expect(nextLink).toHaveAccessibleName(/カードの押し心地を詰める/);
  },
};
