import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import { Text } from '../text/Text';
import { ScrollArea } from './ScrollArea';
import { TagRow, TopicCard } from './story-scenes';
import { Gallery, Specimen } from '../../stories/story-parts';
import { sourceCode, statePseudo } from '../../stories/story-states';

const meta = {
  title: 'Components/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          '決まった大きさの枠の中で、中身をスクロールさせます。カードの中の長い一覧や、Dialog の中の長い文に使います。',
          '',
          '- 高さ（`h-*`・`max-h-*`）か幅を `className` で決めます。はみ出した分がスクロールします。',
          '- 続きがあることは、端に落ちる内側の影で見せます。影はスクロールした量に合わせて濃くなります。横にスクロールするときは左右の端にも出ます。',
          '- つまみは中身の上に重なり、枠にマウスを載せたときと、スクロールしているあいだに出ます。`scrollbar="always"` にすると、いつも出ます。見えているつまみが、そのままつかめる範囲です。つまみに載せると内側へ太くなり、太くなった姿がそのままつかめる範囲になります。',
          '- 影が合わない場所（影を落とす余白がない面など）では `edgeShadow={false}` にします。影の代わりに、つまみをいつも出します。',
          '- スクロールできるときだけ、キーボードの Tab で枠に止まり、矢印キーでスクロールできます。`label` を付けると、止まったときに枠の名前が読み上げられます。',
          '- 内側の余白は `contentClassName` に付けます。',
        ].join('\n'),
      },
    },
  },
  args: {
    label: '更新の記録',
    className: 'h-[160px] w-[280px]',
    edgeShadow: true,
    scrollbar: 'scroll',
  },
  argTypes: {
    edgeShadow: { control: 'boolean' },
    scrollbar: { control: 'inline-radio', options: ['scroll', 'always'] },
    label: { control: 'text' },
    className: { control: 'text' },
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const log = [
  '9月18日 ScrollArea を足しました',
  '9月17日 見た目の回帰テストを CI で走らせるようにしました',
  '9月16日 シートをはじいて閉じる動きを直しました',
  '9月15日 Tooltip の面を決めました',
  '9月14日 Dialog の角と大きさを決めました',
  '9月13日 コードの色分けを決めました',
  '9月12日 デザインキャンバスを終えました',
];

export const Playground: Story = {
  name: '基本',
  parameters: {
    docs: {
      source: sourceCode(`
        <ScrollArea label="更新の記録" className="h-[160px] w-[280px]">
          <ul>…</ul>
        </ScrollArea>
      `),
    },
  },
  render: (args) => (
    <ScrollArea {...args}>
      <ul className="flex flex-col gap-2">
        {log.map((line) => (
          <li key={line}>
            <Text size="sm">{line}</Text>
          </li>
        ))}
      </ul>
    </ScrollArea>
  ),
};

// スクロールの位置ごとの端の影と、つまみの出方。hover とフォーカスは固定して描く
export const Positions: Story = {
  tags: ['visual'],
  name: 'スクロールの位置と状態',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '上の端では下にだけ、途中では上下に、下の端では上にだけ影が出ます。つまみは、マウスを載せたときとキーボードで止まったときに出ます。つまみそのものに載せると、内側へ太くなります。',
      },
    },
    // 「つまみに載せたとき」は、枠とつまみの両方に hover を当てる
    pseudo: {
      ...statePseudo({
        hover: '[data-slot="scroll-area"]',
        focusVisible: '[data-slot="scroll-area-viewport"]',
      }),
      hover: [
        '[data-preview="hover"] [data-slot="scroll-area"]',
        '[data-preview="thumb"] [data-slot="scroll-area"]',
        '[data-preview="thumb"] [data-slot="scroll-area-thumb"]',
      ],
    },
  },
  render: () => (
    <Gallery columnWidth="15rem">
      <Specimen label="上の端">
        <TopicCard position="start" />
      </Specimen>
      <Specimen label="途中">
        <TopicCard position="middle" />
      </Specimen>
      <Specimen label="下の端">
        <TopicCard position="end" />
      </Specimen>
      <Specimen label="マウスを載せたとき">
        <div data-preview="hover">
          <TopicCard position="middle" />
        </div>
      </Specimen>
      <Specimen label="つまみに載せたとき">
        <div data-preview="thumb">
          <TopicCard position="middle" />
        </div>
      </Specimen>
      <Specimen label="フォーカス（キーボード）">
        <div data-preview="focus">
          <TopicCard position="middle" />
        </div>
      </Specimen>
    </Gallery>
  ),
};

export const Options: Story = {
  tags: ['visual'],
  name: '影とつまみの出し方',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '既定では、つまみは動かしたときだけ出ます。`scrollbar="always"` でいつも出します。`edgeShadow={false}` では影を出さず、つまみをいつも出します。',
      },
    },
  },
  render: () => (
    <Gallery columnWidth="15rem">
      <Specimen label="既定（動かしたとき）">
        <TopicCard position="middle" />
      </Specimen>
      <Specimen label='scrollbar="always"'>
        <TopicCard position="middle" options={{ scrollbar: 'always' }} />
      </Specimen>
      <Specimen label="edgeShadow={false}">
        <TopicCard position="middle" options={{ edgeShadow: false }} />
      </Specimen>
    </Gallery>
  ),
};

export const Horizontal: Story = {
  tags: ['visual'],
  name: '横にスクロール',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '横に並ぶものがはみ出すときも、同じ影を左右の端に出します。つまみの分だけ、中身の下を空けておきます。',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <TagRow position="start" />
      <TagRow position="middle" />
      <TagRow position="end" />
    </div>
  ),
};

// 読み上げ: スクロールできる枠は Tab で止まり、名前が付く。スクロールできない枠には止まらない
export const Accessibility: Story = {
  name: '読み上げ',
  render: () => (
    <div className="flex flex-col gap-4">
      <ScrollArea label="更新の記録" className="h-[120px] w-[280px]">
        <ul className="flex flex-col gap-2">
          {log.map((line) => (
            <li key={line}>
              <Text size="sm">{line}</Text>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <ScrollArea label="短い記録" className="h-[120px] w-[280px]">
        <Text size="sm">1 行だけ</Text>
      </ScrollArea>
    </div>
  ),
  play: async ({ canvas }) => {
    const long = canvas.getByRole('region', { name: '更新の記録' });
    await userEvent.tab();
    await expect(long).toHaveFocus();
    await userEvent.tab();
    await expect(long).not.toHaveFocus();
    // スクロールできない枠は Tab で止まらない
    await expect(canvas.getByRole('region', { name: '短い記録' })).toHaveAttribute(
      'tabindex',
      '-1'
    );
  },
};
