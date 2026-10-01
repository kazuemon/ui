import type { Meta, StoryObj } from '@storybook/react-vite';

import { type Candidate, type Column, Comparison } from './Comparison';
import { Card, CardBody } from '../../src/components/card/Card';
import { Heading } from '../../src/components/heading/Heading';
import { Text } from '../../src/components/text/Text';
import { statePseudo } from '../../src/stories/story-states';

// 軸 413: onClick で button として描く押せるカードと、選んでいる見た目（selected）
const meta = {
  title: 'Design Review/413 押すカードと選んでいる見た目',
  id: 'design-review-413-card-selected',
  parameters: {
    layout: 'fullscreen',
    pseudo: statePseudo({
      hover: '[data-slot="card"]',
      active: '[data-slot="card"]',
      focusVisible: '[data-slot="card"]',
    }),
  },
  args: { pick: 'A,C' },
  argTypes: {
    pick: {
      description: '採用した案（ADR の比較画像用）',
      control: 'inline-radio',
      options: ['A,C', '', 'current', 'A', 'B', 'C', 'D'],
    },
  },
} satisfies Meta<{ pick: string }>;
export default meta;
type Story = StoryObj<{ pick: string }>;

const selectedHover = (fill: string) => `color-mix(in oklab, ${fill}, var(--color-primary) 6%)`;

const candidates: Candidate[] = [
  {
    id: '現行版',
    name: '選んでいる見た目なし',
    intent:
      'いまのカードには選んでいる形がない。押せるカードの見た目（薄い影・hover で淡く塗る・押すと沈む）だけ。比べるための基準',
    spec: [
      ['線', 'なし'],
      ['面', '白のまま'],
    ],
    tokens: {
      '--card-selected-line': 'transparent',
      '--card-selected-line-width': '0px',
      '--card-selected-fill': 'var(--color-surface)',
      '--card-selected-fill-hover': 'var(--card-fill-hover)',
    },
  },
  {
    id: 'A',
    name: '淡い青の面＋青い線',
    intent:
      '選んだカードの面を淡い青（primary の淡い面）で塗り、輪郭の上に青い 2px の線を重ねる。塗りで「選んだ」を伝え、線で広い面の範囲をはっきりさせる',
    spec: [
      ['線', '青（primary）2px'],
      ['面', '淡い青（primary-subtle）'],
      ['hover の面', '淡い青に青を 6% 混ぜる'],
    ],
    tokens: {
      '--card-selected-line': 'var(--color-primary)',
      '--card-selected-line-width': 'var(--border-width-thick)',
      '--card-selected-fill': 'var(--color-primary-subtle)',
      '--card-selected-fill-hover': selectedHover('var(--color-primary-subtle)'),
    },
  },
  {
    id: 'B',
    name: '淡い青の面だけ',
    intent:
      '線は足さず、面だけを淡い青で塗る。フォーカスとエラーは枠線、選んでいることは塗り、という表し方の分け方にいちばん素直な形',
    spec: [
      ['線', 'なし（輪郭はそのまま）'],
      ['面', '淡い青（primary-subtle）'],
      ['hover の面', '淡い青に青を 6% 混ぜる'],
    ],
    tokens: {
      '--card-selected-line': 'transparent',
      '--card-selected-line-width': '0px',
      '--card-selected-fill': 'var(--color-primary-subtle)',
      '--card-selected-fill-hover': selectedHover('var(--color-primary-subtle)'),
    },
  },
  {
    id: 'C',
    name: '青い線だけ',
    intent:
      '面は白のまま、輪郭の上に青い 2px の線を重ねる。画像のあるカードでも面の色が変わらない。キーボードのフォーカスの線と形が近い',
    spec: [
      ['線', '青（primary）2px'],
      ['面', '白のまま'],
    ],
    tokens: {
      '--card-selected-line': 'var(--color-primary)',
      '--card-selected-line-width': 'var(--border-width-thick)',
      '--card-selected-fill': 'var(--color-surface)',
      '--card-selected-fill-hover': 'var(--card-fill-hover)',
    },
  },
  {
    id: 'D',
    name: '濃紺の線だけ',
    intent:
      '色を持たない部品の色（濃紺）で 2px の線を重ねる。色を指定しないとグレー・濃紺、という決まりに合わせた形',
    spec: [
      ['線', '濃紺（本文の色）2px'],
      ['面', '白のまま'],
    ],
    tokens: {
      '--card-selected-line': 'var(--color-fg)',
      '--card-selected-line-width': 'var(--border-width-thick)',
      '--card-selected-fill': 'var(--color-surface)',
      '--card-selected-fill-hover': 'var(--card-fill-hover)',
    },
  },
];

const columns: Column[] = [
  { label: '選んでいない', note: 'onClick で button として描く' },
  { label: 'hover', preview: 'hover' },
  { label: '選んでいる' },
  { label: '選んでいる・hover', preview: 'hover' },
  { label: '選んでいる・押下', preview: 'active' },
  { label: '選んでいる・フォーカス', note: 'キーボード', preview: 'focus' },
  { label: '並べたとき', note: '3 枚のうち真ん中を選ぶ' },
];

const Plan = ({ name, price, selected }: { name: string; price: string; selected?: boolean }) => (
  <Card onClick={() => {}} selected={selected}>
    <CardBody>
      <Heading level={3} size="md">
        {name}
      </Heading>
      <Text size="sm" variant="muted">
        {price}
      </Text>
    </CardBody>
  </Card>
);

export const Axis: Story = {
  render: ({ pick }) => (
    <Comparison
      index={413}
      axis="押すカードと選んでいる見た目"
      pick={pick}
      candidates={candidates}
      columns={columns}
      renderCell={(column) =>
        column.label === '並べたとき' ? (
          <div className="flex w-[200px] flex-col gap-3">
            <Plan name="フリー" price="0 円" selected={false} />
            <Plan name="スタンダード" price="月 500 円" selected />
            <Plan name="チーム" price="月 1,500 円" selected={false} />
          </div>
        ) : (
          <div className="w-[180px]">
            <Plan
              name="スタンダード"
              price="月 500 円"
              selected={column.label.startsWith('選んでいる')}
            />
          </div>
        )
      }
    >
      <p>
        決定: 選んでいる見た目は A（淡い面＋線）を既定にし、C（線だけ）も選べる。色は primary
        などを指定できる。ユーザーの返事「ユーザーの考え次第ですが、デフォAでCも選べる、色は primary
        など指定可能、かなと。」。候補の見た目は、トークンを畳む前のこのコミットで比べられます。
      </p>
      <p>
        Card に onClick を渡すと、href がなければカード全体が 1
        つのボタン（button）になります。見た目は href のカードと同じ浮いた押すもの（薄い影・hover
        で淡く塗る・押すと沈む）です。
      </p>
      <p>
        あわせて selected を足し、選んでいるカードを見分けられるようにします。button
        のときは、読み上げに押している状態（aria-pressed）として伝えます。選ぶのは、選んでいるときの線と面の塗りです。線は輪郭の上に重ねるので、カードの寸法は変わりません。
      </p>
    </Comparison>
  ),
};
